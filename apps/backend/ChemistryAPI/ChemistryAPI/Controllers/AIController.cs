using ChemistryAPI.Data;
using ChemistryAPI.Models;
using ChemistryAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChemistryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly GeminiService _geminiService;
    private readonly ChemistryDbContext _context;
    private readonly ILogger<AIController> _logger;

    public AIController(GeminiService geminiService, ChemistryDbContext context, ILogger<AIController> logger)
    {
        _geminiService = geminiService;
        _context = context;
        _logger = logger;
    }

    public record ChatRequest(string Prompt, int? UserId = null, int? ConversationId = null);
    public record ChatResponse(string Response, int ConversationId);
    
    public record CreateConversationRequest(int? UserId, string? Title = null);
    public record ConversationResponse(int Id, string Title, DateTime CreatedAt, DateTime UpdatedAt, int MessageCount);

    /// <summary>
    /// Tạo conversation mới
    /// </summary>
    [HttpPost("conversations")]
    public async Task<IActionResult> CreateConversation([FromBody] CreateConversationRequest request)
    {
        try
        {
            var conversation = new Conversation
            {
                UserId = request.UserId,
                Title = request.Title ?? "Cuộc trò chuyện mới",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();

            return Ok(new ConversationResponse(
                conversation.Id,
                conversation.Title,
                conversation.CreatedAt,
                conversation.UpdatedAt,
                0
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating conversation");
            return StatusCode(500, new { error = "Failed to create conversation", message = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách conversations theo UserId
    /// </summary>
    [HttpGet("conversations/{userId:int}")]
    public async Task<IActionResult> GetConversations(int userId)
    {
        try
        {
            var conversations = await _context.Conversations
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.UpdatedAt)
                .Select(c => new ConversationResponse(
                    c.Id,
                    c.Title,
                    c.CreatedAt,
                    c.UpdatedAt,
                    c.ChatHistories.Count
                ))
                .ToListAsync();

            return Ok(conversations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading conversations");
            return StatusCode(500, new { error = "Failed to load conversations", message = ex.Message });
        }
    }

    /// <summary>
    /// Lấy lịch sử chat của một conversation cụ thể
    /// </summary>
    [HttpGet("history/{userId:int}/{conversationId:int}")]
    public async Task<IActionResult> GetConversationHistory(int userId, int conversationId)
    {
        try
        {
            // Kiểm tra conversation có thuộc về user không
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId);

            if (conversation == null)
            {
                return NotFound(new { error = "Conversation not found" });
            }

            var history = await _context.ChatHistories
                .Where(ch => ch.ConversationId == conversationId)
                .OrderBy(ch => ch.CreatedAt)
                .ToListAsync();

            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading conversation history");
            return StatusCode(500, new { error = "Failed to load conversation history", message = ex.Message });
        }
    }

    /// <summary>
    /// Xóa conversation (sẽ xóa luôn tất cả chat history trong conversation đó)
    /// </summary>
    [HttpDelete("conversations/{conversationId:int}")]
    public async Task<IActionResult> DeleteConversation(int conversationId)
    {
        try
        {
            var conversation = await _context.Conversations.FindAsync(conversationId);
            if (conversation == null)
            {
                return NotFound();
            }

            _context.Conversations.Remove(conversation);
            await _context.SaveChangesAsync(); // Cascade delete sẽ tự động xóa ChatHistories

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting conversation");
            return StatusCode(500, new { error = "Failed to delete conversation", message = ex.Message });
        }
    }

    /// <summary>
    /// Gửi câu hỏi/prompt tới Google Gemini AI và nhận phản hồi (với conversationId)
    /// </summary>
    /// <param name="request">Đối tượng chứa prompt và conversationId</param>
    /// <returns>Phản hồi từ Gemini AI</returns>
    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            return BadRequest(new { error = "Prompt cannot be empty" });
        }

        try
        {
            // Nếu không có ConversationId, tạo conversation mới
            Conversation? conversation = null;
            if (request.ConversationId.HasValue)
            {
                conversation = await _context.Conversations.FindAsync(request.ConversationId.Value);
                if (conversation == null)
                {
                    return NotFound(new { error = "Conversation not found" });
                }
            }
            else
            {
                // Tạo conversation mới
                var title = request.Prompt.Length > 50 
                    ? request.Prompt[..50] + "..." 
                    : request.Prompt;
                
                conversation = new Conversation
                {
                    UserId = request.UserId,
                    Title = title,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Conversations.Add(conversation);
                await _context.SaveChangesAsync();
            }

            // Gọi Gemini API
            var response = await _geminiService.GenerateContentAsync(request.Prompt);

            // Lưu lịch sử chat vào database
            try
            {
                var chatHistory = new ChatHistory
                {
                    UserId = request.UserId,
                    ConversationId = conversation.Id,
                    Prompt = request.Prompt,
                    Response = response,
                    CreatedAt = DateTime.UtcNow
                };

                // Cập nhật UpdatedAt của conversation
                conversation.UpdatedAt = DateTime.UtcNow;

                _context.ChatHistories.Add(chatHistory);
                await _context.SaveChangesAsync();
            }
            catch (Exception dbEx)
            {
                // Log lỗi database nhưng vẫn trả response cho user
                _logger.LogWarning(dbEx, "Failed to save chat history to database");
            }

            return Ok(new ChatResponse(response, conversation.Id));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini API");
            return StatusCode(500, new { error = "Failed to get response from AI", message = ex.Message });
        }
    }

    /// <summary>
    /// Lấy lịch sử chat theo UserId
    /// </summary>
    [HttpGet("history/{userId:int}")]
    public async Task<IActionResult> GetChatHistory(int userId)
    {
        try
        {
            var history = await _context.ChatHistories
                .Where(ch => ch.UserId == userId)
                .OrderByDescending(ch => ch.CreatedAt)
                .ToListAsync();

            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading chat history");
            return StatusCode(500, new { error = "Failed to load chat history", message = ex.Message });
        }
    }

    /// <summary>
    /// Lấy tất cả lịch sử chat (admin)
    /// </summary>
    [HttpGet("history")]
    public async Task<IActionResult> GetAllChatHistory()
    {
        var history = await _context.ChatHistories
            .Include(ch => ch.User)
            .OrderByDescending(ch => ch.CreatedAt)
            .Take(100) // Giới hạn 100 bản ghi gần nhất
            .ToListAsync();

        return Ok(history);
    }

    /// <summary>
    /// Xóa lịch sử chat theo Id
    /// </summary>
    [HttpDelete("history/{id:int}")]
    public async Task<IActionResult> DeleteChatHistory(int id)
    {
        var history = await _context.ChatHistories.FindAsync(id);
        if (history == null)
        {
            return NotFound();
        }

        _context.ChatHistories.Remove(history);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Health check endpoint để kiểm tra Gemini API có hoạt động không
    /// </summary>
    [HttpGet("health")]
    public async Task<IActionResult> HealthCheck()
    {
        try
        {
            var response = await _geminiService.GenerateContentAsync("Say hello");
            return Ok(new { status = "healthy", message = "Gemini API is working", sampleResponse = response });
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { status = "unhealthy", error = ex.Message });
        }
    }
}


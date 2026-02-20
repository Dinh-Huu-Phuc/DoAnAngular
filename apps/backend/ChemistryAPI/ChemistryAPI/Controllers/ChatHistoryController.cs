using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ChemistryAPI.Data;
using ChemistryAPI.Models;
using ChemistryAPI.DTOs;

namespace ChemistryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatHistoryController : ControllerBase
    {
        private readonly ChemistryDbContext _context;

        public ChatHistoryController(ChemistryDbContext context)
        {
            _context = context;
        }

        // POST: api/chathistory
        [HttpPost]
        public async Task<ActionResult<ChatHistory>> CreateChatHistory(CreateChatHistoryDto dto)
        {
            var chatHistory = new ChatHistory
            {
                UserId = dto.UserId,
                Prompt = dto.Prompt,
                Response = dto.Response,
                ConversationId = dto.ConversationId,
                CreatedAt = DateTime.UtcNow
            };

            _context.ChatHistories.Add(chatHistory);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChatHistory), new { id = chatHistory.Id }, chatHistory);
        }

        // GET: api/chathistory/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ChatHistory>> GetChatHistory(int id)
        {
            var chatHistory = await _context.ChatHistories.FindAsync(id);

            if (chatHistory == null)
            {
                return NotFound();
            }

            return chatHistory;
        }

        // GET: api/chathistory/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<ChatHistory>>> GetChatHistoriesByUser(int userId)
        {
            return await _context.ChatHistories
                .Where(ch => ch.UserId == userId)
                .OrderByDescending(ch => ch.CreatedAt)
                .ToListAsync();
        }

        // GET: api/chathistory/user/{userId}/conversation/{conversationId}
        [HttpGet("user/{userId}/conversation/{conversationId}")]
        public async Task<ActionResult<IEnumerable<ChatHistory>>> GetChatHistoriesByConversation(int userId, int conversationId)
        {
            return await _context.ChatHistories
                .Where(ch => ch.UserId == userId && ch.ConversationId == conversationId)
                .OrderBy(ch => ch.CreatedAt)
                .ToListAsync();
        }

        // DELETE: api/chathistory/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChatHistory(int id)
        {
            var chatHistory = await _context.ChatHistories.FindAsync(id);
            if (chatHistory == null)
            {
                return NotFound();
            }

            _context.ChatHistories.Remove(chatHistory);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/chathistory/user/{userId}
        [HttpDelete("user/{userId}")]
        public async Task<IActionResult> DeleteAllChatHistoriesByUser(int userId)
        {
            var chatHistories = await _context.ChatHistories
                .Where(ch => ch.UserId == userId)
                .ToListAsync();

            _context.ChatHistories.RemoveRange(chatHistories);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
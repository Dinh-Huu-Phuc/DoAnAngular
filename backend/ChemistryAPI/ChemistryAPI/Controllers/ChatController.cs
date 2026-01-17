using ChemistryAPI.Services;
using Microsoft.AspNetCore.Mvc;
using ChemistryAPI.Services;
using ChemistryAPI.DTOs;

[Route("api/[controller]")]
[ApiController]
public class ChatController : ControllerBase
{
    private readonly GeminiService _geminiService;

    // Inject GeminiService vào Controller
    public ChatController(GeminiService geminiService)
    {
        _geminiService = geminiService;
    }

    [HttpPost("ask")]
    public async Task<IActionResult> AskGemini([FromBody] UserQuestionDto input)
    {
        if (string.IsNullOrEmpty(input.Question))
        {
            return BadRequest("Câu hỏi không được để trống.");
        }

        try
        {
            // Gọi Service đã viết
            var result = await _geminiService.GenerateContentAsync(input.Question);

            // Trả về kết quả JSON gốc từ Google cho Angular xử lý tiếp
            // Hoặc bạn có thể parse nó tại đây nếu muốn gọn hơn
            return Content(result, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }

    [HttpPost("chat-with-image")]
    public async Task<IActionResult> ChatWithImage([FromForm] ChatWithImageDto request)
    {
        if (string.IsNullOrEmpty(request.Question))
        {
            return BadRequest("Câu hỏi không được để trống.");
        }

        try
        {
            string result;
            
            if (request.Image != null && request.Image.Length > 0)
            {
                // Validate image
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
                if (!allowedTypes.Contains(request.Image.ContentType.ToLower()))
                {
                    return BadRequest("Only image files (JPEG, PNG, GIF, WebP) are allowed");
                }

                // Convert image to base64 for Gemini API
                using var memoryStream = new MemoryStream();
                await request.Image.CopyToAsync(memoryStream);
                var imageBytes = memoryStream.ToArray();
                var base64Image = Convert.ToBase64String(imageBytes);

                // Call Gemini with image
                result = await _geminiService.GenerateContentWithImageAsync(request.Question, base64Image, request.Image.ContentType);
            }
            else
            {
                // Text only
                result = await _geminiService.GenerateContentAsync(request.Question);
            }

            return Content(result, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }
}


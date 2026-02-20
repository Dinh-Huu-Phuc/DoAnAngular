using ChemistryAPI.Services;
using Microsoft.AspNetCore.Mvc;
using ChemistryAPI.DTOs;

[Route("api/[controller]")]
[ApiController]
public class ChatController : ControllerBase
{
    private readonly GeminiService _geminiService;
    private readonly ChatGptService _chatGptService;

    public ChatController(GeminiService geminiService, ChatGptService chatGptService)
    {
        _geminiService = geminiService;
        _chatGptService = chatGptService;
    }

    [HttpPost("ask")]
    public async Task<IActionResult> AskAI([FromBody] UserQuestionDto input)
    {
        if (string.IsNullOrEmpty(input.Question))
        {
            return BadRequest("Câu hỏi không được để trống.");
        }

        try
        {
            string result;

            if (input.Model?.ToLower() == "chatgpt")
            {
                result = await _chatGptService.GenerateContentAsync(input.Question);
            }
            else
            {
                result = await _geminiService.GenerateContentAsync(input.Question);
            }

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
            var model = request.Model?.ToLower() ?? "gemini";
            
            if (request.Image != null && request.Image.Length > 0)
            {
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
                if (!allowedTypes.Contains(request.Image.ContentType.ToLower()))
                {
                    return BadRequest("Only image files (JPEG, PNG, GIF, WebP) are allowed");
                }

                using var memoryStream = new MemoryStream();
                await request.Image.CopyToAsync(memoryStream);
                var imageBytes = memoryStream.ToArray();
                var base64Image = Convert.ToBase64String(imageBytes);

                if (model == "chatgpt")
                {
                    result = await _chatGptService.GenerateContentWithImageAsync(request.Question, base64Image, request.Image.ContentType);
                }
                else
                {
                    result = await _geminiService.GenerateContentWithImageAsync(request.Question, base64Image, request.Image.ContentType);
                }
            }
            else
            {
                if (model == "chatgpt")
                {
                    result = await _chatGptService.GenerateContentAsync(request.Question);
                }
                else
                {
                    result = await _geminiService.GenerateContentAsync(request.Question);
                }
            }

            return Content(result, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }
}

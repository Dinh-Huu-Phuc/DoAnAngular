using Microsoft.AspNetCore.Mvc;
using ChemistryAPI.Services;

namespace ChemistryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SimpleChatController : ControllerBase
    {
        private readonly GeminiService _geminiService;

        public SimpleChatController(GeminiService geminiService)
        {
            _geminiService = geminiService;
        }

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] SimpleChatRequest request)
        {
            if (string.IsNullOrEmpty(request.Message))
            {
                return BadRequest(new { message = "Tin nhắn không được để trống", success = false });
            }

            try
            {
                // Gọi Gemini API
                var result = await _geminiService.GenerateContentAsync(request.Message);
                
                return Ok(new { 
                    message = result, 
                    success = true 
                });
            }
            catch (Exception ex)
            {
                return Ok(new { 
                    message = $"Xin lỗi, tôi gặp lỗi: {ex.Message}", 
                    success = false 
                });
            }
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { 
                message = "Backend hoạt động tốt!", 
                success = true,
                timestamp = DateTime.Now
            });
        }
    }

    public class SimpleChatRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}
using Microsoft.AspNetCore.Mvc;
using ChemistryAPI.Services;

namespace ChemistryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SimpleChatController : ControllerBase
    {
        private readonly GeminiService _geminiService;
        private readonly ChatGptService _chatGptService;
        private readonly ChatRateLimitService _rateLimitService;

        public SimpleChatController(
            GeminiService geminiService, 
            ChatGptService chatGptService,
            ChatRateLimitService rateLimitService)
        {
            _geminiService = geminiService;
            _chatGptService = chatGptService;
            _rateLimitService = rateLimitService;
        }

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] SimpleChatRequest request)
        {
            if (string.IsNullOrEmpty(request.Message))
            {
                return BadRequest(new { message = "Tin nhắn không được để trống", success = false });
            }

            // Rate limit check
            if (request.UserId.HasValue && request.UserId.Value > 0)
            {
                var (allowed, remaining, resetInSeconds) = _rateLimitService.CheckAndRecord(request.UserId.Value);

                if (!allowed)
                {
                    var resetMinutes = resetInSeconds / 60;
                    return Ok(new
                    {
                        message = $"Bạn đã hết lượt hỏi. Vui lòng đợi {resetMinutes} phút nữa để tiếp tục.",
                        success = false,
                        rateLimited = true,
                        remaining = 0,
                        resetInSeconds,
                        model = request.Model ?? "gemini"
                    });
                }

                try
                {
                    string result;

                    if (request.Model?.ToLower() == "chatgpt")
                    {
                        result = await _chatGptService.GenerateContentAsync(request.Message);
                    }
                    else
                    {
                        result = await _geminiService.GenerateContentAsync(request.Message);
                    }

                    return Ok(new
                    {
                        message = result,
                        success = true,
                        model = request.Model ?? "gemini",
                        remaining,
                        resetInSeconds
                    });
                }
                catch (Exception ex)
                {
                    return Ok(new
                    {
                        message = $"Xin lỗi, tôi gặp lỗi: {ex.Message}",
                        success = false,
                        model = request.Model ?? "gemini",
                        remaining,
                        resetInSeconds
                    });
                }
            }

            // Không có userId → không giới hạn (guest mode, nhưng vẫn cho dùng)
            try
            {
                string guestResult;

                if (request.Model?.ToLower() == "chatgpt")
                {
                    guestResult = await _chatGptService.GenerateContentAsync(request.Message);
                }
                else
                {
                    guestResult = await _geminiService.GenerateContentAsync(request.Message);
                }

                return Ok(new
                {
                    message = guestResult,
                    success = true,
                    model = request.Model ?? "gemini"
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    message = $"Xin lỗi, tôi gặp lỗi: {ex.Message}",
                    success = false,
                    model = request.Model ?? "gemini"
                });
            }
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new
            {
                message = "Backend hoạt động tốt!",
                success = true,
                timestamp = DateTime.Now,
                availableModels = new[]
                {
                    new { id = "gemini", name = "Atomic-3.0", description = "Gemini 2.5 Flash" },
                    new { id = "chatgpt", name = "Atomic-5.2", description = "GPT-4o" }
                }
            });
        }

        [HttpGet("models")]
        public IActionResult GetModels()
        {
            return Ok(new
            {
                models = new[]
                {
                    new { id = "gemini", name = "Atomic-3.0", description = "Powered by Gemini 2.5 Flash", icon = "🧪" },
                    new { id = "chatgpt", name = "Atomic-5.2", description = "Powered by GPT-4o", icon = "⚡" }
                },
                defaultModel = "gemini"
            });
        }

        /// <summary>
        /// Lấy trạng thái rate limit của user
        /// </summary>
        [HttpGet("rate-limit/{userId:int}")]
        public IActionResult GetRateLimitStatus(int userId)
        {
            var (remaining, resetInSeconds) = _rateLimitService.GetStatus(userId);

            return Ok(new
            {
                remaining,
                maxRequests = 10,
                resetInSeconds,
                windowMinutes = 60
            });
        }
    }

    public class SimpleChatRequest
    {
        public string Message { get; set; } = string.Empty;
        public string? Model { get; set; }
        public int? UserId { get; set; }
    }
}

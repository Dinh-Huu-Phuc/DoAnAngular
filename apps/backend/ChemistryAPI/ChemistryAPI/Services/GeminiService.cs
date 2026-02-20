using System.Text;
using System.Text.Json;

namespace ChemistryAPI.Services;

public class GeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _apiUrl;
    // 1. Thêm biến để lưu luật lệ
    private readonly string _systemInstruction;

    public GeminiService(HttpClient httpClient, IEnvironmentConfigService envConfigService, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = envConfigService.GetGeminiApiKey();
        _apiUrl = envConfigService.GetGeminiApiUrl();

        // 2. Đọc luật lệ từ appsettings.json (không sensitive nên vẫn để trong config)
        // Nếu không có trong config, lấy giá trị mặc định (tránh lỗi null)
        _systemInstruction = configuration["GeminiApi:SystemInstruction"]
                             ?? "Bạn là trợ lý AI chuyên về Hóa học. Chỉ trả lời các câu hỏi về Hóa học.";
    }

    public async Task<string> GenerateContentAsync(string prompt)
    {
        if (string.IsNullOrWhiteSpace(prompt))
        {
            throw new ArgumentException("Prompt cannot be empty", nameof(prompt));
        }

        // Đơn giản hóa request body - chỉ gửi contents
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var url = $"{_apiUrl}?key={_apiKey}";
        var response = await _httpClient.PostAsync(url, content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Gemini API error: {response.StatusCode} - {errorContent}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        var responseJson = JsonDocument.Parse(responseContent);

        // Phần xử lý lấy text giữ nguyên vì bạn viết đã rất chuẩn rồi
        if (responseJson.RootElement.TryGetProperty("candidates", out var candidates) &&
            candidates.GetArrayLength() > 0)
        {
            var firstCandidate = candidates[0];
            if (firstCandidate.TryGetProperty("content", out var contentObj) &&
                contentObj.TryGetProperty("parts", out var parts) &&
                parts.GetArrayLength() > 0)
            {
                var firstPart = parts[0];
                if (firstPart.TryGetProperty("text", out var text))
                {
                    return text.GetString() ?? string.Empty;
                }
            }
        }

        return "No response from Gemini API";
    }

    public async Task<string> GenerateContentWithImageAsync(string prompt, string base64Image, string mimeType)
    {
        if (string.IsNullOrWhiteSpace(prompt))
        {
            throw new ArgumentException("Prompt cannot be empty", nameof(prompt));
        }

        if (string.IsNullOrWhiteSpace(base64Image))
        {
            throw new ArgumentException("Image data cannot be empty", nameof(base64Image));
        }

        // Đơn giản hóa request body - chỉ gửi contents
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new object[]
                    {
                        new { text = prompt },
                        new 
                        { 
                            inline_data = new 
                            { 
                                mime_type = mimeType,
                                data = base64Image 
                            } 
                        }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var url = $"{_apiUrl}?key={_apiKey}";
        var response = await _httpClient.PostAsync(url, content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Gemini API error: {response.StatusCode} - {errorContent}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        var responseJson = JsonDocument.Parse(responseContent);

        if (responseJson.RootElement.TryGetProperty("candidates", out var candidates) &&
            candidates.GetArrayLength() > 0)
        {
            var firstCandidate = candidates[0];
            if (firstCandidate.TryGetProperty("content", out var contentObj) &&
                contentObj.TryGetProperty("parts", out var parts) &&
                parts.GetArrayLength() > 0)
            {
                var firstPart = parts[0];
                if (firstPart.TryGetProperty("text", out var text))
                {
                    return text.GetString() ?? string.Empty;
                }
            }
        }

        return "No response from Gemini API";
    }
}
using System.Text;
using System.Text.Json;

namespace ChemistryAPI.Services;

public class ChatGptService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _apiUrl;
    private readonly string _model;
    private readonly string _systemInstruction;

    public ChatGptService(HttpClient httpClient, IEnvironmentConfigService envConfigService, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = envConfigService.GetChatGptApiKey();
        _apiUrl = envConfigService.GetChatGptApiUrl();
        _model = envConfigService.GetChatGptModel();
        _systemInstruction = configuration["ChatGptApi:SystemInstruction"]
                             ?? "Bạn là trợ lý AI chuyên về Hóa học. Chỉ trả lời các câu hỏi về Hóa học. Trả lời bằng tiếng Việt.";
    }

    public async Task<string> GenerateContentAsync(string prompt)
    {
        if (string.IsNullOrWhiteSpace(prompt))
            throw new ArgumentException("Prompt cannot be empty", nameof(prompt));

        if (string.IsNullOrEmpty(_apiKey))
            throw new InvalidOperationException("ChatGPT API key is not configured.");

        var requestBody = new
        {
            model = _model,
            messages = new object[]
            {
                new { role = "system", content = _systemInstruction },
                new { role = "user", content = prompt }
            },
            max_tokens = 4096,
            temperature = 0.7
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

        var response = await _httpClient.PostAsync(_apiUrl, content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"ChatGPT API error: {response.StatusCode} - {errorContent}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        var responseJson = JsonDocument.Parse(responseContent);

        if (responseJson.RootElement.TryGetProperty("choices", out var choices) &&
            choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out var message) &&
                message.TryGetProperty("content", out var text))
            {
                return text.GetString() ?? string.Empty;
            }
        }

        return "No response from ChatGPT API";
    }

    public async Task<string> GenerateContentWithImageAsync(string prompt, string base64Image, string mimeType)
    {
        if (string.IsNullOrWhiteSpace(prompt))
            throw new ArgumentException("Prompt cannot be empty", nameof(prompt));

        if (string.IsNullOrEmpty(_apiKey))
            throw new InvalidOperationException("ChatGPT API key is not configured.");

        var requestBody = new
        {
            model = _model,
            messages = new object[]
            {
                new { role = "system", content = _systemInstruction },
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new { type = "text", text = prompt },
                        new
                        {
                            type = "image_url",
                            image_url = new
                            {
                                url = $"data:{mimeType};base64,{base64Image}"
                            }
                        }
                    }
                }
            },
            max_tokens = 4096,
            temperature = 0.7
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

        var response = await _httpClient.PostAsync(_apiUrl, content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"ChatGPT API error: {response.StatusCode} - {errorContent}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        var responseJson = JsonDocument.Parse(responseContent);

        if (responseJson.RootElement.TryGetProperty("choices", out var choices) &&
            choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out var message) &&
                message.TryGetProperty("content", out var text))
            {
                return text.GetString() ?? string.Empty;
            }
        }

        return "No response from ChatGPT API";
    }
}

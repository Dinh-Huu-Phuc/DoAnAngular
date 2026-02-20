namespace ChemistryAPI.Services
{
    public class EnvironmentConfigService : IEnvironmentConfigService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EnvironmentConfigService> _logger;

        public EnvironmentConfigService(IConfiguration configuration, ILogger<EnvironmentConfigService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public string GetGeminiApiKey()
        {
            // Đọc từ environment variable trước, nếu không có thì fallback về appsettings
            var apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") 
                        ?? _configuration["GeminiApi:ApiKey"];
            
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("GEMINI_API_KEY environment variable not found and no fallback in configuration");
                throw new InvalidOperationException("Gemini API key is not configured. Please set GEMINI_API_KEY environment variable.");
            }

            return apiKey;
        }

        public string GetGeminiApiUrl()
        {
            return Environment.GetEnvironmentVariable("GEMINI_API_URL") 
                   ?? _configuration["GeminiApi:ApiUrl"] 
                   ?? "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
        }

        public string GetChatGptApiKey()
        {
            var apiKey = Environment.GetEnvironmentVariable("CHATGPT_API_KEY") 
                        ?? _configuration["ChatGptApi:ApiKey"];
            
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogWarning("CHATGPT_API_KEY environment variable not found");
                return string.Empty;
            }

            return apiKey;
        }

        public string GetChatGptApiUrl()
        {
            return Environment.GetEnvironmentVariable("CHATGPT_API_URL") 
                   ?? _configuration["ChatGptApi:ApiUrl"] 
                   ?? "https://api.openai.com/v1/chat/completions";
        }

        public string GetChatGptModel()
        {
            return Environment.GetEnvironmentVariable("CHATGPT_MODEL") 
                   ?? _configuration["ChatGptApi:Model"] 
                   ?? "gpt-4o";
        }

        public string GetConnectionString()
        {
            // Connection string có thể lấy từ environment hoặc configuration
            var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING") 
                                 ?? _configuration.GetConnectionString("DefaultConnection");
            
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("CONNECTION_STRING environment variable not found and no fallback in configuration");
                throw new InvalidOperationException("Database connection string is not configured. Please set CONNECTION_STRING environment variable.");
            }

            return connectionString;
        }

        public bool ValidateRequiredEnvironments()
        {
            var missingEnvs = GetMissingEnvironments();
            
            if (missingEnvs.Any())
            {
                foreach (var missing in missingEnvs)
                {
                    _logger.LogError("Missing required environment variable: {VariableName} - {Description}", 
                        missing.Key, missing.Value);
                }
                return false;
            }

            _logger.LogInformation("All required environment variables are configured");
            return true;
        }

        public Dictionary<string, string> GetMissingEnvironments()
        {
            var missing = new Dictionary<string, string>();

            // Kiểm tra GEMINI_API_KEY
            var geminiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") 
                           ?? _configuration["GeminiApi:ApiKey"];
            if (string.IsNullOrEmpty(geminiKey))
            {
                missing.Add("GEMINI_API_KEY", "API key for Gemini AI service");
            }

            // Kiểm tra CONNECTION_STRING
            var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING") 
                                 ?? _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                missing.Add("CONNECTION_STRING", "Database connection string");
            }

            return missing;
        }
    }
}
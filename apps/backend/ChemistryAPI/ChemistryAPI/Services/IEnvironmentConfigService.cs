namespace ChemistryAPI.Services
{
    public interface IEnvironmentConfigService
    {
        string GetGeminiApiKey();
        string GetGeminiApiUrl();
        string GetChatGptApiKey();
        string GetChatGptApiUrl();
        string GetChatGptModel();
        string GetConnectionString();
        bool ValidateRequiredEnvironments();
        Dictionary<string, string> GetMissingEnvironments();
    }
}
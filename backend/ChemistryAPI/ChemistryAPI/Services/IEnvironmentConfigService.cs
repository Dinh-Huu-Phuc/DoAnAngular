namespace ChemistryAPI.Services
{
    public interface IEnvironmentConfigService
    {
        string GetGeminiApiKey();
        string GetGeminiApiUrl();
        string GetConnectionString();
        bool ValidateRequiredEnvironments();
        Dictionary<string, string> GetMissingEnvironments();
    }
}
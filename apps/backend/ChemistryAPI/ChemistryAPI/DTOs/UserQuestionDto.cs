namespace ChemistryAPI.DTOs
{
    public class UserQuestionDto
    {
        public string Question { get; set; }
        public string? Model { get; set; } // "gemini" hoặc "chatgpt"
    }
}

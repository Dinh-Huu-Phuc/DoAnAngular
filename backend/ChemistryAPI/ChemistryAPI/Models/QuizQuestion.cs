namespace ChemistryAPI.Models;

public class QuizQuestion
{
    public int Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty; // "A", "B", "C", or "D"
    public string Topic { get; set; } = string.Empty;
}






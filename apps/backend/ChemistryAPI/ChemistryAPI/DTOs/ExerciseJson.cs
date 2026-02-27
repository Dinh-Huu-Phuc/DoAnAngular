namespace ChemistryAPI.DTOs;

public class ExerciseJson
{
    public string Id { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string Question { get; set; } = string.Empty;
    public List<string>? Options { get; set; }
    public int CorrectAnswerIndex { get; set; }
    public string? Explanation { get; set; }
}

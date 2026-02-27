namespace ChemistryAPI.Models;

public class LessonExercise
{
    public int Id { get; set; }
    public int LessonContentId { get; set; }
    public string ExerciseId { get; set; } = string.Empty; // e.g. "EX-0801-1"
    public string Type { get; set; } = "multiple_choice";
    public string Question { get; set; } = string.Empty;
    public string Options { get; set; } = "[]"; // JSON array
    public int CorrectAnswerIndex { get; set; }
    public string Explanation { get; set; } = string.Empty;

    // Navigation
    public LessonContent LessonContent { get; set; } = null!;
}

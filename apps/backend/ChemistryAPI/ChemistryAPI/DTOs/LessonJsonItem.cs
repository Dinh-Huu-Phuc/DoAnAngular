namespace ChemistryAPI.DTOs;

public class LessonJsonItem
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public List<string>? Tags { get; set; }
    public string? Difficulty { get; set; }
    public int XpReward { get; set; }
    public List<string>? Prerequisites { get; set; }
    public string? LessonType { get; set; }
    public int EstMinutes { get; set; }
    public LessonContentJson? Content { get; set; }
    public List<ExerciseJson>? Exercises { get; set; }
}

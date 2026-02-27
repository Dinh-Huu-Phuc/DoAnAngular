namespace ChemistryAPI.Models;

public class LessonContent
{
    public int Id { get; set; }
    public string LessonId { get; set; } = string.Empty; // e.g. "CHEM8-01"
    public string Title { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty; // "Lớp 8", "Lớp 9", etc.
    public string Topic { get; set; } = string.Empty;
    public string Tags { get; set; } = "[]"; // JSON array
    public string Difficulty { get; set; } = "Beginner";
    public int XpReward { get; set; } = 100;
    public string Prerequisites { get; set; } = "[]"; // JSON array
    public string LessonType { get; set; } = "Theory";
    public int EstMinutes { get; set; } = 45;
    public string? Markdown { get; set; }
    public string? VideoUrl { get; set; }
    public string Attachments { get; set; } = "[]"; // JSON array
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<LessonExercise> Exercises { get; set; } = new List<LessonExercise>();
}

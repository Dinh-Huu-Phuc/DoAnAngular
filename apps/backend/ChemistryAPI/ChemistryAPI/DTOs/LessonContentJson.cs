namespace ChemistryAPI.DTOs;

public class LessonContentJson
{
    public string? Markdown { get; set; }
    public string? VideoUrl { get; set; }
    public List<string>? Attachments { get; set; }
}

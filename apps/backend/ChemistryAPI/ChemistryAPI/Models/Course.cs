namespace ChemistryAPI.Models;

public class Course
{
    public int Id { get; set; }
    public string CourseId { get; set; } = string.Empty; // e.g., "chemistry-basics-level-0"
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; } // Thứ tự hiển thị
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public ICollection<CourseLesson> Lessons { get; set; } = new List<CourseLesson>();
}

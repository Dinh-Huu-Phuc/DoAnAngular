namespace ChemistryAPI.Models;

public class LessonQuizQuestion
{
    public int Id { get; set; }
    public int CourseLessonId { get; set; }
    public int QuestionNumber { get; set; } // Số thứ tự câu hỏi
    public string Question { get; set; } = string.Empty;
    public string Options { get; set; } = string.Empty; // JSON array của options
    public int CorrectAnswer { get; set; } // Index của đáp án đúng (0-based)
    public string Explanation { get; set; } = string.Empty;
    public int Order { get; set; } // Thứ tự hiển thị
    
    // Navigation property
    public CourseLesson CourseLesson { get; set; } = null!;
}

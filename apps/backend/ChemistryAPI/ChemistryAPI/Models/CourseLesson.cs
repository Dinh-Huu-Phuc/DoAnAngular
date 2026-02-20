namespace ChemistryAPI.Models;

public class CourseLesson
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int LessonNumber { get; set; } // Số thứ tự bài học trong khóa
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = "content"; // "content" hoặc "quiz"
    public string? Content { get; set; } // Nội dung markdown cho content lesson
    public int Order { get; set; } // Thứ tự hiển thị
    
    // Navigation properties
    public Course Course { get; set; } = null!;
    public ICollection<LessonQuizQuestion> QuizQuestions { get; set; } = new List<LessonQuizQuestion>();
}

using ChemistryAPI.Data;
using ChemistryAPI.DTOs;
using ChemistryAPI.Models;
using ChemistryAPI.Attributes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ChemistryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ChemistryDbContext _context;
    private readonly ILogger<CoursesController> _logger;

    public CoursesController(ChemistryDbContext context, ILogger<CoursesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/courses
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetAllCourses()
    {
        try
        {
            var courses = await _context.Courses
                .Where(c => c.IsActive)
                .OrderBy(c => c.Order)
                .Include(c => c.Lessons.OrderBy(l => l.Order))
                    .ThenInclude(l => l.QuizQuestions.OrderBy(q => q.Order))
                .ToListAsync();

            var courseDtos = courses.Select(MapToCourseDto).ToList();
            return Ok(courseDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all courses");
            return StatusCode(500, "Không thể tải danh sách khóa học");
        }
    }

    // GET: api/courses/{courseId}
    [HttpGet("{courseId}")]
    public async Task<ActionResult<CourseDto>> GetCourse(string courseId)
    {
        try
        {
            var course = await _context.Courses
                .Where(c => c.CourseId == courseId && c.IsActive)
                .Include(c => c.Lessons.OrderBy(l => l.Order))
                    .ThenInclude(l => l.QuizQuestions.OrderBy(q => q.Order))
                .FirstOrDefaultAsync();

            if (course == null)
            {
                return NotFound($"Không tìm thấy khóa học: {courseId}");
            }

            var courseDto = MapToCourseDto(course);
            return Ok(courseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting course {CourseId}", courseId);
            return StatusCode(500, "Không thể tải khóa học");
        }
    }

    // POST: api/courses
    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult<CourseDto>> CreateCourse([FromBody] CourseDto courseDto)
    {
        try
        {
            // Check if course ID already exists
            if (await _context.Courses.AnyAsync(c => c.CourseId == courseDto.Id))
            {
                return BadRequest($"Khóa học với ID '{courseDto.Id}' đã tồn tại");
            }

            var course = new Course
            {
                CourseId = courseDto.Id,
                Title = courseDto.Title,
                Description = courseDto.Description,
                Order = await _context.Courses.CountAsync() + 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Add lessons
            int lessonOrder = 1;
            foreach (var lessonDto in courseDto.Lessons)
            {
                var lesson = new CourseLesson
                {
                    LessonNumber = lessonDto.Id,
                    Title = lessonDto.Title,
                    Type = lessonDto.Type,
                    Content = lessonDto.Content,
                    Order = lessonOrder++
                };

                // Add quiz questions if it's a quiz lesson
                if (lessonDto.Type == "quiz" && lessonDto.Questions != null)
                {
                    int questionOrder = 1;
                    foreach (var questionDto in lessonDto.Questions)
                    {
                        var question = new LessonQuizQuestion
                        {
                            QuestionNumber = questionDto.Id,
                            Question = questionDto.Question,
                            Options = JsonSerializer.Serialize(questionDto.Options),
                            CorrectAnswer = questionDto.CorrectAnswer,
                            Explanation = questionDto.Explanation,
                            Order = questionOrder++
                        };
                        lesson.QuizQuestions.Add(question);
                    }
                }

                course.Lessons.Add(lesson);
            }

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            var createdCourseDto = MapToCourseDto(course);
            return CreatedAtAction(nameof(GetCourse), new { courseId = course.CourseId }, createdCourseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating course");
            return StatusCode(500, "Không thể tạo khóa học");
        }
    }

    // PUT: api/courses/{courseId}
    [HttpPut("{courseId}")]
    [AdminOnly]
    public async Task<IActionResult> UpdateCourse(string courseId, [FromBody] CourseDto courseDto)
    {
        try
        {
            var course = await _context.Courses
                .Include(c => c.Lessons)
                    .ThenInclude(l => l.QuizQuestions)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
            {
                return NotFound($"Không tìm thấy khóa học: {courseId}");
            }

            // Update course info
            course.Title = courseDto.Title;
            course.Description = courseDto.Description;
            course.UpdatedAt = DateTime.UtcNow;

            // Remove old lessons
            _context.CourseLessons.RemoveRange(course.Lessons);

            // Add new lessons
            course.Lessons.Clear();
            int lessonOrder = 1;
            foreach (var lessonDto in courseDto.Lessons)
            {
                var lesson = new CourseLesson
                {
                    LessonNumber = lessonDto.Id,
                    Title = lessonDto.Title,
                    Type = lessonDto.Type,
                    Content = lessonDto.Content,
                    Order = lessonOrder++
                };

                if (lessonDto.Type == "quiz" && lessonDto.Questions != null)
                {
                    int questionOrder = 1;
                    foreach (var questionDto in lessonDto.Questions)
                    {
                        var question = new LessonQuizQuestion
                        {
                            QuestionNumber = questionDto.Id,
                            Question = questionDto.Question,
                            Options = JsonSerializer.Serialize(questionDto.Options),
                            CorrectAnswer = questionDto.CorrectAnswer,
                            Explanation = questionDto.Explanation,
                            Order = questionOrder++
                        };
                        lesson.QuizQuestions.Add(question);
                    }
                }

                course.Lessons.Add(lesson);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating course {CourseId}", courseId);
            return StatusCode(500, "Không thể cập nhật khóa học");
        }
    }

    // DELETE: api/courses/{courseId}
    [HttpDelete("{courseId}")]
    [AdminOnly]
    public async Task<IActionResult> DeleteCourse(string courseId)
    {
        try
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
            {
                return NotFound($"Không tìm thấy khóa học: {courseId}");
            }

            // Soft delete
            course.IsActive = false;
            course.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting course {CourseId}", courseId);
            return StatusCode(500, "Không thể xóa khóa học");
        }
    }

    private static CourseDto MapToCourseDto(Course course)
    {
        return new CourseDto
        {
            Id = course.CourseId,
            Title = course.Title,
            Description = course.Description,
            Lessons = course.Lessons.Select(l => new LessonDto
            {
                Id = l.LessonNumber,
                Title = l.Title,
                Type = l.Type,
                Content = l.Content,
                Questions = l.Type == "quiz"
                    ? l.QuizQuestions.Select(q => new QuizQuestionDto
                    {
                        Id = q.QuestionNumber,
                        Question = q.Question,
                        Options = JsonSerializer.Deserialize<List<string>>(q.Options) ?? new List<string>(),
                        CorrectAnswer = q.CorrectAnswer,
                        Explanation = q.Explanation
                    }).ToList()
                    : null
            }).ToList()
        };
    }
}

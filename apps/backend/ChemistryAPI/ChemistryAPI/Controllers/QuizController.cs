using ChemistryAPI.Data;
using ChemistryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChemistryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private readonly ChemistryDbContext _context;

    public QuizController(ChemistryDbContext context)
    {
        _context = context;
    }

    public record QuizSubmitRequest(int UserId, int LessonId, Dictionary<int, string> Answers);

    public record QuizResult(double Score, int CorrectCount, int TotalQuestions);

    // READ list (optional filter by topic)
    [HttpGet]
    public async Task<IActionResult> GetQuestions([FromQuery] string? topic = null)
    {
        var query = _context.QuizQuestions.AsQueryable();
        if (!string.IsNullOrWhiteSpace(topic))
        {
            query = query.Where(q => q.Topic == topic);
        }

        var questions = await query.ToListAsync();
        return Ok(questions);
    }

    // READ single question
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetQuestionById(int id)
    {
        var question = await _context.QuizQuestions.FindAsync(id);
        if (question == null)
        {
            return NotFound();
        }

        return Ok(question);
    }

    // CREATE question
    [HttpPost]
    public async Task<IActionResult> CreateQuestion([FromBody] QuizQuestion question)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        _context.QuizQuestions.Add(question);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetQuestionById), new { id = question.Id }, question);
    }

    // UPDATE question
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateQuestion(int id, [FromBody] QuizQuestion updated)
    {
        var existing = await _context.QuizQuestions.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        existing.Question = updated.Question;
        existing.OptionA = updated.OptionA;
        existing.OptionB = updated.OptionB;
        existing.OptionC = updated.OptionC;
        existing.OptionD = updated.OptionD;
        existing.CorrectAnswer = updated.CorrectAnswer;
        existing.Topic = updated.Topic;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE question
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        var question = await _context.QuizQuestions.FindAsync(id);
        if (question == null)
        {
            return NotFound();
        }

        _context.QuizQuestions.Remove(question);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // SUBMIT quiz and chấm điểm
    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] QuizSubmitRequest request)
    {
        if (request.Answers == null || request.Answers.Count == 0)
        {
            return BadRequest("No answers submitted.");
        }

        var questionIds = request.Answers.Keys.ToList();
        var questions = await _context.QuizQuestions
            .Where(q => questionIds.Contains(q.Id))
            .ToListAsync();

        if (questions.Count == 0)
        {
            return BadRequest("No valid questions found.");
        }

        var correctCount = 0;
        foreach (var question in questions)
        {
            if (request.Answers.TryGetValue(question.Id, out var answer))
            {
                if (string.Equals(question.CorrectAnswer, answer, StringComparison.OrdinalIgnoreCase))
                {
                    correctCount++;
                }
            }
        }

        var total = questions.Count;
        var score = total > 0 ? (double)correctCount / total * 100.0 : 0;

        // Optionally store result as learning progress (if LessonId is provided)
        if (request.LessonId > 0 && request.UserId > 0)
        {
            _context.LearningProgresses.Add(new LearningProgress
            {
                UserId = request.UserId,
                LessonId = request.LessonId,
                CompletedAt = DateTime.UtcNow,
                Score = score
            });
            await _context.SaveChangesAsync();
        }

        var result = new QuizResult(score, correctCount, total);
        return Ok(result);
    }
}


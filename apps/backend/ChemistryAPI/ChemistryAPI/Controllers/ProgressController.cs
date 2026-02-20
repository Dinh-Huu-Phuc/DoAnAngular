using ChemistryAPI.Data;
using ChemistryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChemistryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly ChemistryDbContext _context;

    public ProgressController(ChemistryDbContext context)
    {
        _context = context;
    }

    public record SaveProgressRequest(int UserId, int LessonId, double Score);

    // CREATE progress
    [HttpPost]
    public async Task<IActionResult> SaveProgress(SaveProgressRequest request)
    {
        if (request.UserId <= 0 || request.LessonId <= 0)
        {
            return BadRequest("Invalid user or lesson.");
        }

        var progress = new LearningProgress
        {
            UserId = request.UserId,
            LessonId = request.LessonId,
            CompletedAt = DateTime.UtcNow,
            Score = request.Score
        };

        _context.LearningProgresses.Add(progress);
        await _context.SaveChangesAsync();

        return Ok(progress);
    }

    // READ by user
    [HttpGet("by-user/{userId:int}")]
    public async Task<IActionResult> GetByUser(int userId)
    {
        var progresses = await _context.LearningProgresses
            .Where(lp => lp.UserId == userId)
            .Include(lp => lp.Lesson)
            .OrderByDescending(lp => lp.CompletedAt)
            .ToListAsync();

        return Ok(progresses);
    }

    // UPDATE score (ví dụ chỉnh lại điểm)
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] double score)
    {
        var progress = await _context.LearningProgresses.FindAsync(id);
        if (progress == null)
        {
            return NotFound();
        }

        progress.Score = score;
        await _context.SaveChangesAsync();
        return Ok(progress);
    }

    // DELETE progress
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var progress = await _context.LearningProgresses.FindAsync(id);
        if (progress == null)
        {
            return NotFound();
        }

        _context.LearningProgresses.Remove(progress);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}


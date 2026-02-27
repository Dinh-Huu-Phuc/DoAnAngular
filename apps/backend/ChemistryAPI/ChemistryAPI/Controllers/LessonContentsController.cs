using ChemistryAPI.Data;
using ChemistryAPI.DTOs;
using ChemistryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ChemistryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonContentsController : ControllerBase
{
    private readonly ChemistryDbContext _context;

    public LessonContentsController(ChemistryDbContext context)
    {
        _context = context;
    }

    // GET: api/lessoncontents
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? level, [FromQuery] string? topic)
    {
        var query = _context.LessonContents.Include(lc => lc.Exercises).AsQueryable();

        if (!string.IsNullOrEmpty(level))
            query = query.Where(lc => lc.Level == level);
        if (!string.IsNullOrEmpty(topic))
            query = query.Where(lc => lc.Topic == topic);

        var lessons = await query.OrderBy(lc => lc.LessonId).ToListAsync();
        return Ok(lessons);
    }

    // GET: api/lessoncontents/catalog - Danh sách nhẹ cho catalog (không markdown, không exercises)
    [HttpGet("catalog")]
    public async Task<IActionResult> GetCatalog([FromQuery] string? level, [FromQuery] string? topic)
    {
        var query = _context.LessonContents.AsQueryable();

        if (!string.IsNullOrEmpty(level))
            query = query.Where(lc => lc.Level == level);
        if (!string.IsNullOrEmpty(topic))
            query = query.Where(lc => lc.Topic == topic);

        var lessons = await query
            .OrderBy(lc => lc.LessonId)
            .Select(lc => new
            {
                lc.Id,
                lc.LessonId,
                lc.Title,
                lc.Level,
                lc.Topic,
                lc.Tags,
                lc.Difficulty,
                lc.XpReward,
                lc.Prerequisites,
                lc.LessonType,
                lc.EstMinutes,
                HasVideo = lc.VideoUrl != null && lc.VideoUrl != "",
                HasMarkdown = lc.Markdown != null && lc.Markdown != "",
                lc.Attachments,
                ExerciseCount = lc.Exercises.Count
            })
            .ToListAsync();

        return Ok(lessons);
    }

    // GET: api/lessoncontents/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var lesson = await _context.LessonContents
            .Include(lc => lc.Exercises)
            .FirstOrDefaultAsync(lc => lc.Id == id);
        return lesson == null ? NotFound() : Ok(lesson);
    }

    // GET: api/lessoncontents/by-lesson-id/CHEM8-01
    [HttpGet("by-lesson-id/{lessonId}")]
    public async Task<IActionResult> GetByLessonId(string lessonId)
    {
        var lesson = await _context.LessonContents
            .Include(lc => lc.Exercises)
            .FirstOrDefaultAsync(lc => lc.LessonId == lessonId);
        return lesson == null ? NotFound() : Ok(lesson);
    }

    // GET: api/lessoncontents/levels
    [HttpGet("levels")]
    public async Task<IActionResult> GetLevels()
    {
        var levels = await _context.LessonContents
            .Select(lc => lc.Level)
            .Distinct()
            .OrderBy(l => l)
            .ToListAsync();
        return Ok(levels);
    }

    // POST: api/lessoncontents
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] LessonContent lesson)
    {
        _context.LessonContents.Add(lesson);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = lesson.Id }, lesson);
    }

    // PUT: api/lessoncontents/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] LessonContent updated)
    {
        var existing = await _context.LessonContents.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Title = updated.Title;
        existing.Level = updated.Level;
        existing.Topic = updated.Topic;
        existing.Tags = updated.Tags;
        existing.Difficulty = updated.Difficulty;
        existing.XpReward = updated.XpReward;
        existing.Prerequisites = updated.Prerequisites;
        existing.LessonType = updated.LessonType;
        existing.EstMinutes = updated.EstMinutes;
        existing.Markdown = updated.Markdown;
        existing.VideoUrl = updated.VideoUrl;
        existing.Attachments = updated.Attachments;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE: api/lessoncontents/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var lesson = await _context.LessonContents.FindAsync(id);
        if (lesson == null) return NotFound();

        _context.LessonContents.Remove(lesson);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // POST: api/lessoncontents/seed
    // Upload file lesson.json để nạp dữ liệu vào DB
    [HttpPost("seed")]
    public async Task<IActionResult> SeedFromJson(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Vui lòng upload file lesson.json");

        using var reader = new StreamReader(file.OpenReadStream());
        var json = await reader.ReadToEndAsync();
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var items = JsonSerializer.Deserialize<List<LessonJsonItem>>(json, options);

        if (items == null || items.Count == 0)
            return BadRequest("Không có dữ liệu trong lesson.json");

        int added = 0, skipped = 0;

        foreach (var item in items)
        {
            if (await _context.LessonContents.AnyAsync(lc => lc.LessonId == item.Id))
            {
                skipped++;
                continue;
            }

            var lesson = new LessonContent
            {
                LessonId = item.Id,
                Title = item.Title,
                Level = item.Level,
                Topic = item.Topic,
                Tags = JsonSerializer.Serialize(item.Tags ?? new List<string>()),
                Difficulty = item.Difficulty ?? "Beginner",
                XpReward = item.XpReward,
                Prerequisites = JsonSerializer.Serialize(item.Prerequisites ?? new List<string>()),
                LessonType = item.LessonType ?? "Theory",
                EstMinutes = item.EstMinutes,
                Markdown = item.Content?.Markdown,
                VideoUrl = item.Content?.VideoUrl,
                Attachments = JsonSerializer.Serialize(item.Content?.Attachments ?? new List<string>()),
            };

            if (item.Exercises != null)
            {
                foreach (var ex in item.Exercises)
                {
                    lesson.Exercises.Add(new LessonExercise
                    {
                        ExerciseId = ex.Id,
                        Type = ex.Type ?? "multiple_choice",
                        Question = ex.Question,
                        Options = JsonSerializer.Serialize(ex.Options ?? new List<string>()),
                        CorrectAnswerIndex = ex.CorrectAnswerIndex,
                        Explanation = ex.Explanation ?? string.Empty,
                    });
                }
            }

            _context.LessonContents.Add(lesson);
            added++;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = $"Seed hoàn tất: {added} bài thêm mới, {skipped} bài đã tồn tại." });
    }
}

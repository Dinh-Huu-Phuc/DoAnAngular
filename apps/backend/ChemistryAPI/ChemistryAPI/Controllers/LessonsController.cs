using ChemistryAPI.Data;
using ChemistryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChemistryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonsController : ControllerBase
{
    private readonly ChemistryDbContext _context;

    public LessonsController(ChemistryDbContext context)
    {
        _context = context;
    }

    // READ list
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var lessons = await _context.Lessons.ToListAsync();
        return Ok(lessons);
    }

    // READ by id
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var lesson = await _context.Lessons.FindAsync(id);
        if (lesson == null)
        {
            return NotFound();
        }

        return Ok(lesson);
    }

    // READ by topic
    [HttpGet("by-topic/{topic}")]
    public async Task<IActionResult> GetByTopic(string topic)
    {
        var lessons = await _context.Lessons
            .Where(l => l.Topic == topic)
            .ToListAsync();

        return Ok(lessons);
    }

    // CREATE
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Lesson lesson)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = lesson.Id }, lesson);
    }

    // UPDATE
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Lesson updated)
    {
        var existing = await _context.Lessons.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        existing.Title = updated.Title;
        existing.Topic = updated.Topic;
        existing.Content = updated.Content;
        existing.Level = updated.Level;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var lesson = await _context.Lessons.FindAsync(id);
        if (lesson == null)
        {
            return NotFound();
        }

        _context.Lessons.Remove(lesson);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}


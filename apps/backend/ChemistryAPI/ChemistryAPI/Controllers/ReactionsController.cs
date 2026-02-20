using ChemistryAPI.Data;
using ChemistryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChemistryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReactionsController : ControllerBase
{
    private readonly ChemistryDbContext _context;

    public ReactionsController(ChemistryDbContext context)
    {
        _context = context;
    }

    // READ
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var reactions = await _context.Reactions.ToListAsync();
        return Ok(reactions);
    }

    // READ detail
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var reaction = await _context.Reactions.FindAsync(id);
        if (reaction == null)
        {
            return NotFound();
        }

        return Ok(reaction);
    }

    // CREATE
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Reaction reaction)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        _context.Reactions.Add(reaction);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = reaction.Id }, reaction);
    }

    // UPDATE
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Reaction updated)
    {
        var existing = await _context.Reactions.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        existing.Equation = updated.Equation;
        existing.ReactionType = updated.ReactionType;
        existing.Condition = updated.Condition;
        existing.Description = updated.Description;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var reaction = await _context.Reactions.FindAsync(id);
        if (reaction == null)
        {
            return NotFound();
        }

        _context.Reactions.Remove(reaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}


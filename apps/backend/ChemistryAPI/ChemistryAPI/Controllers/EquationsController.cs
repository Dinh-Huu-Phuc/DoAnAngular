using ChemistryAPI.Data;
using ChemistryAPI.DTOs;
using ChemistryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace ChemistryAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EquationsController : ControllerBase
{
    private readonly ChemistryDbContext _context;

    public EquationsController(ChemistryDbContext context)
    {
        _context = context;
    }

    // GET: api/equations
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _context.Equations
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
        return Ok(list);
    }

    // GET: api/equations/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var equation = await _context.Equations.FindAsync(id);
        if (equation == null)
        {
            return NotFound();
        }
        return Ok(equation);
    }

    // POST: api/equations
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Equation equation)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        equation.CreatedAt = DateTime.UtcNow;
        _context.Equations.Add(equation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = equation.Id }, equation);
    }

    // PUT: api/equations/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Equation updated)
    {
        var existing = await _context.Equations.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        existing.Reactants = updated.Reactants;
        existing.Products = updated.Products;
        existing.BalancedEquation = updated.BalancedEquation;
        existing.Condition = updated.Condition;
        existing.Phenomenon = updated.Phenomenon;
        existing.Level = updated.Level;
        existing.Tags = updated.Tags;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE: api/equations/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var equation = await _context.Equations.FindAsync(id);
        if (equation == null)
        {
            return NotFound();
        }

        _context.Equations.Remove(equation);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/equations/import
    [HttpPost("import")]
    public async Task<IActionResult> ImportEquations([FromBody] List<EquationImportDto> dtos)
    {
        if (dtos == null || dtos.Count == 0)
        {
            return BadRequest("Dữ liệu trống.");
        }

        var newEquations = new List<Equation>();

        foreach (var item in dtos)
        {
            var eq = new Equation
            {
                Reactants = item.Reactants ?? string.Empty,
                Products = item.Products ?? string.Empty,
                BalancedEquation = item.Equation ?? string.Empty, // Map từ field "equation" của JSON
                Condition = item.Condition ?? string.Empty,
                Phenomenon = item.Phenomenon ?? string.Empty,
                Level = item.Level ?? string.Empty,
                // Chuyển List<string> thành chuỗi JSON để lưu vào DB
                Tags = item.Tags != null && item.Tags.Count > 0 
                    ? JsonSerializer.Serialize(item.Tags) 
                    : "[]",
                CreatedAt = DateTime.UtcNow
            };

            newEquations.Add(eq);
        }

        await _context.Equations.AddRangeAsync(newEquations);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Đã thêm thành công {newEquations.Count} phương trình." });
    }

    // POST: api/equations/upload-json
    // API này dùng để upload file .json từ máy tính lên
    [HttpPost("upload-json")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadJsonFile(IFormFile? file)
    {
        // 1. Kiểm tra file có tồn tại không
        if (file == null || file.Length == 0)
        {
            return BadRequest("Vui lòng chọn file JSON hợp lệ.");
        }

        try
        {
            // 2. Đọc luồng dữ liệu từ file
            using var stream = file.OpenReadStream();

            // Cấu hình để đọc JSON không phân biệt hoa thường (reactants == Reactants)
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            // 3. Chuyển đổi (Deserialize) từ File JSON sang List DTO
            var dtos = await JsonSerializer.DeserializeAsync<List<EquationImportDto>>(stream, options);

            if (dtos == null || dtos.Count == 0)
            {
                return BadRequest("File không chứa dữ liệu hoặc sai định dạng.");
            }

            // 4. Map dữ liệu sang Entity để lưu vào DB (Giống hệt hàm Import cũ)
            var newEquations = new List<Equation>();

            foreach (var item in dtos)
            {
                var eq = new Equation
                {
                    Reactants = item.Reactants ?? string.Empty,
                    Products = item.Products ?? string.Empty,
                    BalancedEquation = item.Equation ?? string.Empty,
                    Condition = item.Condition ?? string.Empty,
                    Phenomenon = item.Phenomenon ?? string.Empty,
                    Level = item.Level ?? string.Empty,

                    // Xử lý Tags: Chuyển List thành String JSON
                    Tags = item.Tags != null && item.Tags.Count > 0
                        ? JsonSerializer.Serialize(item.Tags)
                        : "[]",

                    CreatedAt = DateTime.UtcNow
                };

                newEquations.Add(eq);
            }

            // 5. Lưu vào Database
            await _context.Equations.AddRangeAsync(newEquations);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã upload file và lưu thành công {newEquations.Count} phương trình." });
        }
        catch (JsonException ex)
        {
            return BadRequest($"Lỗi định dạng JSON trong file: {ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
        }
    }
}




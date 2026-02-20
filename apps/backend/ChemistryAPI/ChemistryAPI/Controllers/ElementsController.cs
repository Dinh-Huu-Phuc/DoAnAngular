using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using ChemistryAPI.Data;
using ChemistryAPI.DTOs;
using ChemistryAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChemistryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ElementsController : ControllerBase
{
    private readonly ChemistryDbContext _context;

    public ElementsController(ChemistryDbContext context)
    {
        _context = context;
    }

    // READ tất cả
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var elements = await _context.Elements
            .OrderBy(e => e.Number)
            .ToListAsync();
        return Ok(elements);
    }

    // READ theo số hiệu nguyên tử
    [HttpGet("{number:int}")]
    public async Task<IActionResult> GetByNumber(int number)
    {
        var element = await _context.Elements.FindAsync(number);
        if (element == null)
        {
            return NotFound();
        }

        return Ok(element);
    }

    // READ detail by symbol
    [HttpGet("by-symbol/{symbol}")]
    public async Task<IActionResult> GetBySymbol(string symbol)
    {
        var element = await _context.Elements
            .FirstOrDefaultAsync(e => e.Symbol == symbol);
        if (element == null)
        {
            return NotFound();
        }

        return Ok(element);
    }

    // FILTER theo group / period
    [HttpGet("filter")]
    public async Task<IActionResult> Filter([FromQuery] int? group, [FromQuery] int? period)
    {
        var query = _context.Elements.AsQueryable();

        if (group.HasValue)
        {
            query = query.Where(e => e.Group == group.Value);
        }

        if (period.HasValue)
        {
            query = query.Where(e => e.Period == period.Value);
        }

        var results = await query
            .OrderBy(e => e.Number)
            .ToListAsync();

        return Ok(results);
    }

    // CREATE thủ công (thêm 1 element)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Element element)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        _context.Elements.Add(element);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByNumber), new { number = element.Number }, element);
    }

    // UPDATE theo số hiệu nguyên tử
    [HttpPut("{number:int}")]
    public async Task<IActionResult> Update(int number, [FromBody] Element updated)
    {
        var existing = await _context.Elements.FindAsync(number);
        if (existing == null)
        {
            return NotFound();
        }

        existing.Symbol = updated.Symbol;
        existing.Name = updated.Name;
        existing.Summary = updated.Summary;
        existing.Appearance = updated.Appearance;
        existing.AtomicMass = updated.AtomicMass;
        existing.Boil = updated.Boil;
        existing.Melt = updated.Melt;
        existing.Density = updated.Density;
        existing.MolarHeat = updated.MolarHeat;
        existing.ElectronAffinity = updated.ElectronAffinity;
        existing.ElectronegativityPauling = updated.ElectronegativityPauling;
        existing.Category = updated.Category;
        existing.Phase = updated.Phase;
        existing.Block = updated.Block;
        existing.Period = updated.Period;
        existing.Group = updated.Group;
        existing.ElectronConfiguration = updated.ElectronConfiguration;
        existing.ElectronConfigurationSemantic = updated.ElectronConfigurationSemantic;
        existing.Shells = updated.Shells;
        existing.IonizationEnergies = updated.IonizationEnergies;
        existing.Source = updated.Source;
        existing.SpectralImg = updated.SpectralImg;
        existing.BohrModelImage = updated.BohrModelImage;
        existing.BohrModel3d = updated.BohrModel3d;
        existing.CpkHex = updated.CpkHex;
        existing.DiscoveredBy = updated.DiscoveredBy;
        existing.NamedBy = updated.NamedBy;
        existing.Xpos = updated.Xpos;
        existing.Ypos = updated.Ypos;
        existing.Wxpos = updated.Wxpos;
        existing.Wypos = updated.Wypos;
        existing.ImageTitle = updated.ImageTitle;
        existing.ImageUrl = updated.ImageUrl;
        existing.ImageAttribution = updated.ImageAttribution;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE theo số hiệu nguyên tử
    [HttpDelete("{number:int}")]
    public async Task<IActionResult> Delete(int number)
    {
        var element = await _context.Elements.FindAsync(number);
        if (element == null)
        {
            return NotFound();
        }

        _context.Elements.Remove(element);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // IMPORT danh sách elements từ JSON (body là mảng ElementImportDto)
    [HttpPost("import")]
    public async Task<IActionResult> ImportElements([FromBody] List<ElementImportDto> importDtos)
    {
        if (importDtos == null || importDtos.Count == 0)
        {
            return BadRequest("Dữ liệu trống.");
        }

        var newElements = new List<Element>();

        foreach (var dto in importDtos)
        {
            var element = new Element
            {
                Number = dto.Number,
                Symbol = dto.Symbol ?? string.Empty,
                Name = dto.Name ?? string.Empty,
                Summary = dto.Summary ?? string.Empty,
                Appearance = dto.Appearance ?? string.Empty,
                AtomicMass = dto.AtomicMass,
                Boil = dto.Boil,
                Melt = dto.Melt,
                Density = dto.Density,
                MolarHeat = dto.MolarHeat,
                ElectronAffinity = dto.ElectronAffinity,
                ElectronegativityPauling = dto.ElectronegativityPauling,
                Category = dto.Category ?? string.Empty,
                Phase = dto.Phase ?? string.Empty,
                Block = dto.Block ?? string.Empty,
                Period = dto.Period,
                Group = dto.Group,
                ElectronConfiguration = dto.ElectronConfiguration ?? string.Empty,
                ElectronConfigurationSemantic = dto.ElectronConfigurationSemantic ?? string.Empty,
                Shells = dto.Shells != null ? string.Join(",", dto.Shells) : string.Empty,
                IonizationEnergies = dto.IonizationEnergies != null ? string.Join(",", dto.IonizationEnergies) : string.Empty,
                Source = dto.Source ?? string.Empty,
                SpectralImg = dto.SpectralImg ?? string.Empty,
                BohrModelImage = dto.BohrModelImage ?? string.Empty,
                BohrModel3d = dto.BohrModel3d ?? string.Empty,
                CpkHex = dto.CpkHex ?? string.Empty,
                DiscoveredBy = dto.DiscoveredBy ?? string.Empty,
                NamedBy = dto.NamedBy ?? string.Empty,
                // Xpos là IDENTITY trong DB, để DB tự sinh
                Ypos = dto.Ypos,
                Wxpos = dto.Wxpos,
                Wypos = dto.Wypos,
                ImageTitle = dto.Image?.Title ?? string.Empty,
                ImageUrl = dto.Image?.Url ?? string.Empty,
                ImageAttribution = dto.Image?.Attribution ?? string.Empty
            };

            var exists = await _context.Elements.AnyAsync(e => e.Number == element.Number);
            if (!exists)
            {
                newElements.Add(element);
            }
        }

        if (newElements.Count > 0)
        {
            await _context.Elements.AddRangeAsync(newElements);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = $"Đã nhập thành công {newElements.Count} nguyên tố." });
    }

    [HttpPost("test-upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> TestUpload(IFormFile? file)
    {
        if (file == null)
        {
            return BadRequest(new { 
                message = "No file received", 
                contentType = Request.ContentType,
                hasFormData = Request.HasFormContentType,
                formKeys = Request.Form.Keys.ToArray()
            });
        }

        return Ok(new { 
            fileName = file.FileName, 
            size = file.Length,
            contentType = file.ContentType,
            message = "File received successfully"
        });
    }

    // UPLOAD file JSON (multipart/form-data, file dạng PeriodicTableRoot)
    [HttpPost("upload-json")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadJsonFile(IFormFile? file)
    {
        // Debug info
        var debugInfo = new
        {
            hasFile = file != null,
            contentType = Request.ContentType,
            hasFormData = Request.HasFormContentType,
            formKeys = Request.Form.Keys.ToArray(),
            formFiles = Request.Form.Files.Select(f => new { f.Name, f.FileName, f.Length }).ToArray()
        };

        if (file == null || file.Length == 0)
        {
            return BadRequest(new { 
                message = "Vui lòng chọn file JSON.",
                debug = debugInfo
            });
        }

        try
        {
            // 1. Đọc toàn bộ nội dung file
            using var stream = new StreamReader(file.OpenReadStream());
            var jsonString = await stream.ReadToEndAsync();

            // 2. Parse JSON về PeriodicTableRoot (có property elements)
            var data = JsonSerializer.Deserialize<PeriodicTableRoot>(jsonString, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (data?.Elements == null || data.Elements.Count == 0)
            {
                return BadRequest("Format file không đúng hoặc không có dữ liệu elements.");
            }

            var newElements = new List<Element>();

            foreach (var dto in data.Elements)
            {
                var element = new Element
                {
                    Number = dto.Number,
                    Symbol = dto.Symbol ?? string.Empty,
                    Name = dto.Name ?? string.Empty,
                    Summary = dto.Summary ?? string.Empty,
                    Appearance = dto.Appearance ?? string.Empty,
                    AtomicMass = dto.AtomicMass,
                    Boil = dto.Boil,
                    Melt = dto.Melt,
                    Density = dto.Density,
                    MolarHeat = dto.MolarHeat,
                    ElectronAffinity = dto.ElectronAffinity,
                    ElectronegativityPauling = dto.ElectronegativityPauling,
                    Category = dto.Category ?? string.Empty,
                    Phase = dto.Phase ?? string.Empty,
                    Block = dto.Block ?? string.Empty,
                    Period = dto.Period,
                    Group = dto.Group,
                    ElectronConfiguration = dto.ElectronConfiguration ?? string.Empty,
                    ElectronConfigurationSemantic = dto.ElectronConfigurationSemantic ?? string.Empty,
                    Shells = dto.Shells != null ? string.Join(",", dto.Shells) : string.Empty,
                    IonizationEnergies = dto.IonizationEnergies != null ? string.Join(",", dto.IonizationEnergies) : string.Empty,
                    Source = dto.Source ?? string.Empty,
                    SpectralImg = dto.SpectralImg ?? string.Empty,
                    BohrModelImage = dto.BohrModelImage ?? string.Empty,
                    BohrModel3d = dto.BohrModel3d ?? string.Empty,
                    CpkHex = dto.CpkHex ?? string.Empty,
                    DiscoveredBy = dto.DiscoveredBy ?? string.Empty,
                    NamedBy = dto.NamedBy ?? string.Empty,
                    // Xpos là IDENTITY trong DB, để DB tự sinh
                    Ypos = dto.Ypos,
                    Wxpos = dto.Wxpos,
                    Wypos = dto.Wypos,
                    ImageTitle = dto.Image?.Title ?? string.Empty,
                    ImageUrl = dto.Image?.Url ?? string.Empty,
                    ImageAttribution = dto.Image?.Attribution ?? string.Empty
                };

                var exists = await _context.Elements.AnyAsync(e => e.Number == element.Number);
                if (!exists)
                {
                    newElements.Add(element);
                }
            }

            if (newElements.Count > 0)
            {
                await _context.Elements.AddRangeAsync(newElements);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = $"Đã import thành công {newElements.Count} nguyên tố từ file." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Lỗi: " + ex.Message);
        }
    }
}


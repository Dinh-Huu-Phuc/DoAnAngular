using System.Security.Cryptography;
using System.Text;
using ChemistryAPI.Data;
using ChemistryAPI.DTOs;
using ChemistryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChemistryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ChemistryDbContext _context;

    public AuthController(ChemistryDbContext context)
    {
        _context = context;
    }

    public record LoginRequest(string Username, string Password);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Username, email and password are required.");
        }

        if (!string.Equals(request.Password, request.ConfirmPassword, StringComparison.Ordinal))
        {
            return BadRequest("Password and ConfirmPassword do not match.");
        }

        // TODO: validate Captcha if you implement Captcha logic

        var usernameExists = await _context.Users.AnyAsync(u => u.Username == request.Username);
        if (usernameExists)
        {
            return Conflict("Username already exists.");
        }

        var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
        if (emailExists)
        {
            return Conflict("Email already exists.");
        }

        var user = new User
        {
            FullName = request.FullName,
            Username = request.Username,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = HashPassword(request.Password),
            Role = "Student",
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Username,
            user.Email,
            user.PhoneNumber,
            user.Role,
            user.CreatedAt
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null)
        {
            return Unauthorized("Invalid username or password.");
        }

        var hash = HashPassword(request.Password);
        if (!string.Equals(user.PasswordHash, hash, StringComparison.Ordinal))
        {
            return Unauthorized("Invalid username or password.");
        }

        // For now we don't implement JWT. Return basic user info for the frontend to manage session.
        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Username,
            user.Email,
            user.PhoneNumber,
            user.Role,
            user.CreatedAt
        });
    }

    [HttpGet("user/{id:int}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Username,
            user.Email,
            user.PhoneNumber,
            user.Role,
            user.CreatedAt
        });
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hashBytes = sha256.ComputeHash(bytes);
        return Convert.ToHexString(hashBytes);
    }
}

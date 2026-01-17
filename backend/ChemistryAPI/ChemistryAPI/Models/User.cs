using System;
using System.ComponentModel.DataAnnotations;

namespace ChemistryAPI.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(15)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    // Vai trò người dùng (Student, Admin, ...)
    public string Role { get; set; } = "Student";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

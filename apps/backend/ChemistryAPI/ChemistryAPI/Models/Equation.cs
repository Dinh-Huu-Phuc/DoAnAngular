using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChemistryAPI.Models;

[Table("Equations")]
public class Equation
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Reactants { get; set; } = string.Empty; // Chất tham gia (để search)

    [Required]
    [MaxLength(200)]
    public string Products { get; set; } = string.Empty; // Chất sản phẩm

    [Required]
    public string BalancedEquation { get; set; } = string.Empty; // Phương trình hoàn chỉnh

    [MaxLength(100)]
    public string Condition { get; set; } = string.Empty; // Điều kiện

    public string Phenomenon { get; set; } = string.Empty; // Hiện tượng

    [MaxLength(20)]
    public string Level { get; set; } = string.Empty; // THCS, THPT...

    // Lưu tags dưới dạng chuỗi JSON (VD: '["sat", "kim_loai"]')
    public string Tags { get; set; } = "[]";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}




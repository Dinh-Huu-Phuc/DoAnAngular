using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChemistryAPI.Models;

[Table("Elements")]
public class Element
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)] // dùng số hiệu nguyên tử làm khóa chính
    public int Number { get; set; } // Atomic number

    [Required]
    [MaxLength(5)]
    public string Symbol { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;
    public string Appearance { get; set; } = string.Empty;

    // Các chỉ số vật lý
    public double AtomicMass { get; set; }
    public double? Boil { get; set; }
    public double? Melt { get; set; }
    public double? Density { get; set; }
    public double? MolarHeat { get; set; }
    public double? ElectronAffinity { get; set; }
    public double? ElectronegativityPauling { get; set; }

    // Phân loại
    public string Category { get; set; } = string.Empty;
    public string Phase { get; set; } = string.Empty;
    public string Block { get; set; } = string.Empty;
    public int Period { get; set; }
    public int Group { get; set; }

    // Cấu hình electron
    public string ElectronConfiguration { get; set; } = string.Empty;
    public string ElectronConfigurationSemantic { get; set; } = string.Empty;

    // Lưu mảng dưới dạng chuỗi
    public string Shells { get; set; } = string.Empty; // ví dụ: "2,8,1"
    public string IonizationEnergies { get; set; } = string.Empty; // ví dụ: "13.6,24.6,54.4"

    // Thông tin hình ảnh & 3D
    public string Source { get; set; } = string.Empty;
    public string SpectralImg { get; set; } = string.Empty;
    public string BohrModelImage { get; set; } = string.Empty;
    public string BohrModel3d { get; set; } = string.Empty;

    // Màu sắc (CPK Hex)
    public string CpkHex { get; set; } = string.Empty;

    // Thông tin người tìm ra / đặt tên
    public string DiscoveredBy { get; set; } = string.Empty;
    public string NamedBy { get; set; } = string.Empty;

    // Tọa độ hiển thị
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Xpos { get; set; } // cột này vẫn đang là IDENTITY trong DB
    public int Ypos { get; set; }
    public int Wxpos { get; set; }
    public int Wypos { get; set; }

    // Thông tin image (flatten từ object con)
    public string ImageTitle { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string ImageAttribution { get; set; } = string.Empty;
}

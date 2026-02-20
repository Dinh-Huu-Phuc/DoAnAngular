using ChemistryAPI.Data;
using ChemistryAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ChemistryAPI.Services
{
    public class ExperimentSeedService
    {
        private readonly ChemistryDbContext _context;

        public ExperimentSeedService(ChemistryDbContext context)
        {
            _context = context;
        }

        public async Task SeedDefaultExperimentsAsync()
        {
            // Kiểm tra xem đã có thí nghiệm mặc định chưa
            if (await _context.Experiments.AnyAsync(e => e.IsDefault))
                return;

            var defaultExperiments = new List<Experiment>
            {
                new Experiment
                {
                    Title = "Phản ứng trung hòa acid-base",
                    Description = "Quan sát đổi màu chỉ thị khi trung hòa acid mạnh với base mạnh. Thí nghiệm cơ bản để hiểu về pH và chỉ thị màu.",
                    Level = "THCS",
                    Type = "acid-base",
                    IsDefault = true,
                    IsPublic = true,
                    Tags = JsonSerializer.Serialize(new[] { "pH", "nhiệt độ", "chỉ thị" }),
                    TemperatureMin = 15.0m, TemperatureMax = 35.0m, TemperatureDefault = 25.0m,
                    ConcentrationMin = 0.01m, ConcentrationMax = 2.0m, ConcentrationDefault = 0.1m,
                    VolumeMin = 10.0m, VolumeMax = 100.0m, VolumeDefault = 50.0m,
                    TimeMin = 10, TimeMax = 300, TimeDefault = 60,
                    Reactions = JsonSerializer.Serialize(new[] { "HCl + NaOH → NaCl + H₂O" }),
                    Phenomena = JsonSerializer.Serialize(new[] { "Đổi màu chỉ thị", "Tăng nhiệt độ", "pH thay đổi" })
                },
                new Experiment
                {
                    Title = "Phân hủy nhiệt KMnO₄",
                    Description = "Phân hủy kali permanganat khi đun nóng để tạo ra oxy. Thí nghiệm điển hình về phản ứng phân hủy.",
                    Level = "THCS",
                    Type = "decomposition",
                    IsDefault = true,
                    IsPublic = true,
                    Tags = JsonSerializer.Serialize(new[] { "nhiệt độ", "oxy", "phân hủy" }),
                    TemperatureMin = 200.0m, TemperatureMax = 400.0m, TemperatureDefault = 300.0m,
                    ConcentrationMin = 0.1m, ConcentrationMax = 1.0m, ConcentrationDefault = 0.5m,
                    VolumeMin = 1.0m, VolumeMax = 10.0m, VolumeDefault = 5.0m,
                    TimeMin = 300, TimeMax = 1800, TimeDefault = 600,
                    Reactions = JsonSerializer.Serialize(new[] { "2KMnO₄ → K₂MnO₄ + MnO₂ + O₂" }),
                    Phenomena = JsonSerializer.Serialize(new[] { "Đổi màu từ tím sang xanh đen", "Thoát khí O₂", "Tăng nhiệt độ" })
                },
                new Experiment
                {
                    Title = "Điện phân dung dịch NaCl",
                    Description = "Điện phân dung dịch muối ăn để tạo ra khí clo và natri hydroxide. Thí nghiệm về điện hóa học.",
                    Level = "THPT",
                    Type = "electrolysis",
                    IsDefault = true,
                    IsPublic = true,
                    Tags = JsonSerializer.Serialize(new[] { "điện phân", "khí clo", "điện cực" }),
                    TemperatureMin = 20.0m, TemperatureMax = 40.0m, TemperatureDefault = 25.0m,
                    ConcentrationMin = 0.5m, ConcentrationMax = 3.0m, ConcentrationDefault = 1.0m,
                    VolumeMin = 50.0m, VolumeMax = 200.0m, VolumeDefault = 100.0m,
                    TimeMin = 600, TimeMax = 3600, TimeDefault = 1200,
                    Reactions = JsonSerializer.Serialize(new[] { "2NaCl + 2H₂O → 2NaOH + H₂ + Cl₂" }),
                    Phenomena = JsonSerializer.Serialize(new[] { "Thoát khí H₂ ở cathode", "Thoát khí Cl₂ ở anode", "Dung dịch chuyển màu" })
                },
                new Experiment
                {
                    Title = "Cân bằng hóa học Fe³⁺ + SCN⁻",
                    Description = "Nghiên cứu cân bằng hóa học qua phản ứng tạo phức màu đỏ máu. Ảnh hưởng của nồng độ đến cân bằng.",
                    Level = "THPT",
                    Type = "equilibrium",
                    IsDefault = true,
                    IsPublic = true,
                    Tags = JsonSerializer.Serialize(new[] { "cân bằng", "phức chất", "màu sắc" }),
                    TemperatureMin = 15.0m, TemperatureMax = 30.0m, TemperatureDefault = 25.0m,
                    ConcentrationMin = 0.001m, ConcentrationMax = 0.1m, ConcentrationDefault = 0.01m,
                    VolumeMin = 5.0m, VolumeMax = 50.0m, VolumeDefault = 20.0m,
                    TimeMin = 30, TimeMax = 600, TimeDefault = 120,
                    Reactions = JsonSerializer.Serialize(new[] { "Fe³⁺ + SCN⁻ ⇌ [Fe(SCN)]²⁺" }),
                    Phenomena = JsonSerializer.Serialize(new[] { "Xuất hiện màu đỏ máu", "Thay đổi cường độ màu", "Cân bằng dịch chuyển" })
                },
                new Experiment
                {
                    Title = "Đốt cháy Mg trong không khí",
                    Description = "Phản ứng đốt cháy magie tạo ra ánh sáng trắng chói và MgO. Thí nghiệm về phản ứng oxi hóa khử.",
                    Level = "THCS",
                    Type = "combustion",
                    IsDefault = true,
                    IsPublic = true,
                    Tags = JsonSerializer.Serialize(new[] { "đốt cháy", "ánh sáng", "oxi hóa" }),
                    TemperatureMin = 400.0m, TemperatureMax = 800.0m, TemperatureDefault = 600.0m,
                    ConcentrationMin = 0.0m, ConcentrationMax = 0.0m, ConcentrationDefault = 0.0m,
                    VolumeMin = 0.1m, VolumeMax = 2.0m, VolumeDefault = 0.5m,
                    TimeMin = 5, TimeMax = 60, TimeDefault = 15,
                    Reactions = JsonSerializer.Serialize(new[] { "2Mg + O₂ → 2MgO" }),
                    Phenomena = JsonSerializer.Serialize(new[] { "Ánh sáng trắng chói", "Tạo bột trắng MgO", "Tỏa nhiều nhiệt" })
                },
                new Experiment
                {
                    Title = "Phản ứng tạo kết tủa AgCl",
                    Description = "Tạo kết tủa bạc chloride từ dung dịch AgNO₃ và HCl. Thí nghiệm về phản ứng trao đổi ion.",
                    Level = "THPT",
                    Type = "precipitation",
                    IsDefault = true,
                    IsPublic = true,
                    Tags = JsonSerializer.Serialize(new[] { "kết tủa", "ion bạc", "chloride" }),
                    TemperatureMin = 15.0m, TemperatureMax = 35.0m, TemperatureDefault = 25.0m,
                    ConcentrationMin = 0.01m, ConcentrationMax = 0.5m, ConcentrationDefault = 0.1m,
                    VolumeMin = 10.0m, VolumeMax = 100.0m, VolumeDefault = 25.0m,
                    TimeMin = 10, TimeMax = 300, TimeDefault = 60,
                    Reactions = JsonSerializer.Serialize(new[] { "AgNO₃ + HCl → AgCl↓ + HNO₃" }),
                    Phenomena = JsonSerializer.Serialize(new[] { "Xuất hiện kết tủa trắng", "Dung dịch đục", "Kết tủa lắng xuống" })
                },
                new Experiment
                {
                    Title = "Xúc tác phân hủy H₂O₂ bằng MnO₂",
                    Description = "Sử dụng MnO₂ làm xúc tác để phân hủy hydrogen peroxide tạo oxy. Nghiên cứu về xúc tác.",
                    Level = "Đại học",
                    Type = "catalysis",
                    IsDefault = true,
                    IsPublic = true,
                    Tags = JsonSerializer.Serialize(new[] { "xúc tác", "hydrogen peroxide", "động học" }),
                    TemperatureMin = 20.0m, TemperatureMax = 60.0m, TemperatureDefault = 35.0m,
                    ConcentrationMin = 0.1m, ConcentrationMax = 3.0m, ConcentrationDefault = 1.0m,
                    VolumeMin = 10.0m, VolumeMax = 200.0m, VolumeDefault = 50.0m,
                    TimeMin = 30, TimeMax = 1800, TimeDefault = 300,
                    Reactions = JsonSerializer.Serialize(new[] { "2H₂O₂ → 2H₂O + O₂ (MnO₂)" }),
                    Phenomena = JsonSerializer.Serialize(new[] { "Sủi bọt mạnh", "Thoát khí O₂", "Tăng tốc độ phản ứng" })
                },
                new Experiment
                {
                    Title = "Phản ứng oxi hóa khử Zn + CuSO₄",
                    Description = "Phản ứng giữa kẽm và đồng sulfate, quan sát sự thay đổi màu sắc và khối lượng. Chuỗi hoạt động kim loại.",
                    Level = "Đại học",
                    Type = "redox",
                    IsDefault = true,
                    IsPublic = true,
                    Tags = JsonSerializer.Serialize(new[] { "oxi hóa khử", "kim loại", "điện thế" }),
                    TemperatureMin = 15.0m, TemperatureMax = 40.0m, TemperatureDefault = 25.0m,
                    ConcentrationMin = 0.1m, ConcentrationMax = 2.0m, ConcentrationDefault = 0.5m,
                    VolumeMin = 20.0m, VolumeMax = 200.0m, VolumeDefault = 100.0m,
                    TimeMin = 300, TimeMax = 3600, TimeDefault = 1800,
                    Reactions = JsonSerializer.Serialize(new[] { "Zn + CuSO₄ → ZnSO₄ + Cu" }),
                    Phenomena = JsonSerializer.Serialize(new[] { "Kẽm tan dần", "Xuất hiện lớp đồng đỏ", "Dung dịch nhạt màu" })
                }
            };

            _context.Experiments.AddRange(defaultExperiments);
            await _context.SaveChangesAsync();
        }
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChemistryAPI.Models
{
    public class SimulationResult
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string ExperimentId { get; set; } = string.Empty;

        [Required]
        public int UserId { get; set; }

        [Column(TypeName = "json")]
        public string Parameters { get; set; } = string.Empty;

        [Column(TypeName = "json")]
        public string Results { get; set; } = string.Empty;

        public int Duration { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? Efficiency { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
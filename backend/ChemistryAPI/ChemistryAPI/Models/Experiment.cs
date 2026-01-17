using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChemistryAPI.Models
{
    public class Experiment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Level { get; set; } = string.Empty; // THCS, THPT, Đại học

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // acid-base, decomposition, etc.

        public int? CreatorId { get; set; }
        
        [ForeignKey("CreatorId")]
        public User? Creator { get; set; }

        public bool IsDefault { get; set; } = false;
        
        public bool IsPublic { get; set; } = false;

        [MaxLength(500)]
        public string? Tags { get; set; } // JSON array

        // Parameters
        [Column(TypeName = "decimal(8,2)")]
        public decimal TemperatureMin { get; set; }

        [Column(TypeName = "decimal(8,2)")]
        public decimal TemperatureMax { get; set; }

        [Column(TypeName = "decimal(8,2)")]
        public decimal TemperatureDefault { get; set; }

        [Column(TypeName = "decimal(8,4)")]
        public decimal ConcentrationMin { get; set; }

        [Column(TypeName = "decimal(8,4)")]
        public decimal ConcentrationMax { get; set; }

        [Column(TypeName = "decimal(8,4)")]
        public decimal ConcentrationDefault { get; set; }

        [Column(TypeName = "decimal(8,2)")]
        public decimal VolumeMin { get; set; }

        [Column(TypeName = "decimal(8,2)")]
        public decimal VolumeMax { get; set; }

        [Column(TypeName = "decimal(8,2)")]
        public decimal VolumeDefault { get; set; }

        public int TimeMin { get; set; }
        
        public int TimeMax { get; set; }
        
        public int TimeDefault { get; set; }

        // JSON arrays
        public string? Reactions { get; set; } // JSON array of reactions

        public string? Phenomena { get; set; } // JSON array of phenomena

        // Metadata
        public int ViewCount { get; set; } = 0;
        
        public int LikeCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
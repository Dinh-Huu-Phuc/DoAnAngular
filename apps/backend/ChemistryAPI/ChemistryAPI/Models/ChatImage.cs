using System.ComponentModel.DataAnnotations;

namespace ChemistryAPI.Models
{
    public class ChatImage
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string FileName { get; set; } = string.Empty;
        
        [Required]
        public string ContentType { get; set; } = string.Empty;
        
        [Required]
        public byte[] ImageData { get; set; } = Array.Empty<byte>();
        
        public long FileSize { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign key to ChatHistory if needed
        public int? ChatHistoryId { get; set; }
        public ChatHistory? ChatHistory { get; set; }
        
        // Foreign key to User
        public int? UserId { get; set; }
        public User? User { get; set; }
    }
}
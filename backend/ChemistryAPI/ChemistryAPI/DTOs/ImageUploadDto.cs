using System.ComponentModel.DataAnnotations;

namespace ChemistryAPI.DTOs
{
    public class ImageUploadDto
    {
        public IFormFile? Image { get; set; }
        
        public int? ChatHistoryId { get; set; }
        
        public int? UserId { get; set; }
    }
    
    public class ImageResponseDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class ChatWithImageDto
    {
        [Required]
        public string Question { get; set; } = string.Empty;
        
        public IFormFile? Image { get; set; }
        
        public int? UserId { get; set; }
        
        public int? ChatHistoryId { get; set; }
    }
}
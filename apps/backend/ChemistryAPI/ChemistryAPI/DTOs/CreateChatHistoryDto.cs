using System.ComponentModel.DataAnnotations;

namespace ChemistryAPI.DTOs
{
    public class CreateChatHistoryDto
    {
        public int? UserId { get; set; } // Nullable - có thể chat không đăng nhập

        [Required]
        [StringLength(5000)]
        public string Prompt { get; set; } = string.Empty;

        [Required]
        [StringLength(10000)]
        public string Response { get; set; } = string.Empty;

        public int? ConversationId { get; set; } // Nullable
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChemistryAPI.Models;

[Table("ChatHistories")]
public class ChatHistory
{
    [Key]
    public int Id { get; set; }

    public int? UserId { get; set; } // Nullable vì có thể chat không đăng nhập

    public int? ConversationId { get; set; } // Nullable - có thể không thuộc conversation nào

    [Required]
    public string Prompt { get; set; } = string.Empty; // Câu hỏi của người dùng

    [Required]
    public string Response { get; set; } = string.Empty; // Phản hồi từ AI

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? User { get; set; }
    public Conversation? Conversation { get; set; }
}


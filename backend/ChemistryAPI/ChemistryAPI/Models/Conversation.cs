using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChemistryAPI.Models;

[Table("Conversations")]
public class Conversation
{
    [Key]
    public int Id { get; set; }

    public int? UserId { get; set; } // Nullable vì có thể chat không đăng nhập

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty; // Tiêu đề conversation (có thể tự động tạo từ tin nhắn đầu)

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? User { get; set; }
    public ICollection<ChatHistory> ChatHistories { get; set; } = new List<ChatHistory>();
}



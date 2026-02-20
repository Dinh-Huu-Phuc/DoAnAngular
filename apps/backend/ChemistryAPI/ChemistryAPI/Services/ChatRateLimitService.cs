using Microsoft.Extensions.Caching.Memory;

namespace ChemistryAPI.Services;

public class ChatRateLimitService
{
    private readonly IMemoryCache _cache;
    private const int MaxRequests = 10;          // 10 lần hỏi
    private const int WindowMinutes = 60;        // trong 60 phút

    public ChatRateLimitService(IMemoryCache cache)
    {
        _cache = cache;
    }

    /// <summary>
    /// Kiểm tra và ghi nhận 1 lượt hỏi cho user.
    /// Trả về (allowed, remaining, resetSeconds).
    /// </summary>
    public (bool Allowed, int Remaining, int ResetInSeconds) CheckAndRecord(int userId)
    {
        var key = $"chat_rate:{userId}";

        if (!_cache.TryGetValue(key, out RateLimitEntry? entry) || entry == null)
        {
            // Lần đầu hỏi – tạo entry mới
            entry = new RateLimitEntry
            {
                Count = 1,
                WindowStart = DateTime.UtcNow
            };

            _cache.Set(key, entry, TimeSpan.FromMinutes(WindowMinutes));

            return (true, MaxRequests - 1, WindowMinutes * 60);
        }

        var elapsed = DateTime.UtcNow - entry.WindowStart;

        // Hết cửa sổ 60 phút → reset
        if (elapsed.TotalMinutes >= WindowMinutes)
        {
            entry.Count = 1;
            entry.WindowStart = DateTime.UtcNow;
            _cache.Set(key, entry, TimeSpan.FromMinutes(WindowMinutes));

            return (true, MaxRequests - 1, WindowMinutes * 60);
        }

        // Còn trong cửa sổ
        var resetInSeconds = (int)(TimeSpan.FromMinutes(WindowMinutes) - elapsed).TotalSeconds;

        if (entry.Count >= MaxRequests)
        {
            // Đã hết lượt
            return (false, 0, resetInSeconds);
        }

        // Còn lượt → tăng count
        entry.Count++;
        _cache.Set(key, entry, TimeSpan.FromMinutes(WindowMinutes));

        return (true, MaxRequests - entry.Count, resetInSeconds);
    }

    /// <summary>
    /// Lấy thông tin rate limit hiện tại (không tăng count)
    /// </summary>
    public (int Remaining, int ResetInSeconds) GetStatus(int userId)
    {
        var key = $"chat_rate:{userId}";

        if (!_cache.TryGetValue(key, out RateLimitEntry? entry) || entry == null)
        {
            return (MaxRequests, 0);
        }

        var elapsed = DateTime.UtcNow - entry.WindowStart;

        if (elapsed.TotalMinutes >= WindowMinutes)
        {
            return (MaxRequests, 0);
        }

        var resetInSeconds = (int)(TimeSpan.FromMinutes(WindowMinutes) - elapsed).TotalSeconds;
        var remaining = Math.Max(0, MaxRequests - entry.Count);

        return (remaining, resetInSeconds);
    }

    private class RateLimitEntry
    {
        public int Count { get; set; }
        public DateTime WindowStart { get; set; }
    }
}

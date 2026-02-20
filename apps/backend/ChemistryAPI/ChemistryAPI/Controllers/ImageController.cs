using ChemistryAPI.Data;
using ChemistryAPI.DTOs;
using ChemistryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChemistryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImageController : ControllerBase
    {
        private readonly ChemistryDbContext _context;
        private readonly ILogger<ImageController> _logger;

        public ImageController(ChemistryDbContext context, ILogger<ImageController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ImageResponseDto>> UploadImage(ImageUploadDto uploadDto)
        {
            try
            {
                // Validate file
                if (uploadDto.Image == null || uploadDto.Image.Length == 0)
                {
                    return BadRequest(new { message = "No image file provided", field = "Image" });
                }

                // Check file size (max 5MB)
                if (uploadDto.Image.Length > 5 * 1024 * 1024)
                {
                    return BadRequest("File size exceeds 5MB limit");
                }

                // Check file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
                if (!allowedTypes.Contains(uploadDto.Image.ContentType.ToLower()))
                {
                    return BadRequest("Only image files (JPEG, PNG, GIF, WebP) are allowed");
                }

                // Convert to byte array
                byte[] imageData;
                using (var memoryStream = new MemoryStream())
                {
                    await uploadDto.Image.CopyToAsync(memoryStream);
                    imageData = memoryStream.ToArray();
                }

                // Create ChatImage entity
                var chatImage = new ChatImage
                {
                    FileName = uploadDto.Image.FileName,
                    ContentType = uploadDto.Image.ContentType,
                    ImageData = imageData,
                    FileSize = uploadDto.Image.Length,
                    ChatHistoryId = uploadDto.ChatHistoryId,
                    UserId = uploadDto.UserId,
                    UploadedAt = DateTime.UtcNow
                };

                _context.ChatImages.Add(chatImage);
                await _context.SaveChangesAsync();

                var response = new ImageResponseDto
                {
                    Id = chatImage.Id,
                    FileName = chatImage.FileName,
                    ContentType = chatImage.ContentType,
                    FileSize = chatImage.FileSize,
                    UploadedAt = chatImage.UploadedAt,
                    ImageUrl = $"/api/image/{chatImage.Id}"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetImage(int id)
        {
            try
            {
                var image = await _context.ChatImages.FindAsync(id);
                if (image == null)
                {
                    return NotFound();
                }

                return File(image.ImageData, image.ContentType, image.FileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving image {ImageId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<ImageResponseDto>>> GetUserImages(int userId)
        {
            try
            {
                var images = await _context.ChatImages
                    .Where(ci => ci.UserId == userId)
                    .OrderByDescending(ci => ci.UploadedAt)
                    .Select(ci => new ImageResponseDto
                    {
                        Id = ci.Id,
                        FileName = ci.FileName,
                        ContentType = ci.ContentType,
                        FileSize = ci.FileSize,
                        UploadedAt = ci.UploadedAt,
                        ImageUrl = $"/api/image/{ci.Id}"
                    })
                    .ToListAsync();

                return Ok(images);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user images for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            try
            {
                var image = await _context.ChatImages.FindAsync(id);
                if (image == null)
                {
                    return NotFound();
                }

                _context.ChatImages.Remove(image);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image {ImageId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
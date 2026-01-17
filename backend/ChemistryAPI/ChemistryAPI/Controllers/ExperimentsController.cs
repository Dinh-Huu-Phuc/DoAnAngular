using ChemistryAPI.Data;
using ChemistryAPI.DTOs;
using ChemistryAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace ChemistryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExperimentsController : ControllerBase
    {
        private readonly ChemistryDbContext _context;

        public ExperimentsController(ChemistryDbContext context)
        {
            _context = context;
        }

        // GET api/experiments/health - Health check endpoint
        [HttpGet("health")]
        public ActionResult GetHealth()
        {
            return Ok(new { 
                status = "ok", 
                timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ") 
            });
        }

        // GET api/experiments/user/{userId} - Lấy thí nghiệm của user cụ thể
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<ExperimentDto>>> GetUserExperiments(int userId)
        {
            var experiments = await _context.Experiments
                .Include(e => e.Creator)
                .Where(e => e.CreatorId == userId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            return Ok(experiments.Select(MapToDto).ToList());
        }

        // GET api/experiments - Lấy tất cả thí nghiệm (có filter)
        [HttpGet]
        public async Task<ActionResult<List<ExperimentDto>>> GetExperiments(
            [FromQuery] string? level = null,
            [FromQuery] string? type = null,
            [FromQuery] bool? isPublic = null,
            [FromQuery] string? search = null)
        {
            var query = _context.Experiments.Include(e => e.Creator).AsQueryable();

            if (!string.IsNullOrEmpty(level))
                query = query.Where(e => e.Level == level);

            if (!string.IsNullOrEmpty(type))
                query = query.Where(e => e.Type == type);

            if (isPublic.HasValue)
                query = query.Where(e => e.IsPublic == isPublic.Value);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(e => e.Title.Contains(search) || e.Description.Contains(search));

            var experiments = await query.OrderByDescending(e => e.CreatedAt).ToListAsync();

            return Ok(experiments.Select(MapToDto).ToList());
        }

        // GET api/experiments/{id} - Lấy thí nghiệm theo ID
        [HttpGet("{id}")]
        public async Task<ActionResult<ExperimentDto>> GetExperiment(int id)
        {
            var experiment = await _context.Experiments
                .Include(e => e.Creator)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (experiment == null)
                return NotFound();

            // Tăng view count
            experiment.ViewCount++;
            await _context.SaveChangesAsync();

            return Ok(MapToDto(experiment));
        }

        // POST api/experiments - Tạo thí nghiệm mới
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ExperimentDto>> CreateExperiment(CreateExperimentDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var experiment = new Experiment
            {
                Title = dto.Title,
                Description = dto.Description,
                Level = dto.Level,
                Type = dto.Type,
                CreatorId = userId,
                IsPublic = dto.IsPublic,
                Tags = JsonSerializer.Serialize(dto.Tags),
                TemperatureMin = dto.Parameters.Temperature.Min,
                TemperatureMax = dto.Parameters.Temperature.Max,
                TemperatureDefault = dto.Parameters.Temperature.Default,
                ConcentrationMin = dto.Parameters.Concentration.Min,
                ConcentrationMax = dto.Parameters.Concentration.Max,
                ConcentrationDefault = dto.Parameters.Concentration.Default,
                VolumeMin = dto.Parameters.Volume.Min,
                VolumeMax = dto.Parameters.Volume.Max,
                VolumeDefault = dto.Parameters.Volume.Default,
                TimeMin = (int)dto.Parameters.Time.Min,
                TimeMax = (int)dto.Parameters.Time.Max,
                TimeDefault = (int)dto.Parameters.Time.Default,
                Reactions = JsonSerializer.Serialize(dto.Reactions),
                Phenomena = JsonSerializer.Serialize(dto.Phenomena)
            };

            _context.Experiments.Add(experiment);
            await _context.SaveChangesAsync();

            var createdExperiment = await _context.Experiments
                .Include(e => e.Creator)
                .FirstAsync(e => e.Id == experiment.Id);

            return CreatedAtAction(nameof(GetExperiment), new { id = experiment.Id }, MapToDto(createdExperiment));
        }
        // PUT api/experiments/{id} - Cập nhật thí nghiệm
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<ExperimentDto>> UpdateExperiment(int id, UpdateExperimentDto dto)
        {
            var experiment = await _context.Experiments.FindAsync(id);
            if (experiment == null)
                return NotFound();

            var userId = GetCurrentUserId();
            if (experiment.CreatorId != userId)
                return Forbid();

            experiment.Title = dto.Title;
            experiment.Description = dto.Description;
            experiment.Level = dto.Level;
            experiment.Type = dto.Type;
            experiment.IsPublic = dto.IsPublic;
            experiment.Tags = JsonSerializer.Serialize(dto.Tags);
            experiment.TemperatureMin = dto.Parameters.Temperature.Min;
            experiment.TemperatureMax = dto.Parameters.Temperature.Max;
            experiment.TemperatureDefault = dto.Parameters.Temperature.Default;
            experiment.ConcentrationMin = dto.Parameters.Concentration.Min;
            experiment.ConcentrationMax = dto.Parameters.Concentration.Max;
            experiment.ConcentrationDefault = dto.Parameters.Concentration.Default;
            experiment.VolumeMin = dto.Parameters.Volume.Min;
            experiment.VolumeMax = dto.Parameters.Volume.Max;
            experiment.VolumeDefault = dto.Parameters.Volume.Default;
            experiment.TimeMin = (int)dto.Parameters.Time.Min;
            experiment.TimeMax = (int)dto.Parameters.Time.Max;
            experiment.TimeDefault = (int)dto.Parameters.Time.Default;
            experiment.Reactions = JsonSerializer.Serialize(dto.Reactions);
            experiment.Phenomena = JsonSerializer.Serialize(dto.Phenomena);
            experiment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedExperiment = await _context.Experiments
                .Include(e => e.Creator)
                .FirstAsync(e => e.Id == id);

            return Ok(MapToDto(updatedExperiment));
        }

        // DELETE api/experiments/{id} - Xóa thí nghiệm
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteExperiment(int id)
        {
            var experiment = await _context.Experiments.FindAsync(id);
            if (experiment == null)
                return NotFound();

            var userId = GetCurrentUserId();
            if (experiment.CreatorId != userId)
                return Forbid();

            _context.Experiments.Remove(experiment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET api/experiments/my - Lấy thí nghiệm của user hiện tại
        [HttpGet("my")]
        [Authorize]
        public async Task<ActionResult<List<ExperimentDto>>> GetMyExperiments()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var experiments = await _context.Experiments
                .Include(e => e.Creator)
                .Where(e => e.CreatorId == userId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            return Ok(experiments.Select(MapToDto).ToList());
        }

        // POST api/experiments/{id}/favorite - Yêu thích thí nghiệm
        [HttpPost("{id}/favorite")]
        [Authorize]
        public async Task<ActionResult> ToggleFavorite(int id)
        {
            var experiment = await _context.Experiments.FindAsync(id);
            if (experiment == null)
                return NotFound();

            // Tăng like count (đơn giản hóa, không track user đã like chưa)
            experiment.LikeCount++;
            await _context.SaveChangesAsync();

            return Ok(new { likeCount = experiment.LikeCount });
        }

        // POST api/experiments/results - Lưu kết quả simulation
        [HttpPost("results")]
        public async Task<ActionResult<SimulationResultDto>> SaveSimulationResult(SaveResultRequest request)
        {
            var simulationResult = new SimulationResult
            {
                ExperimentId = request.ExperimentId,
                UserId = request.UserId,
                Parameters = JsonSerializer.Serialize(request.Parameters),
                Results = JsonSerializer.Serialize(request.Results),
                Duration = request.Duration,
                Efficiency = request.Efficiency,
                CreatedAt = DateTime.UtcNow
            };

            _context.SimulationResults.Add(simulationResult);
            await _context.SaveChangesAsync();

            var resultDto = new SimulationResultDto
            {
                Id = simulationResult.Id,
                ExperimentId = simulationResult.ExperimentId,
                UserId = simulationResult.UserId,
                Parameters = simulationResult.Parameters,
                Results = simulationResult.Results,
                Duration = simulationResult.Duration,
                Efficiency = simulationResult.Efficiency,
                CreatedAt = simulationResult.CreatedAt
            };

            return Ok(resultDto);
        }

        // GET api/experiments/results/{experimentId}/{userId} - Lấy kết quả simulation
        [HttpGet("results/{experimentId}/{userId}")]
        public async Task<ActionResult<List<SimulationResultDto>>> GetSimulationResults(string experimentId, int userId)
        {
            var results = await _context.SimulationResults
                .Where(sr => sr.ExperimentId == experimentId && sr.UserId == userId)
                .OrderByDescending(sr => sr.CreatedAt)
                .ToListAsync();

            var resultDtos = results.Select(sr => new SimulationResultDto
            {
                Id = sr.Id,
                ExperimentId = sr.ExperimentId,
                UserId = sr.UserId,
                Parameters = sr.Parameters,
                Results = sr.Results,
                Duration = sr.Duration,
                Efficiency = sr.Efficiency,
                CreatedAt = sr.CreatedAt
            }).ToList();

            return Ok(resultDtos);
        }

        // POST api/experiments - Tạo thí nghiệm mới (cập nhật để hỗ trợ CreateExperimentRequest)
        [HttpPost("create")]
        public async Task<ActionResult<ExperimentDto>> CreateExperimentFromRequest(CreateExperimentRequest request)
        {
            var experiment = new Experiment
            {
                Title = request.Title,
                Description = request.Description,
                Level = request.Level,
                Type = request.ExperimentType,
                CreatorId = request.UserId,
                IsPublic = request.IsPublic,
                Tags = JsonSerializer.Serialize(request.Tags),
                Reactions = JsonSerializer.Serialize(request.Reactions),
                Phenomena = JsonSerializer.Serialize(request.Phenomena),
                // Set default parameters if not provided in request
                TemperatureMin = 15,
                TemperatureMax = 100,
                TemperatureDefault = 25,
                ConcentrationMin = 0.01M,
                ConcentrationMax = 2.0M,
                ConcentrationDefault = 0.1M,
                VolumeMin = 1,
                VolumeMax = 1000,
                VolumeDefault = 100,
                TimeMin = 1,
                TimeMax = 3600,
                TimeDefault = 60
            };

            _context.Experiments.Add(experiment);
            await _context.SaveChangesAsync();

            var createdExperiment = await _context.Experiments
                .Include(e => e.Creator)
                .FirstAsync(e => e.Id == experiment.Id);

            return Ok(MapToDto(createdExperiment));
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : null;
        }

        private static ExperimentDto MapToDto(Experiment experiment)
        {
            var tags = new List<string>();
            var reactions = new List<string>();
            var phenomena = new List<string>();

            try
            {
                if (!string.IsNullOrEmpty(experiment.Tags))
                    tags = JsonSerializer.Deserialize<List<string>>(experiment.Tags) ?? new List<string>();
                
                if (!string.IsNullOrEmpty(experiment.Reactions))
                    reactions = JsonSerializer.Deserialize<List<string>>(experiment.Reactions) ?? new List<string>();
                
                if (!string.IsNullOrEmpty(experiment.Phenomena))
                    phenomena = JsonSerializer.Deserialize<List<string>>(experiment.Phenomena) ?? new List<string>();
            }
            catch (JsonException)
            {
                // Handle invalid JSON gracefully
            }

            return new ExperimentDto
            {
                Id = experiment.Id,
                Title = experiment.Title,
                Description = experiment.Description,
                Level = experiment.Level,
                Type = experiment.Type,
                CreatorId = experiment.CreatorId,
                CreatorName = experiment.Creator?.Username,
                IsDefault = experiment.IsDefault,
                IsPublic = experiment.IsPublic,
                Tags = tags,
                Parameters = new ParametersDto
                {
                    Temperature = new RangeDto
                    {
                        Min = experiment.TemperatureMin,
                        Max = experiment.TemperatureMax,
                        Default = experiment.TemperatureDefault,
                        Unit = "°C"
                    },
                    Concentration = new RangeDto
                    {
                        Min = experiment.ConcentrationMin,
                        Max = experiment.ConcentrationMax,
                        Default = experiment.ConcentrationDefault,
                        Unit = "M"
                    },
                    Volume = new RangeDto
                    {
                        Min = experiment.VolumeMin,
                        Max = experiment.VolumeMax,
                        Default = experiment.VolumeDefault,
                        Unit = "mL"
                    },
                    Time = new RangeDto
                    {
                        Min = experiment.TimeMin,
                        Max = experiment.TimeMax,
                        Default = experiment.TimeDefault,
                        Unit = "s"
                    }
                },
                Reactions = reactions,
                Phenomena = phenomena,
                ViewCount = experiment.ViewCount,
                LikeCount = experiment.LikeCount,
                CreatedAt = experiment.CreatedAt
            };
        }
    }
}
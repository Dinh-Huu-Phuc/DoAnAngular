namespace ChemistryAPI.DTOs
{
    public class ExperimentDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int? CreatorId { get; set; }
        public string? CreatorName { get; set; }
        public bool IsDefault { get; set; }
        public bool IsPublic { get; set; }
        public List<string> Tags { get; set; } = new();
        public ParametersDto Parameters { get; set; } = new();
        public List<string> Reactions { get; set; } = new();
        public List<string> Phenomena { get; set; } = new();
        public int ViewCount { get; set; }
        public int LikeCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ParametersDto
    {
        public RangeDto Temperature { get; set; } = new();
        public RangeDto Concentration { get; set; } = new();
        public RangeDto Volume { get; set; } = new();
        public RangeDto Time { get; set; } = new();
    }

    public class RangeDto
    {
        public decimal Min { get; set; }
        public decimal Max { get; set; }
        public decimal Default { get; set; }
        public string Unit { get; set; } = string.Empty;
    }

    public class CreateExperimentDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsPublic { get; set; } = false;
        public List<string> Tags { get; set; } = new();
        public ParametersDto Parameters { get; set; } = new();
        public List<string> Reactions { get; set; } = new();
        public List<string> Phenomena { get; set; } = new();
    }

    public class UpdateExperimentDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public List<string> Tags { get; set; } = new();
        public ParametersDto Parameters { get; set; } = new();
        public List<string> Reactions { get; set; } = new();
        public List<string> Phenomena { get; set; } = new();
    }

    public class ExperimentFilters
    {
        public string? Level { get; set; }
        public string? Type { get; set; }
        public bool? IsPublic { get; set; }
        public string? Search { get; set; }
    }
}
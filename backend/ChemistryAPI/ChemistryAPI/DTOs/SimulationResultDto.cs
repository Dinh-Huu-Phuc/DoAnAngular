namespace ChemistryAPI.DTOs
{
    public class SimulationResultDto
    {
        public int? Id { get; set; }
        public string ExperimentId { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Parameters { get; set; } = string.Empty;
        public string Results { get; set; } = string.Empty;
        public int Duration { get; set; }
        public decimal? Efficiency { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class SaveResultRequest
    {
        public int UserId { get; set; }
        public string ExperimentId { get; set; } = string.Empty;
        public object Parameters { get; set; } = new();
        public object Results { get; set; } = new();
        public int Duration { get; set; }
        public decimal? Efficiency { get; set; }
    }

    public class CreateExperimentRequest
    {
        public int UserId { get; set; }
        public string ExperimentId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string[] Tags { get; set; } = Array.Empty<string>();
        public string ExperimentType { get; set; } = string.Empty;
        public object Parameters { get; set; } = new();
        public string[] Reactions { get; set; } = Array.Empty<string>();
        public string[] Phenomena { get; set; } = Array.Empty<string>();
        public bool IsPublic { get; set; } = false;
    }
}
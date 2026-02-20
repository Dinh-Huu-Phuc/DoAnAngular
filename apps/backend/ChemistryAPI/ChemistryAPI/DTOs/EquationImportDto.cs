using System.Text.Json.Serialization;

namespace ChemistryAPI.DTOs;

public class EquationImportDto
{
    [JsonPropertyName("reactants")]
    public string Reactants { get; set; } = string.Empty;

    [JsonPropertyName("products")]
    public string Products { get; set; } = string.Empty;

    [JsonPropertyName("equation")]
    public string Equation { get; set; } = string.Empty;

    [JsonPropertyName("condition")]
    public string? Condition { get; set; }

    [JsonPropertyName("phenomenon")]
    public string? Phenomenon { get; set; }

    [JsonPropertyName("level")]
    public string Level { get; set; } = string.Empty;

    [JsonPropertyName("tags")]
    public List<string>? Tags { get; set; } // Hứng mảng [] từ JSON
}




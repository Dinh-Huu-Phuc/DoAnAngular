namespace ChemistryAPI.Models;

public class Reaction
{
    public int Id { get; set; }
    public string Equation { get; set; } = string.Empty;
    public string ReactionType { get; set; } = string.Empty;
    public string? Condition { get; set; }
    public string Description { get; set; } = string.Empty;
}






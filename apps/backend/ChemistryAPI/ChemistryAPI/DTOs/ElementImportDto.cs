using System.Text.Json.Serialization;

namespace ChemistryAPI.DTOs;

public class ElementImportDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("appearance")]
    public string Appearance { get; set; } = string.Empty;

    [JsonPropertyName("atomic_mass")]
    public double AtomicMass { get; set; }

    [JsonPropertyName("boil")]
    public double? Boil { get; set; }

    [JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty;

    [JsonPropertyName("density")]
    public double? Density { get; set; }

    [JsonPropertyName("discovered_by")]
    public string DiscoveredBy { get; set; } = string.Empty;

    [JsonPropertyName("melt")]
    public double? Melt { get; set; }

    [JsonPropertyName("molar_heat")]
    public double? MolarHeat { get; set; }

    [JsonPropertyName("named_by")]
    public string NamedBy { get; set; } = string.Empty;

    [JsonPropertyName("number")]
    public int Number { get; set; }

    [JsonPropertyName("period")]
    public int Period { get; set; }

    [JsonPropertyName("group")]
    public int Group { get; set; }

    [JsonPropertyName("phase")]
    public string Phase { get; set; } = string.Empty;

    [JsonPropertyName("source")]
    public string Source { get; set; } = string.Empty;

    [JsonPropertyName("bohr_model_image")]
    public string BohrModelImage { get; set; } = string.Empty;

    [JsonPropertyName("bohr_model_3d")]
    public string BohrModel3d { get; set; } = string.Empty;

    [JsonPropertyName("spectral_img")]
    public string SpectralImg { get; set; } = string.Empty;

    [JsonPropertyName("summary")]
    public string Summary { get; set; } = string.Empty;

    [JsonPropertyName("symbol")]
    public string Symbol { get; set; } = string.Empty;

    [JsonPropertyName("xpos")]
    public int Xpos { get; set; }

    [JsonPropertyName("ypos")]
    public int Ypos { get; set; }

    [JsonPropertyName("wxpos")]
    public int Wxpos { get; set; }

    [JsonPropertyName("wypos")]
    public int Wypos { get; set; }

    [JsonPropertyName("shells")]
    public List<int>? Shells { get; set; }

    [JsonPropertyName("electron_configuration")]
    public string ElectronConfiguration { get; set; } = string.Empty;

    [JsonPropertyName("electron_configuration_semantic")]
    public string ElectronConfigurationSemantic { get; set; } = string.Empty;

    [JsonPropertyName("electron_affinity")]
    public double? ElectronAffinity { get; set; }

    [JsonPropertyName("electronegativity_pauling")]
    public double? ElectronegativityPauling { get; set; }

    [JsonPropertyName("ionization_energies")]
    public List<double>? IonizationEnergies { get; set; }

    [JsonPropertyName("cpk-hex")]
    public string CpkHex { get; set; } = string.Empty;

    [JsonPropertyName("image")]
    public ImageDto? Image { get; set; }

    [JsonPropertyName("block")]
    public string Block { get; set; } = string.Empty;
}

public class PeriodicTableRoot
{
    [JsonPropertyName("elements")]
    public List<ElementImportDto>? Elements { get; set; }
}

public class ImageDto
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("attribution")]
    public string Attribution { get; set; } = string.Empty;
}



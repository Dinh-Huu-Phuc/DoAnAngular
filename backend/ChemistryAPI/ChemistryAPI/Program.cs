using ChemistryAPI.Data;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;

// Load environment variables from .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Environment Configuration Service
builder.Services.AddSingleton<ChemistryAPI.Services.IEnvironmentConfigService, ChemistryAPI.Services.EnvironmentConfigService>();

// Entity Framework Core - SQL Server
// Sử dụng factory pattern để tránh BuildServiceProvider warning
builder.Services.AddDbContext<ChemistryDbContext>((serviceProvider, options) =>
{
    var envConfigService = serviceProvider.GetRequiredService<ChemistryAPI.Services.IEnvironmentConfigService>();
    var connectionString = envConfigService.GetConnectionString();
    options.UseSqlServer(connectionString);
});

// HttpClient cho Gemini API
builder.Services.AddHttpClient<ChemistryAPI.Services.GeminiService>();

// Gemini Service (sử dụng IEnvironmentConfigService)
builder.Services.AddScoped<ChemistryAPI.Services.GeminiService>();

// Experiment Seed Service
builder.Services.AddScoped<ChemistryAPI.Services.ExperimentSeedService>();

// CORS cho Angular (http://localhost:4200 / https://localhost:4200)
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy
                .WithOrigins("http://localhost:4200", "https://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
    { 
        Title = "Chemistry API", 
        Version = "v1" 
    });
    
    // Configure Swagger to handle file uploads
    c.OperationFilter<ChemistryAPI.Services.FileUploadOperationFilter>();
});

var app = builder.Build();

// Validate environment variables sau khi build
using (var scope = app.Services.CreateScope())
{
    var envConfigService = scope.ServiceProvider.GetRequiredService<ChemistryAPI.Services.IEnvironmentConfigService>();
    if (!envConfigService.ValidateRequiredEnvironments())
    {
        throw new InvalidOperationException("Required environment variables are missing. Please check the logs for details.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthorization();

app.MapControllers();

// Seed default experiments
using (var scope = app.Services.CreateScope())
{
    var seedService = scope.ServiceProvider.GetRequiredService<ChemistryAPI.Services.ExperimentSeedService>();
    await seedService.SeedDefaultExperimentsAsync();
}

app.Run();

using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ChemistryAPI.Services
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var fileParams = context.MethodInfo.GetParameters()
                .Where(p => p.ParameterType == typeof(IFormFile) || 
                           p.ParameterType.Name.Contains("IFormFile") ||
                           p.ParameterType == typeof(IFormFile[]) ||
                           p.ParameterType.GetProperties().Any(prop => prop.PropertyType == typeof(IFormFile) || prop.PropertyType.Name.Contains("IFormFile")))
                .ToArray();

            if (fileParams.Any())
            {
                var properties = new Dictionary<string, OpenApiSchema>();
                
                // Handle different API endpoints
                var actionName = context.MethodInfo.Name;
                var controllerName = context.MethodInfo.DeclaringType?.Name;

                if (controllerName?.Contains("Elements") == true || controllerName?.Contains("Equations") == true)
                {
                    // For JSON upload APIs
                    properties["file"] = new OpenApiSchema { Type = "string", Format = "binary" };
                }
                else if (controllerName?.Contains("Image") == true)
                {
                    // For image upload APIs
                    properties["Image"] = new OpenApiSchema { Type = "string", Format = "binary" };
                    properties["UserId"] = new OpenApiSchema { Type = "integer", Nullable = true };
                    properties["ChatHistoryId"] = new OpenApiSchema { Type = "integer", Nullable = true };
                }
                else
                {
                    // Generic file upload
                    properties["file"] = new OpenApiSchema { Type = "string", Format = "binary" };
                }

                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["multipart/form-data"] = new OpenApiMediaType
                        {
                            Schema = new OpenApiSchema
                            {
                                Type = "object",
                                Properties = properties
                            }
                        }
                    }
                };
            }
        }
    }
}
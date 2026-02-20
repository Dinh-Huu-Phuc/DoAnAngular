using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace ChemistryAPI.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AdminOnlyAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Check if user role is in request headers
        if (!context.HttpContext.Request.Headers.TryGetValue("X-User-Role", out var role) || role != "Admin")
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Admin access required" });
        }
    }
}

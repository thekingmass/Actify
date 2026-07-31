using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System.Security.Claims;


namespace Infrastructure.Security
{
    public class IsHostRequirement : IAuthorizationRequirement
    {
    }

    public class IsHostRequirementHandler(IHttpContextAccessor httpContextAccessor, AppDbContext dbContext) 
        : AuthorizationHandler<IsHostRequirement>
    {
        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, IsHostRequirement requirement)
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null) return;

            var httpContext = httpContextAccessor.HttpContext;

            if (httpContext?.GetRouteValue("id") is not string routeId
                || !Guid.TryParse(routeId, out var activityId)) return;

            var attendee = await dbContext.ActivityAttendee
                .SingleOrDefaultAsync(x => x.UserId == userId && x.ActivityId == activityId);

            if (attendee == null) return;

            if (attendee.IsHost) context.Succeed(requirement);
        }
    }
}

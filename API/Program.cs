using API.Middleware;
using API.SignalR;
using Application.Activities.Queries;
using Application.Activities.Validators;
using Application.Core;
using Application.Interfaces;
using Domain;
using FluentValidation;
using Infrastructure.Photos;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers(opt =>
{
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    opt.Filters.Add(new AuthorizeFilter(policy));
}).AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

builder.Services.AddMediatR(x => { 
    x.RegisterServicesFromAssemblyContaining<Application.Activities.Queries.GetActivityList>();
    x.AddOpenBehavior(typeof(ValidationBehavior<,>));
});

builder.Services.AddScoped<IUserAccessor, UserAccessor>();

builder.Services.AddScoped<IPhotoService, PhotoService>();

//Adding DB configuration service for the API
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
}
);

builder.Services.AddCors();

builder.Services.AddSignalR();

builder.Services.AddAutoMapper(cfg => { }, typeof(MappingProfiles).Assembly);

builder.Services.AddValidatorsFromAssemblyContaining<CreateActivityValidator>();

builder.Services.AddTransient<ExceptionMiddleware>();

// Add Identity services and configure options for the login and registration endpoints. The AddIdentityApiEndpoints method is a custom extension method that sets up the necessary services for Identity and configures the endpoints for user registration and login. It also adds support for roles and configures the Entity Framework store for Identity to use the AppDbContext.
builder.Services.AddIdentityApiEndpoints<User>(opt =>
{
    opt.User.RequireUniqueEmail = true;
})
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

// Add cookie configuration for cross-site requests. This is necessary when the frontend and backend are hosted on different domains or ports, as it allows the authentication cookie to be sent with requests from the frontend to the backend.
builder.Services.ConfigureApplicationCookie(opt =>
{
    opt.Cookie.SameSite = SameSiteMode.None;              // required for cross-site cookie
    opt.Cookie.SecurePolicy = CookieSecurePolicy.Always;  // required when SameSite=None
    opt.Cookie.HttpOnly = true;
});

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("IsActivityHost", policy =>
    {
        policy.Requirements.Add(new IsHostRequirement());
    });

builder.Services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();


// Add Cloudinary settings configuration
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));


// Build the app

var app = builder.Build();

// Configure middleware pipeline

app.UseMiddleware<ExceptionMiddleware>();

app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
.AllowCredentials()
.WithOrigins("http://localhost:3000", "https://localhost:3000", "http://localhost:4174"));

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map Identity API endpoints for user registration and login
// This Automatically creates endpoints for user registration and login, as well as other Identity-related functionality, such as password reset and email confirmation. The endpoints are mapped to the "api" route prefix, so they can be accessed at URLs like "/api/account/register" and "/api/account/login".
app.MapGroup("api").MapIdentityApi<User>();

app.MapHub<CommentHub>("/comments");

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<AppDbContext>();
    var userManager = services.GetRequiredService<UserManager<User>>();
    
    await context.Database.MigrateAsync();
    await DbInitializer.SeedData(context, userManager);
} catch(Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An Error Occurred During Migration.");
}

app.Run();

using Application.Core;
using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddMediatR(x => x.RegisterServicesFromAssemblyContaining<Application.Activities.Queries.GetActivityList>());

//Adding DB configuration for the API
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
}
);

builder.Services.AddCors();

builder.Services.AddAutoMapper(cfg => { }, typeof(MappingProfiles).Assembly);


var app = builder.Build();

// Configure middleware pipeline

app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
.WithOrigins("http://localhost:3000", "https://localhost:3000", "http://localhost:4174"));

app.MapControllers();


using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
    await DbInitializer.SeedData(context);
} catch(Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An Error Occurred During Migration.");
}


app.Run();

using IncomeExpenseApp.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configure for Railway deployment
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Add services to the container.
builder.Services.AddControllers();

// Add SPA services
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "ClientApp/build";
});

// Add Entity Framework with multiple database support
if (builder.Environment.EnvironmentName == "Testing")
{
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseInMemoryDatabase("TestDatabase");
    });
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
        
        if (!string.IsNullOrEmpty(connectionString))
        {
            // PostgreSQL connection (Railway provides this)
            if (connectionString.StartsWith("postgres://"))
            {
                // Convert Railway's postgres:// URL to standard format
                connectionString = connectionString.Replace("postgres://", "postgresql://");
                options.UseNpgsql(connectionString);
            }
            else
            {
                // SQLite connection
                options.UseSqlite(connectionString);
            }
        }
        else
        {
            // Local development - use SQLite with persistent volume path
            var isRailway = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("RAILWAY_ENVIRONMENT"));
            connectionString = isRailway 
                ? "Data Source=/data/incomeexpense.db" 
                : "Data Source=incomeexpense.db";
            options.UseSqlite(connectionString);
        }
    });
}

// Add API Explorer and Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "Income Expense API", 
        Version = "v1",
        Description = "A simple API for managing income and expense transactions"
    });
});

// Add CORS for frontend integration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Income Expense API V1");
        c.RoutePrefix = "swagger"; // Move Swagger UI to /swagger
    });
}

// Ensure database is created and migrated
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        // Use migrations for PostgreSQL, EnsureCreated for SQLite
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("postgres"))
        {
            context.Database.Migrate(); // Use migrations for PostgreSQL
        }
        else
        {
            context.Database.EnsureCreated(); // Use EnsureCreated for SQLite
        }
    }
    catch (Exception ex)
    {
        // Log the error but don't fail startup
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Failed to initialize database");
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Serve static files from wwwroot (for API docs, etc.)
app.UseStaticFiles();
// Serve SPA static files
app.UseSpaStaticFiles();

app.UseAuthorization();
app.MapControllers();

// Add a simple health check endpoint
app.MapGet("/health", () => new { 
    Status = "Healthy", 
    Timestamp = DateTime.UtcNow,
    Environment = app.Environment.EnvironmentName
});

// Configure SPA
app.UseSpa(spa =>
{
    spa.Options.SourcePath = "ClientApp";

    if (app.Environment.IsDevelopment())
    {
        spa.UseProxyToSpaDevelopmentServer("http://localhost:3000");
    }
});

app.Run();

// Make Program class accessible for integration tests
public partial class Program { }
using Microsoft.EntityFrameworkCore;
using GEOGAS.Api.Data; // Asegúrate de incluir el namespace donde está MyDbContext
using Pomelo.EntityFrameworkCore.MySql.Infrastructure; 

var builder = WebApplication.CreateBuilder(args);

// --- INICIO: CONFIGURACIÓN DE LA BASE DE DATOS Y CONTEXTO ---

// 1. Obtener la cadena de conexión (DefaultConnection)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. Registrar MyDbContext e indicar que use MySQL
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString), // Detección automática de la versión de MySQL
        mySqlOptions => mySqlOptions.EnableRetryOnFailure() 
    )
);

// --- FIN: CONFIGURACIÓN DE LA BASE DE DATOS Y CONTEXTO ---


// Add services to the container.
// CORRECCIÓN: Agregar soporte para los Controladores (como GasolinerasController)
builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORRECCIÓN: Comentamos la redirección HTTPS para evitar el error 'Failed to determine the https port' en desarrollo.
// app.UseHttpsRedirection(); 

app.UseAuthorization();

// CORRECCIÓN: Mapeamos los controladores para que los endpoints de GasolinerasController funcionen
app.MapControllers(); 

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
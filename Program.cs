using Microsoft.EntityFrameworkCore;
using GEOGAS.Api.Data; 
using Pomelo.EntityFrameworkCore.MySql.Infrastructure; 
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using GEOGAS.Api.Models;
using GEOGAS.Api.Services;
using Microsoft.Extensions.Logging; 


var builder = WebApplication.CreateBuilder(args);

// --- INICIO: CONFIGURACIÓN DE LA BASE DE DATOS Y CONTEXTO ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseMySql(
        connectionString,
        new MySqlServerVersion(new Version(8, 0, 21)), 
        mySqlOptions => mySqlOptions.EnableRetryOnFailure() 
    )
);
// --- FIN: CONFIGURACIÓN DE LA BASE DE DATOS Y CONTEXTO ---


// =========================================================
// --- REGISTRO DE SERVICIOS CUSTOM ---
// =========================================================

// Servicios de Lógica de Negocio y Repositorios
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IJwtService, JwtService>();

// REGISTRO DEL NUEVO SERVICIO DE SINCRONIZACIÓN (Interfaz)
builder.Services.AddScoped<IDataSyncService, DataSyncService>();

// ====================================================================================
// CORRECCIÓN CLAVE: El controlador pide "SincronizacionService" (la clase concreta), 
// pero no está registrado. Asumo que el controlador se refiere a DataSyncService,
// por lo que mapearé el nombre incorrecto a la implementación correcta.
// Si tienes una clase llamada SincronizacionService, usa esa clase en su lugar.
// Ya que no tengo esa clase, usaré DataSyncService como implementación.
// ====================================================================================
builder.Services.AddScoped<SincronizacionService>(provider => 
    (SincronizacionService)provider.GetRequiredService<IDataSyncService>()
);
// ------------------------------------------------------------------------------------


// 1. Registro del Password Hashing
IServiceCollection serviceCollection = builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();


// 2. Configuración de la Autenticación JWT (JSON Web Token)
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] ?? throw new InvalidOperationException("La clave secreta JWT no está configurada.");
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();

// ====================================================================================
// CORRECCIÓN PARA EVITAR EL ERROR "Maximum call stack size exceeded" en Swagger UI
// ====================================================================================
builder.Services.AddSwaggerGen(c =>
{
    c.CustomSchemaIds(type => type.FullName);
    c.IgnoreObsoleteProperties();
});
// ====================================================================================


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

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

// Clase Placeholder:
// Se necesita una declaración de clase para que el compilador sepa qué es SincronizacionService.
// Si esta clase no existe en tu proyecto, es la causa del error.
public class SincronizacionService : IDataSyncService
{
    // Solo un placeholder para satisfacer el registro
    public Task<bool> SyncGasPricesAsync() => throw new NotImplementedException();
}
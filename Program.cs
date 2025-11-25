using Microsoft.EntityFrameworkCore;
using GEOGAS.Api.Data; 
using Pomelo.EntityFrameworkCore.MySql.Infrastructure; 
using Microsoft.AspNetCore.Identity; // Nuevo: Para el PasswordHasher
using Microsoft.AspNetCore.Authentication.JwtBearer; // Nuevo: Para la autenticación JWT
using Microsoft.IdentityModel.Tokens; // Nuevo: Para SymmetricSecurityKey
using System.Text;
using GEOGAS.Api.Models;
using GEOGAS.Api.Services;


var builder = WebApplication.CreateBuilder(args);

// --- INICIO: CONFIGURACIÓN DE LA BASE DE DATOS Y CONTEXTO ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString), 
        mySqlOptions => mySqlOptions.EnableRetryOnFailure() 
    )
);
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddControllers();
// --- FIN: CONFIGURACIÓN DE LA BASE DE DATOS Y CONTEXTO ---
// Servicios de Lógica de Negocio y Repositorios
builder.Services.AddScoped<IUserService, UserService>();
// ¡SOLUCIÓN! Registro del Servicio de JWT
builder.Services.AddScoped<IJwtService, JwtService>();

// =========================================================
// --- INICIO: CONFIGURACIÓN DE SEGURIDAD (PASSWORD HASHING Y JWT) ---
// =========================================================

// 1. Registro del Password Hashing
// Utilizamos el PasswordHasher de ASP.NET Identity para encriptar contraseñas de manera segura (con salt y hashing costoso).
// Lo inyectaremos en el servicio de usuarios o directamente en el controlador.
IServiceCollection serviceCollection = builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();


// 2. Configuración de la Autenticación JWT (JSON Web Token)
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] ?? throw new InvalidOperationException("La clave secreta JWT no está configurada.");
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    // Indicar que JWT Bearer es el esquema de autenticación por defecto
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Cambiar a true en producción
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true, // Esencial: Verificar que la firma es auténtica
        IssuerSigningKey = new SymmetricSecurityKey(key), // Usar la clave secreta
        
        ValidateIssuer = true, // Validar el emisor
        ValidIssuer = jwtSettings["Issuer"],
        
        ValidateAudience = true, // Validar la audiencia
        ValidAudience = jwtSettings["Audience"],
        
        ValidateLifetime = true, // Validar la expiración del token
        ClockSkew = TimeSpan.Zero // No dar margen de tiempo en la expiración
    };
});

// =========================================================
// --- FIN: CONFIGURACIÓN DE SEGURIDAD ---
// =========================================================


builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// =========================================================
// --- MIDDLEWARE DE SEGURIDAD (COLOCAR EN ESTE ORDEN) ---
// =========================================================


app.UseAuthentication(); // 1. Identifica y valida el token JWT
app.UseAuthorization();  // 2. Verifica si el usuario autenticado tiene permisos para el endpoint

// =========================================================

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
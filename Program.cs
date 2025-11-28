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
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// --- CONFIGURACIÓN DE LA BASE DE DATOS ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseMySql(
        connectionString,
        new MySqlServerVersion(new Version(8, 0, 21)), 
        mySqlOptions => mySqlOptions.EnableRetryOnFailure() 
    )
);

// --- REGISTRO DE SERVICIOS ---
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IJwtService, JwtService>();

// CORRECCIÓN: Registrar SincronizacionService con HttpClient
builder.Services.AddScoped<SincronizacionService>();
builder.Services.AddHttpClient<SincronizacionService>();

// O si prefieres usar la interfaz, cambia a:
// builder.Services.AddScoped<IDataSyncService, SincronizacionService>();
// builder.Services.AddHttpClient<IDataSyncService, SincronizacionService>();

// Password Hashing
builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();

// --- CONFIGURACIÓN CORS MEJORADA ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000", 
            "https://localhost:3000",
            "http://localhost:5173", // Vite
            "http://localhost:5287"  // Vite HTTPS
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// --- CONFIGURACIÓN JWT ---
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
builder.Services.AddSwaggerGen(c =>
{
    c.CustomSchemaIds(type => type.FullName);
    c.IgnoreObsoleteProperties();
});

var app = builder.Build();

// --- CONFIGURACIÓN DEL PIPELINE ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ⚠️ ORDEN CRÍTICO: CORS debe ir ANTES de Authentication y Authorization
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Endpoint de salud
app.MapGet("/api/health", () => new { 
    status = "OK", 
    message = "API GeoGas funcionando", 
    timestamp = DateTime.UtcNow 
});

app.Run();
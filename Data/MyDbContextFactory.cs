using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using System;
using System.IO;
using GEOGAS.Api.Data;

// Asegúrate de que el namespace coincide con la ubicación de tu DbContext
namespace GEOGAS.Api.Data 
{
    // La herramienta 'dotnet ef' buscará y usará cualquier clase que implemente esta interfaz.
    public class MyDbContextFactory : IDesignTimeDbContextFactory<MyDbContext>
    {
        public MyDbContext CreateDbContext(string[] args)
        {
            // --- 1. CONFIGURACIÓN: Carga appsettings.json para obtener la cadena de conexión ---
            var configuration = new ConfigurationBuilder()
                // Asegura que busca el archivo en el directorio actual (que debe ser el del proyecto de inicio)
                .SetBasePath(Directory.GetCurrentDirectory()) 
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            // --- 2. OBTENER CADENA DE CONEXIÓN ---
            // IMPORTANTE: Usa la clave exacta que definiste en tu appsettings.json
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            // --- 3. CONFIGURAR LAS OPCIONES DEL DB CONTEXT ---
            var optionsBuilder = new DbContextOptionsBuilder<MyDbContext>();
            
            // Define la versión de tu servidor MySQL.
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 30)); 

            // Usa el proveedor Pomelo (UseMySql) y aplica la versión del servidor.
            optionsBuilder.UseMySql(
                connectionString,
                serverVersion,
                // Opciones específicas de MySQL para la migración (opcional)
                mysqlOptions => mysqlOptions.EnableRetryOnFailure()
            );

            // --- 4. RETORNAR EL CONTEXTO INSTANCIADO ---
            return new MyDbContext(optionsBuilder.Options);
        }
    }
}
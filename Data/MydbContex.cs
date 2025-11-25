using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore.Design;
using GEOGAS.Api.Models; // Asegúrate de que User esté aquí si no está en GEOGAS.Models
using Microsoft.EntityFrameworkCore;
using GEOGAS.Models;
using System.Linq; // Necesario si se usa Linq

namespace GEOGAS.Api.Data  
{
    public class MyDbContext : DbContext
    {
        
        public MyDbContext(DbContextOptions<MyDbContext> options)
            : base(options)
        {
            
        }
        
        
        public DbSet<User> Users { get; set; }
        public DbSet<Rutas> GenRutas { get; set; }
        public DbSet<Coche> Coches { get; set; }
        public DbSet<Gasolineras> Gasolinera { get; set; }
        public DbSet<Presio_Gas> presio_Gas { get; set; }
        
        // 🔑 Método clave para configurar el modelo de la base de datos
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // ------------------------------------------------------------------
            // CONFIGURACIÓN DE AUTOINCREMENTO PARA LA ENTIDAD USER (INT ID)
            // Esto le dice a EF Core que el valor del Id es generado por la DB.
            // ------------------------------------------------------------------
            modelBuilder.Entity<User>()
                .Property(u => u.Id)
                .ValueGeneratedOnAdd();
        }
    }
}
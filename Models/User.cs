namespace GEOGAS.Api.Models
{
    public class User
    {
        // EF Core por convención detectará 'Id' como la clave primaria.
        public int Id { get; set; } 
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public string PassWordl { get; set; } = string.Empty;
        
        // Propiedad de navegación si hubiera una relación con Rutas
        // public ICollection<Rutas> RutasAsignadas { get; set; }
    }
}
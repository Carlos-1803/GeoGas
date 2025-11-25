

using System.ComponentModel.DataAnnotations;

namespace GEOGAS.Api.Dtos
{
    // =========================================================
    // DATA TRANSFER OBJECTS (DTOs)
    // =========================================================

    // DTO para la solicitud de registro (POST /register)
    public class RegisterRequest
    {
        [Required]
        public required string Nombre { get; set; }
        [Required]
        [EmailAddress]
        public required string Correo { get; set; }
        [Required]
        public required string Contraseña { get; set; }
    }

    // DTO para la solicitud de Login (POST /auth/login)
    public class LoginRequest
    {
          [Required]
        [EmailAddress]
        public required string Correo { get; set; } // Propiedad que faltaba o estaba mal nombrada
        [Required]
        public required string Contraseña { get; set; }
    }

    // DTO para la solicitud de actualización (PUT /{id})
    public class UpdateRequest
    {
        [Required]
        public required string Nombre { get; set; }
        [Required]
        [EmailAddress]
        public required string Correo { get; set; }
        public string? NuevaContraseña { get; set; } // Opcional
    }

    // DTO para la respuesta de lectura (GET)
    public class UserResponse
    {
        public int Id { get; set; }
        public required string Nombre { get; set; }
        public required string Correo { get; set; }
    }
}
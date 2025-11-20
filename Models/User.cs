using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
     // Usaremos esto para futuras validaciones

namespace GEOGAS.Api.Models
{
    // =========================================================
    // ENTIDAD DE LA BASE DE DATOS
    // =========================================================
    public class User
    {
        public Guid Id { get; set; } 
        
        // La propiedad 'required' se usa para asegurar que siempre tenga valor
        [Required]
        public required string Nombre { get; set; }
        
        [Required]
        public required string Correo { get; set; }
        
        // Almacena el hash seguro, se inicializa en el controlador.
        [Required]
        public string? PasswordHash { get; set; } 
    }

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
    
    // DTO para la respuesta de lectura (GET), excluye PasswordHash por seguridad.
    // ESTA ES LA CLASE QUE NO ENCUENTRA EL COMPILADOR.
    public class UserResponse
    {
        public Guid Id { get; set; }
        public required string Nombre { get; set; }
        public required string Correo { get; set; }
    }
}
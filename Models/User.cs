using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Collections.Generic; // Mantenido, aunque no se usa directamente en este modelo

namespace GEOGAS.Api.Models
{
   
    public class User
    {
        //  1. Clave Primaria (PK): Se mantiene 'int'. 
        // EF Core la configura automáticamente como Primary Key Autoincremental.
        public int Id { get; set; } 
        
        //  2. Nombre: Requerido y no anulable.
        [Required]
        public required string Nombre { get; set; }
        
        //  3. Correo: Requerido y no anulable.
        [Required]
        public required string Correo { get; set; }
        
        //  4. PasswordHash: DEBE ser requerido (no anulable) en el modelo y en la DB.
        
        [Required]
        [JsonIgnore] 
        public required string PasswordHash { get; set; }
        
        
    }
}
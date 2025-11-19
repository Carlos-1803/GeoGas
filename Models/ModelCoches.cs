using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GEOGAS.Api.Models
{
    public class ModelCoches
    {
        public int Id { get; set; }
        
        public int Marca {get; set; }
        public int Modelo {get; set; }
        public int Rendimiento {get; set; }

        // Propiedad para la relación (Clave Foránea)
        public int UserId { get; set; }
         
    }
}
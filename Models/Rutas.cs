
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GEOGAS.Api.Models
{
    public class Ruta
    {
        public int Id { get; set; }

        public int Ubicacion { get; set; }
        
        public int Destino { get; set; }

        public int Distancia { get; set; }

        // Propiedad para la relación (Clave Foránea)
        public int UserId { get; set; }
         
    }
}
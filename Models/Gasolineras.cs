using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using GEOGAS.Api.Models;

namespace GEOGAS.Models
{
    public class Gasolineras
    {
        [Key]
        public int place_id { get; set; }
        
        
        public required string Nombre {get; set; }
        public required string cre_id {get; set; }
        public double x {get; set; }

        public double y {get; set; }

        // Propiedad para la relación (Clave Foránea)
       // public int UserId { get; set; } 
         [JsonIgnore]
    public List<Presio_Gas> Precios { get; set; } = new List<Presio_Gas>();
    }
}
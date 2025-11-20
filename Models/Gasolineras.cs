using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GEOGAS.Api.Models
{
    public class Gasolineras
    {
        public int place_id { get; set; }
        
        public int Nombre {get; set; }
        public int cre_id {get; set; }
        public int x {get; set; }

        public int y {get; set; }

        // Propiedad para la relación (Clave Foránea)
       // public int UserId { get; set; } 
         
    }
}
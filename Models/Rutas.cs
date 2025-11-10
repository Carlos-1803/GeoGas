
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GEOGAS.Api.Models
{
    public class Rutas
    {
        public int Id { get; set; }
        

        // Propiedad para la relación (Clave Foránea)
        public int UserId { get; set; }
         
    }
}
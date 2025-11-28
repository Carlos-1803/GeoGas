using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using GEOGAS.Models;

namespace GEOGAS.Api.Models
{
    public class Presio_Gas
    {
        [Key]
        public int Id { get; set; }
        public required string tipo {get; set; }
        public int presio {get; set; }
        

        // Propiedad para la relación (Clave Foránea)
       //  public int UserId { get; set; } 
         public int Gasolinerasplace_id { get; set; }

         [JsonIgnore] 
    public Gasolineras? Gasolinera { get; set; }
    }
}
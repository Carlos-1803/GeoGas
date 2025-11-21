using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace GeoGasNueva.Models
{
    public class Coche
    {
        [Key]
        public int Id { get; set; }
          
        [StringLength(50)]
        public string Marca { get; set; }
        
        [StringLength(50)]
        public string Modelo { get; set; }
        
        public DateTime FechaCreacion { get; set; } = DateTime.Now;
        
    
        
    }
}
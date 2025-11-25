using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace GEOGAS.Models
{
    public class Coche
    {
        [Key]
        public int Id { get; set; }
          
        [StringLength(50)]
        public required string Marca { get; set; }
        
        [StringLength(50)]
        public required string Modelo { get; set; }

    }
}
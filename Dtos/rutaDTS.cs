using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using System.ComponentModel.DataAnnotations;

namespace GEOGAS.Api.Dtos
{
    // DTO para crear una ruta
    public class RutaCreateRequest
    {
        [Required(ErrorMessage = "La ubicación es requerida")]
        [Range(1, int.MaxValue, ErrorMessage = "La ubicación debe ser un valor positivo")]
        public int Ubicacion { get; set; }

        [Required(ErrorMessage = "El destino es requerido")]
        [Range(1, int.MaxValue, ErrorMessage = "El destino debe ser un valor positivo")]
        public int Destino { get; set; }

        [Required(ErrorMessage = "La distancia es requerida")]
        [Range(1, int.MaxValue, ErrorMessage = "La distancia debe ser un valor positivo")]
        public int Distancia { get; set; }

        [Required(ErrorMessage = "El UserId es requerido")]
        [Range(1, int.MaxValue, ErrorMessage = "El UserId debe ser un valor positivo")]
        public int UserId { get; set; }
    }

    // DTO para actualizar una ruta
    public class RutaUpdateRequest
    {
        [Required(ErrorMessage = "La ubicación es requerida")]
        [Range(1, int.MaxValue, ErrorMessage = "La ubicación debe ser un valor positivo")]
        public int Ubicacion { get; set; }

        [Required(ErrorMessage = "El destino es requerido")]
        [Range(1, int.MaxValue, ErrorMessage = "El destino debe ser un valor positivo")]
        public int Destino { get; set; }

        [Required(ErrorMessage = "La distancia es requerida")]
        [Range(1, int.MaxValue, ErrorMessage = "La distancia debe ser un valor positivo")]
        public int Distancia { get; set; }

        [Required(ErrorMessage = "El UserId es requerido")]
        [Range(1, int.MaxValue, ErrorMessage = "El UserId debe ser un valor positivo")]
        public int UserId { get; set; }
    }

    // DTO para respuesta de ruta
    public class RutaResponse
    {
        public int Id { get; set; }
        public int Ubicacion { get; set; }
        public int Destino { get; set; }
        public int Distancia { get; set; }
        public int UserId { get; set; }
    }
}
// DTO para crear una ruta

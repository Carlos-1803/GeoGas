using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GEOGAS.Models;
using GEOGAS.Api.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace GEOGAS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CocheController : ControllerBase
    {
        private readonly MyDbContext _context;

        public CocheController(MyDbContext context)
        {
            _context = context;
        }

        // GET: api/Coche
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Coche>>> GetAll()
        {
            var coches = await _context.Coches
                .OrderBy(c => c.Marca)
                .ThenBy(c => c.Modelo)
                .ToListAsync();
            return Ok(coches);
        }

        // GET: api/Coche/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Coche>> GetById(int id)
        {
            var coche = await _context.Coches.FindAsync(id);
            if (coche == null)
                return NotFound(new { message = $"Coche con ID {id} no encontrado" });

            return Ok(coche);
        }

        // GET: api/Coche/marca/Toyota
        [HttpGet("marca/{marca}")]
        public async Task<ActionResult<IEnumerable<Coche>>> GetByMarca(string marca)
        {
            var coches = await _context.Coches
                .Where(c => c.Marca.ToLower().Contains(marca.ToLower()))
                .OrderBy(c => c.Modelo)
                .ToListAsync();

            if (!coches.Any())
                return NotFound(new { message = $"No se encontraron coches de la marca {marca}" });

            return Ok(coches);
        }

        // GET: api/Coche/marcas
        [HttpGet("marcas")]
        public async Task<ActionResult<IEnumerable<string>>> GetMarcas()
        {
            var marcas = await _context.Coches
                .Select(c => c.Marca)
                .Distinct()
                .OrderBy(m => m)
                .ToListAsync();
            return Ok(marcas);
        }

        // GET: api/Coche/buscar?termino=civic
        [HttpGet("buscar")]
        public async Task<ActionResult<IEnumerable<Coche>>> Search([FromQuery] string termino)
        {
            if (string.IsNullOrWhiteSpace(termino))
            {
                var todos = await _context.Coches
                    .OrderBy(c => c.Marca)
                    .ThenBy(c => c.Modelo)
                    .ToListAsync();
                return Ok(todos);
            }

            var resultados = await _context.Coches
                .Where(c => 
                    c.Marca.ToLower().Contains(termino.ToLower()) || 
                    c.Modelo.ToLower().Contains(termino.ToLower()))
                .OrderBy(c => c.Marca)
                .ThenBy(c => c.Modelo)
                .ToListAsync();

            if (!resultados.Any())
                return NotFound(new { message = $"No se encontraron coches que coincidan con '{termino}'" });

            return Ok(resultados);
        }

        // POST: api/Coche
        [HttpPost]
        public async Task<ActionResult<Coche>> Create(Coche coche)
        {
            // Validaciones adicionales
            if (string.IsNullOrWhiteSpace(coche.Marca))
                return BadRequest(new { message = "La marca es requerida" });

            if (string.IsNullOrWhiteSpace(coche.Modelo))
                return BadRequest(new { message = "El modelo es requerido" });

            _context.Coches.Add(coche);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = coche.Id }, coche);
        }

        // PUT: api/Coche/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Coche coche)
        {
            if (id != coche.Id)
                return BadRequest(new { message = "ID no coincide" });

            // Validar que el coche exista
            var existe = await _context.Coches.AnyAsync(c => c.Id == id);
            if (!existe)
                return NotFound(new { message = $"Coche con ID {id} no encontrado" });

            // Validaciones adicionales
            if (string.IsNullOrWhiteSpace(coche.Marca))
                return BadRequest(new { message = "La marca es requerida" });

            if (string.IsNullOrWhiteSpace(coche.Modelo))
                return BadRequest(new { message = "El modelo es requerido" });

            _context.Entry(coche).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CocheExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/Coche/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var coche = await _context.Coches.FindAsync(id);
            if (coche == null)
                return NotFound(new { message = $"Coche con ID {id} no encontrado" });

            _context.Coches.Remove(coche);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CocheExists(int id)
        {
            return _context.Coches.Any(e => e.Id == id);
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GEOGAS.Api.Data;  
using GEOGAS.Models; 

namespace GEOGAS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GasolinerasController : ControllerBase
    {
        private readonly MyDbContext _context;

        public GasolinerasController(MyDbContext context)
        {
            _context = context;
        }

        // 1. VER TODAS (GET: api/gasolineras)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Gasolineras>>> GetGasolineras()
        {
            // CORREGIDO: Usamos Gasolineras (Plural)
            return await _context.Gasolinera.ToListAsync(); 
        }

        // 2. VER UNA (GET: api/gasolineras/5)
        [HttpGet("{id}")]
        public async Task<ActionResult<Gasolineras>> GetGasolinera(int id)
        {
            // CORREGIDO: Usamos Gasolineras (Plural)
            var gasolinera = await _context.Gasolinera.FindAsync(id);

            if (gasolinera == null)
            {
                return NotFound();
            }

            return gasolinera;
        }

        // 3. GUARDAR (POST: api/gasolineras)
        [HttpPost]
        public async Task<ActionResult<Gasolineras>> PostGasolinera(Gasolineras gasolinera)
        {
            // CORREGIDO: Usamos Gasolineras (Plural)
            if (_context.Gasolinera.Any(g => g.place_id == gasolinera.place_id))
            {
                return BadRequest("El place_id ya existe.");
            }

            _context.Gasolinera.Add(gasolinera); // CORREGIDO: Usamos Gasolineras (Plural)
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGasolinera), new { id = gasolinera.place_id }, gasolinera);
        }

        // 4. ACTUALIZAR (PUT: api/gasolineras/5) - Implementando patrón Fetch-Update
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGasolinera(int id, Gasolineras gasolinera)
        {
            if (id != gasolinera.place_id)
            {
                return BadRequest("El ID de la URL no coincide con el place_id del cuerpo.");
            }
            
            // 1. BUSCAR la entidad existente
            var existingGasolinera = await _context.Gasolinera.FindAsync(id); 

            if (existingGasolinera == null)
            {
                return NotFound();
            }

            // 2. ACTUALIZAR las propiedades manualmente (Recomendado)
            existingGasolinera.Nombre = gasolinera.Nombre;
            existingGasolinera.cre_id = gasolinera.cre_id;
            existingGasolinera.x = gasolinera.x;
            existingGasolinera.y = gasolinera.y;
            // Agrega aquí cualquier otra propiedad que pueda cambiar...
            
            // 3. Guardar los cambios (EF Core solo actualiza lo que ha cambiado)
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // La verificación de existencia debe usar el DbSet plural corregido
                if (!_context.Gasolinera.Any(e => e.place_id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // 5. ELIMINAR (DELETE: api/gasolineras/5)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGasolinera(int id)
        {
            // CORREGIDO: Usamos Gasolineras (Plural)
            var gasolinera = await _context.Gasolinera.FindAsync(id);
            if (gasolinera == null)
            {
                return NotFound();
            }

            _context.Gasolinera.Remove(gasolinera);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
    
}
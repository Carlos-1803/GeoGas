using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GEOGAS.Api.Models;
using GEOGAS.Api.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GEOGAS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PresioGasController : ControllerBase
    {
        private readonly MyDbContext _context;

        public PresioGasController(MyDbContext context)
        {
            _context = context;
        }

        // GET: api/PresioGas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Presio_Gas>>> GetPreciosGas()
        {
            return await _context.presio_Gas.ToListAsync();
        }

        // GET: api/PresioGas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Presio_Gas>> GetPresioGas(int id)
        {
            var presioGas = await _context.presio_Gas.FindAsync(id);

            if (presioGas == null)
            {
                return NotFound(new { message = $"Precio de gas con ID {id} no encontrado" });
            }

            return presioGas;
        }

        // GET: api/PresioGas/gasolinera/5
        [HttpGet("gasolinera/{gasolineraId}")]
        public async Task<ActionResult<IEnumerable<Presio_Gas>>> GetPreciosPorGasolinera(int gasolineraId)
        {
            var precios = await _context.presio_Gas
                .Where(p => p.Gasolinerasplace_id == gasolineraId)
                .ToListAsync();

            if (!precios.Any())
            {
                return NotFound(new { message = $"No se encontraron precios para la gasolinera ID {gasolineraId}" });
            }

            return precios;
        }

        // GET: api/PresioGas/tipo/Magna
        [HttpGet("tipo/{tipo}")]
        public async Task<ActionResult<IEnumerable<Presio_Gas>>> GetPreciosPorTipo(string tipo)
        {
            var precios = await _context.presio_Gas
                .Where(p => p.tipo.ToLower() == tipo.ToLower())
                .ToListAsync();

            if (!precios.Any())
            {
                return NotFound(new { message = $"No se encontraron precios para el tipo {tipo}" });
            }

            return precios;
        }

        // GET: api/PresioGas/gasolinera/5/tipo/Magna
        [HttpGet("gasolinera/{gasolineraId}/tipo/{tipo}")]
        public async Task<ActionResult<Presio_Gas>> GetPrecioPorGasolineraYTipo(int gasolineraId, string tipo)
        {
            var precio = await _context.presio_Gas
                .FirstOrDefaultAsync(p => p.Gasolinerasplace_id == gasolineraId && p.tipo.ToLower() == tipo.ToLower());

            if (precio == null)
            {
                return NotFound(new { message = $"No se encontró precio para tipo {tipo} en gasolinera ID {gasolineraId}" });
            }

            return precio;
        }

        // POST: api/PresioGas
        [HttpPost]
        public async Task<ActionResult<Presio_Gas>> PostPresioGas(Presio_Gas presioGas)
        {
            // Validar que la gasolinera exista
            var gasolineraExists = await _context.Gasolinera.AnyAsync(g => g.place_id == presioGas.Gasolinerasplace_id);
            if (!gasolineraExists)
            {
                return BadRequest(new { message = "La gasolinera especificada no existe" });
            }

            _context.presio_Gas.Add(presioGas);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPresioGas), new { id = presioGas.Id }, presioGas);
        }

        // PUT: api/PresioGas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPresioGas(int id, Presio_Gas presioGas)
        {
            if (id != presioGas.Id)
            {
                return BadRequest(new { message = "ID en la URL no coincide con el ID del objeto" });
            }

            // Validar que la gasolinera exista
            var gasolineraExists = await _context.Gasolinera.AnyAsync(g => g.place_id == presioGas.Gasolinerasplace_id);
            if (!gasolineraExists)
            {
                return BadRequest(new { message = "La gasolinera especificada no existe" });
            }

            _context.Entry(presioGas).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PresioGasExists(id))
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

    
        // DELETE: api/PresioGas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePresioGas(int id)
        {
            var presioGas = await _context.presio_Gas.FindAsync(id);
            if (presioGas == null)
            {
                return NotFound(new { message = $"Precio de gas con ID {id} no encontrado" });
            }

            _context.presio_Gas.Remove(presioGas);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PresioGasExists(int id)
        {
            return _context.presio_Gas.Any(e => e.Id == id);
        }
    }
}
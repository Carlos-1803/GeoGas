using Microsoft.AspNetCore.Mvc;
using GEOGAS.Api.Models;
using GEOGAS.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace GEOGAS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PresioGasController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IDataSyncService _dataSyncService;

        public PresioGasController(MyDbContext context, IDataSyncService dataSyncService)
        {
            _context = context;
            _dataSyncService = dataSyncService;
        }

        // =========================================================
        // ENDPOINT DE SINCRONIZACIÓN CORREGIDO
        // =========================================================

        [HttpPost("sincronizar")]
        public async Task<IActionResult> SincronizarDatos()
        {
            try
            {
                var nuevosRegistros = await _dataSyncService.SyncGasPricesAsync();

                // Verifica en la base de datos directamente
                var totalPrecios = await _context.presio_Gas.CountAsync();

                return Ok(new { 
                    mensaje = "Sincronización completada.", 
                    registros_procesados = nuevosRegistros,
                    total_precios_bd = totalPrecios,
                    debug_info = $"Servicio retornó: {nuevosRegistros}, BD tiene: {totalPrecios} precios"
                });
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(503, new { 
                    error = "Error de conexión externa", 
                    detalle = ex.Message 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    error = "Error interno en sincronización", 
                    detalle = ex.Message 
                });
            }
        }

        [HttpGet("estado-sincronizacion")]
        public async Task<IActionResult> EstadoSincronizacion()
        {
            try
            {
                var diagnosticos = new List<string>();
                
                // 1. Verificar conexión a BD
                var canConnect = await _context.Database.CanConnectAsync();
                diagnosticos.Add($"Conexión BD: {(canConnect ? "OK" : "FALLÓ")}");
                
                // 2. Contar registros existentes
                var totalGasolineras = await _context.Gasolinera.CountAsync();
                var totalPrecios = await _context.presio_Gas.CountAsync();
                diagnosticos.Add($"Gasolineras: {totalGasolineras}, Precios: {totalPrecios}");
                
                // 3. Verificar últimas inserciones
                var ultimoPrecio = await _context.presio_Gas
                    .OrderByDescending(p => p.Id)
                    .FirstOrDefaultAsync();
                
                diagnosticos.Add($"Último precio ID: {(ultimoPrecio?.Id.ToString() ?? "Ninguno")}");
                
                return Ok(new { 
                    estado = "Diagnóstico completado",
                    resultados = diagnosticos 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    error = "Error en diagnóstico", 
                    detalle = ex.Message 
                });
            }
        }

        // =========================================================
        // ENDPOINTS CRUD CORREGIDOS
        // =========================================================

        // GET: api/PresioGas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Presio_Gas>>> GetPreciosGas()
        {
            return await _context.presio_Gas.Take(500).ToListAsync();
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
        // [Authorize]
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
        // [Authorize]
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
        // [Authorize]
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
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using GEOGAS.Api.Data;  
using GEOGAS.Models; 
using GEOGAS.Api.Services;

namespace GEOGAS.Api.Controllers
{
    // [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class GasolinerasController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly SincronizacionService _sincronizacionService;

        public GasolinerasController(MyDbContext context, SincronizacionService sincronizacionService)
        {
            _context = context;
            _sincronizacionService = sincronizacionService; 
        }

        // 1. VER TODAS (GET: api/gasolineras)
        [HttpGet]
        [AllowAnonymous] 
        public async Task<ActionResult<IEnumerable<Gasolineras>>> GetGasolineras()
        {
            return await _context.Gasolinera
                .Take(500)
                .ToListAsync(); 
        }

        // 2. VER UNA (GET: api/gasolineras/5)
        [HttpGet("{id}")]
        [AllowAnonymous] 
        public async Task<ActionResult<Gasolineras>> GetGasolinera(int id)
        {
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
            if (_context.Gasolinera.Any(g => g.place_id == gasolinera.place_id))
            {
                return BadRequest("El place_id ya existe.");
            }

            _context.Gasolinera.Add(gasolinera);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGasolinera), new { id = gasolinera.place_id }, gasolinera);
        }

        // 4. ACTUALIZAR (PUT: api/gasolineras/5)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGasolinera(int id, Gasolineras gasolinera)
        {
            if (id != gasolinera.place_id)
            {
                return BadRequest("El ID de la URL no coincide con el place_id del cuerpo.");
            }
            
            var existingGasolinera = await _context.Gasolinera.FindAsync(id); 

            if (existingGasolinera == null)
            {
                return NotFound();
            }

            existingGasolinera.Nombre = gasolinera.Nombre;
            existingGasolinera.cre_id = gasolinera.cre_id;
            existingGasolinera.x = gasolinera.x;
            existingGasolinera.y = gasolinera.y;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
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
            var gasolinera = await _context.Gasolinera.FindAsync(id);
            if (gasolinera == null)
            {
                return NotFound();
            }

            _context.Gasolinera.Remove(gasolinera);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // =========================================================
        // 6. SINCRONIZAR GASOLINERAS (POST: api/Gasolineras/sincronizar)
        // =========================================================

        [HttpPost("sincronizar")]
        public async Task<IActionResult> SincronizarGasolineras()
        {
            try
            {
                // CORRECCIÓN: El método se llama SincronizarGasolinerasAsync (con una 'r')
                var nuevosRegistros = await _sincronizacionService.SincronizarGasolinerasAsync();

                // Verificar el estado actual de la base de datos
                var totalGasolineras = await _context.Gasolinera.CountAsync();

                return Ok(new { 
                    mensaje = "Sincronización de gasolineras completada.", 
                    nuevas_gasolineras = nuevosRegistros,
                    total_gasolineras_bd = totalGasolineras,
                    debug_info = $"Servicio retornó: {nuevosRegistros} nuevas gasolineras, BD tiene: {totalGasolineras} gasolineras en total"
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
                    error = "Error interno durante la sincronización", 
                    detalle = ex.Message 
                });
            }
        }

        // =========================================================
        // 7. ENDPOINT DE DIAGNÓSTICO
        // =========================================================

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
                var ultimaGasolinera = await _context.Gasolinera
                    .OrderByDescending(g => g.place_id)
                    .FirstOrDefaultAsync();
                
                diagnosticos.Add($"Última gasolinera ID: {(ultimaGasolinera?.place_id.ToString() ?? "Ninguna")}");
                
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
        // 8. ENDPOINT ADICIONAL: OBTENER ESTADÍSTICAS
        // =========================================================

        [HttpGet("estadisticas")]
        [AllowAnonymous]
        public async Task<IActionResult> GetEstadisticas()
        {
            var totalGasolineras = await _context.Gasolinera.CountAsync();
            var totalPrecios = await _context.presio_Gas.CountAsync();
            
            // Agrupar precios por tipo
            var preciosPorTipo = await _context.presio_Gas
                .GroupBy(p => p.tipo)
                .Select(g => new { 
                    tipo = g.Key, 
                    count = g.Count(),
                    precio_promedio = g.Average(p => p.presio)
                })
                .ToListAsync();

            return Ok(new {
                total_gasolineras = totalGasolineras,
                total_precios = totalPrecios,
                precios_por_tipo = preciosPorTipo
            });
        }
    }
}
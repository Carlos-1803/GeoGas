using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization; // Necesario para [Authorize]
using GEOGAS.Api.Data;  
using GEOGAS.Models; 
using GEOGAS.Api.Services; // Importamos el namespace para usar IDataSyncService

namespace GEOGAS.Api.Controllers
{
    // [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class GasolinerasController : ControllerBase
    {
        private readonly MyDbContext _context;
        // CORRECCIÓN CLAVE: Usamos la interfaz registrada en Program.cs
        private readonly IDataSyncService _dataSyncService; 

        // Constructor con Inyección de Dependencias
        public GasolinerasController(MyDbContext context, IDataSyncService dataSyncService)
        {
            _context = context;
            // Inicializamos el servicio usando la interfaz
            _dataSyncService = dataSyncService; 
        }

        // 1. VER TODAS (GET: api/gasolineras)
        [HttpGet]
        [AllowAnonymous] 
        public async Task<ActionResult<IEnumerable<Gasolineras>>> GetGasolineras()
        {
            return await _context.Gasolinera
        .Take(500) // Limita la consulta a solo los primeros 500 registros
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

            // Actualización de propiedades
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
        // 6. SINCRONIZAR (POST: api/Gasolineras/sincronizar)
        // =========================================================

        /// <summary>
        /// Dispara la sincronización con la API externa y guarda solo los registros nuevos.
        /// Este endpoint está protegido y solo puede ser llamado por un Admin autenticado.
        /// </summary>
        [HttpPost("sincronizar")] // Ruta: /api/Gasolineras/sincronizar
        public async Task<IActionResult> SincronizarDatos()
        {
            try
            {
                // Llamamos al servicio a través de la interfaz
                var nuevosRegistros = await _dataSyncService.SyncGasPricesAsync();
                
                // Respuesta exitosa
                return Ok(new { 
                    mensaje = "Sincronización completada.", 
                    registros_procesados = nuevosRegistros 
                });
            }
            catch (HttpRequestException ex)
            {
                // Manejo de errores de conexión o API externa
                return StatusCode(503, $"Error al conectar con la fuente externa: {ex.Message}");
            }
            catch (Exception ex)
            {
                // Otros errores (XML parsing, DB, etc.)
                return StatusCode(500, $"Error interno durante la sincronización: {ex.Message}");
            }
        }
    }
}
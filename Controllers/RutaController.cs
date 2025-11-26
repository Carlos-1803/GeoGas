using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GEOGAS.Api.Models;
using GEOGAS.Api.Data;
using GEOGAS.Api.Dtos;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GEOGAS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RutaController : ControllerBase
    {
        private readonly MyDbContext _context;

        public RutaController(MyDbContext context)
        {
            _context = context;
        }

        // GET: api/ruta
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RutaResponse>>> GetRutas()
        {
            try
            {
                var rutas = await _context.Rutas.ToListAsync();
                var response = rutas.Select(r => new RutaResponse
                {
                    Id = r.Id,
                    Ubicacion = r.Ubicacion,
                    Destino = r.Destino,
                    Distancia = r.Distancia,
                    UserId = r.UserId
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/ruta/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RutaResponse>> GetRuta(int id)
        {
            try
            {
                var ruta = await _context.Rutas.FindAsync(id);

                if (ruta == null)
                {
                    return NotFound($"Ruta con ID {id} no encontrada");
                }

                var response = new RutaResponse
                {
                    Id = ruta.Id,
                    Ubicacion = ruta.Ubicacion,
                    Destino = ruta.Destino,
                    Distancia = ruta.Distancia,
                    UserId = ruta.UserId
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // GET: api/ruta/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<RutaResponse>>> GetRutasByUser(int userId)
        {
            try
            {
                var rutas = await _context.Rutas
                    .Where(r => r.UserId == userId)
                    .ToListAsync();

                var response = rutas.Select(r => new RutaResponse
                {
                    Id = r.Id,
                    Ubicacion = r.Ubicacion,
                    Destino = r.Destino,
                    Distancia = r.Distancia,
                    UserId = r.UserId
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // POST: api/ruta
        [HttpPost]
        public async Task<ActionResult<RutaResponse>> PostRuta(RutaCreateRequest request)
        {
            try
            {
                // Validación automática del modelo con DataAnnotations
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Validar que el usuario exista
                var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
                if (!userExists)
                {
                    return BadRequest($"El usuario con ID {request.UserId} no existe");
                }

                var ruta = new Ruta
                {
                    Ubicacion = request.Ubicacion,
                    Destino = request.Destino,
                    Distancia = request.Distancia,
                    UserId = request.UserId
                };

                _context.Rutas.Add(ruta);
                await _context.SaveChangesAsync();

                var response = new RutaResponse
                {
                    Id = ruta.Id,
                    Ubicacion = ruta.Ubicacion,
                    Destino = ruta.Destino,
                    Distancia = ruta.Distancia,
                    UserId = ruta.UserId
                };

                return CreatedAtAction(nameof(GetRuta), new { id = ruta.Id }, response);
            }
            catch (DbUpdateException dbEx)
            {
                // Log del error interno para debugging
                Console.WriteLine($"Database error: {dbEx.InnerException?.Message}");
                return StatusCode(500, $"Error al guardar en la base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"General error: {ex.Message}");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // PUT: api/ruta/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRuta(int id, RutaUpdateRequest request)
        {
            try
            {
                // Validación automática del modelo
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingRuta = await _context.Rutas.FindAsync(id);
                if (existingRuta == null)
                {
                    return NotFound($"Ruta con ID {id} no encontrada");
                }

                // Validar que el usuario exista
                var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
                if (!userExists)
                {
                    return BadRequest($"El usuario con ID {request.UserId} no existe");
                }

                // Actualizar propiedades
                existingRuta.Ubicacion = request.Ubicacion;
                existingRuta.Destino = request.Destino;
                existingRuta.Distancia = request.Distancia;
                existingRuta.UserId = request.UserId;

                _context.Entry(existingRuta).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"Database error: {dbEx.InnerException?.Message}");
                return StatusCode(500, $"Error al actualizar en la base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"General error: {ex.Message}");
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // DELETE: api/ruta/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRuta(int id)
        {
            try
            {
                var ruta = await _context.Rutas.FindAsync(id);
                if (ruta == null)
                {
                    return NotFound($"Ruta con ID {id} no encontrada");
                }

                _context.Rutas.Remove(ruta);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        private bool RutaExists(int id)
        {
            return _context.Rutas.Any(e => e.Id == id);
        }
    }
}
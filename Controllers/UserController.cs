using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using GEOGAS.Api.Models;
using GEOGAS.Api.Services;
using System.Security.Claims;
using System.Text;
using GEOGAS.Api.Dtos;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;


namespace GEOGAS.Api.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")] // Ruta base: /api/users
    public class UsersController : ControllerBase
    {
        // Dependencias inyectadas
        private readonly IUserService _userService;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _configuration;

        // Constructor para Inyección de Dependencias
        public UsersController(
            IUserService userService, 
            IPasswordHasher<User> passwordHasher,
            IConfiguration configuration)
        {
            _userService = userService;
            _passwordHasher = passwordHasher;
            _configuration = configuration;
        }

        // ----------------------------------------------------------------------------------
        // METODO CRUD: CREATE (POST /api/users/register)
        // ----------------------------------------------------------------------------------
        [HttpPost("register")]
        [AllowAnonymous] 
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // 1. Verificar si el usuario ya existe por correo
            var existingUser = await _userService.GetUserByEmailAsync(request.Correo);
            if (existingUser != null)
            {
                return Conflict(new { Message = "El correo electrónico ya está registrado." });
            }

            // 2. Crear el objeto Usuario (Id se asigna en la DB)
            var newUser = new User 
            {
                Nombre = request.Nombre,
                Correo = request.Correo,
                PasswordHash = string.Empty 
            };
            
            // 3. Encriptar la contraseña (Hashing y Salting)
            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, request.Contraseña);

            // 4. Guardar usuario en la DB
            var savedUser = await _userService.CreateUserAsync(newUser);
            
            // 5. Generar Token de Autenticación
            var token = GenerateJwtToken(savedUser);

            // 6. Respuesta exitosa con el token y datos del usuario (sin hash)
            return Ok(new 
            { 
                Token = token,
                User = new UserResponse { Id = savedUser.Id, Nombre = savedUser.Nombre, Correo = savedUser.Correo }
            });
        }
        
        // ----------------------------------------------------------------------------------
        // METODO CRUD: READ ALL (GET /api/users)
        // ----------------------------------------------------------------------------------
        [HttpGet]
        [AllowAnonymous]
        [Authorize] 
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllUsersAsync();
            
            // Proyectar al DTO (excluye PasswordHash)
            var response = users.Select(u => new UserResponse
            {
                Id = u.Id,
                Nombre = u.Nombre,
                Correo = u.Correo
            }).ToList();

            return Ok(response);
        }

        // ----------------------------------------------------------------------------------
        // METODO CRUD: READ BY ID (GET /api/users/{id})
        // ----------------------------------------------------------------------------------
        [HttpGet("{id}")]
        [AllowAnonymous]
       [Authorize] 
        public async Task<IActionResult> GetById(int id) // <--- CORRECCIÓN: Guid -> int
        {
            var user = await _userService.GetUserByIdAsync(id); // <--- Usa 'int'

            if (user == null)
            {
                return NotFound(new { Message = $"Usuario con ID {id} no encontrado." });
            }
            
            // Proyectar al DTO (excluye PasswordHash)
            var response = new UserResponse 
            {
                Id = user.Id,
                Nombre = user.Nombre,
                Correo = user.Correo
            };

            return Ok(response);
        }

        // ----------------------------------------------------------------------------------
        // METODO CRUD: UPDATE (PUT /api/users/{id})
        // ----------------------------------------------------------------------------------
        [HttpPut("{id}")]
        [Authorize] 
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRequest request) // <--- CORRECCIÓN: Guid -> int
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var userToUpdate = await _userService.GetUserByIdAsync(id); // <--- Usa 'int'
            if (userToUpdate == null)
            {
                return NotFound(new { Message = $"Usuario con ID {id} no encontrado." });
            }

            // Actualizar campos básicos
            userToUpdate.Nombre = request.Nombre;
            userToUpdate.Correo = request.Correo;

            // Si se proporciona una nueva contraseña, generar el nuevo hash
            if (!string.IsNullOrEmpty(request.NuevaContraseña))
            {
                userToUpdate.PasswordHash = _passwordHasher.HashPassword(userToUpdate, request.NuevaContraseña);
            }
            
            var updatedUser = await _userService.UpdateUserAsync(userToUpdate);

            // Proyectar al DTO
            var response = new UserResponse 
            {
                Id = userToUpdate.Id,
                Nombre = userToUpdate.Nombre,
                Correo = userToUpdate.Correo
            };

            return Ok(response);
        }

        // ----------------------------------------------------------------------------------
        // METODO CRUD: DELETE (DELETE /api/users/{id})
        // ----------------------------------------------------------------------------------
        [HttpDelete("{id}")]
       [Authorize] 
        public async Task<IActionResult> Delete(int id) // <--- CORRECCIÓN: Guid -> int
        {
            var success = await _userService.DeleteUserAsync(id); // <--- Usa 'int'

            if (!success)
            {
                return NotFound(new { Message = $"Usuario con ID {id} no encontrado." });
            }

            return NoContent(); // Respuesta HTTP 204: No Content (Éxito sin cuerpo)
        }


        /// <summary>
        /// Método auxiliar para generar el JWT.
        /// </summary>
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            
            // 1. Claims (Payload): Definir qué información del usuario va en el token
            var claims = new List<Claim>
            {
                // user.Id (int) se convierte a string para el claim
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), 
                new Claim(ClaimTypes.Email, user.Correo)
            };

            // 2. Clave Secreta y Credenciales de Firma
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // 3. Configuración del Token
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                Expires = DateTime.UtcNow.AddHours(1), // El token expira en 1 hora
                SigningCredentials = credentials
            };

            // 4. Creación y Serialización del token
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            
            return tokenHandler.WriteToken(token);
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using GEOGAS.Api.Models;
using GEOGAS.Api.Services;
using GEOGAS.Api.Dtos;
using System.Security.Claims;

namespace GEOGAS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Ruta base: /api/auth
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IJwtService _jwtService; 

        public AuthController(
            IUserService userService, 
            IPasswordHasher<User> passwordHasher,
            IJwtService jwtService)
        {
            _userService = userService;
            _passwordHasher = passwordHasher;
            _jwtService = jwtService;
        }

        // ----------------------------------------------------------------------------------
        // ENDPOINT 1: REGISTER (POST /api/auth/register) - PUBLICO
        // ----------------------------------------------------------------------------------
        [HttpPost("register")]
        [AllowAnonymous] 
        public async Task<IActionResult> Register([FromBody] Dtos.RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingUser = await _userService.GetUserByEmailAsync(request.Correo);
            if (existingUser != null)
            {
                return Conflict(new { Message = "El correo electrónico ya está registrado." });
            }

            var newUser = new User 
            {
                // CORRECCIÓN: Eliminar asignación manual. El ID (int) es autoincremental y lo asigna la DB.
                // Id = int.NewId(), 
                Nombre = request.Nombre,
                Correo = request.Correo,
                PasswordHash = string.Empty 
            };
            
            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, request.Contraseña);

            var savedUser = await _userService.CreateUserAsync(newUser);
            // El objeto savedUser AHORA tiene el ID entero asignado por la base de datos.
            var token = _jwtService.GenerateToken(savedUser); 

            return Ok(new 
            { 
                Token = token,
                User = new UserResponse { Id = savedUser.Id, Nombre = savedUser.Nombre, Correo = savedUser.Correo }
            });
        }

        // ----------------------------------------------------------------------------------
        // ENDPOINT 2: LOGIN (POST /api/auth/login) - PUBLICO
        // ----------------------------------------------------------------------------------
        [HttpPost("login")]
        [AllowAnonymous]
        public  async Task<IActionResult> Login([FromBody] Dtos.LoginRequest request)
        {
            ArgumentNullException.ThrowIfNull(request);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.GetUserByEmailAsync(request.Correo);

            if (user == null)
            {
                // Mensaje de error genérico por seguridad
                return Unauthorized(new { Message = "Credenciales inválidas." }); 
            }

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Contraseña);

            if (result == PasswordVerificationResult.Failed)
            {
                // Mensaje de error genérico por seguridad
                return Unauthorized(new { Message = "Credenciales inválidas." }); 
            }

            // El servicio JWT recibe el usuario que ya tiene el Id (int) y lo usa para generar el token.
            var token = _jwtService.GenerateToken(user); 

            return Ok(new 
            { 
                Token = token,
                User = new UserResponse { Id = user.Id, Nombre = user.Nombre, Correo = user.Correo }
            });
        }
        // En tu AuthController.cs
[HttpGet("validate")]
[Authorize] // Este atributo ya valida el token automáticamente
public IActionResult Validate()
{
    // Si llegó aquí, el token es válido
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
    
    return Ok(new 
    { 
        IsValid = true,
        UserId = userId,
        UserEmail = userEmail,
        Message = "Token válido"
    });
}
    }
}
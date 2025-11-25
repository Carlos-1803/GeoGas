using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using GEOGAS.Api.Models;
using GEOGAS.Api.Services;
using Microsoft.AspNetCore.Identity.Data;

namespace GEOGAS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Ruta base: /api/auth
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IJwtService _jwtService; // Nuevo servicio inyectado

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
        public async Task<IActionResult> Register([FromBody] Models.RegisterRequest request)
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
                Id = Guid.NewGuid(),
                Nombre = request.Nombre,
                Correo = request.Correo,
                PasswordHash = string.Empty 
            };
            
            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, request.Contraseña);

            var savedUser = await _userService.CreateUserAsync(newUser);
            var token = _jwtService.GenerateToken(savedUser); // Usando el servicio JWT

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
        public  async Task<IActionResult> Login([FromBody] GEOGAS.Api.Models.LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.GetUserByEmailAsync(request.Correo);

            if (user == null)
            {
                return Unauthorized(new { Message = "Credenciales inválidas." });
            }

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Contraseña);

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { Message = "Credenciales inválidas." });
            }

            var token = _jwtService.GenerateToken(user); // Usando el servicio JWT

            return Ok(new 
            { 
                Token = token,
                User = new UserResponse { Id = user.Id, Nombre = user.Nombre, Correo = user.Correo }
            });
        }
    }
}
using GEOGAS.Api.Data;
using GEOGAS.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic; // Necesario para IEnumerable
using System.Threading.Tasks;

namespace GEOGAS.Api.Services
{
    // Implementación de la lógica de negocio para los usuarios
    public class UserService : IUserService
    {
        private readonly MyDbContext _context;

        public UserService(MyDbContext context)
        {
            _context = context;
        }

        // -------------------------------------------------------------------------
        // METODOS CRUD CORE
        // -------------------------------------------------------------------------

        /// <summary>
        /// Crea un nuevo usuario y lo guarda en la base de datos.
        /// </summary>
        public async Task<User> CreateUserAsync(User newUser)
        {
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            return newUser;
        }

        /// <summary>
        /// Busca un usuario por correo electrónico de forma asíncrona.
        /// </summary>
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            // Busca la primera coincidencia con el correo
            return await _context.Users
                                 .FirstOrDefaultAsync(u => u.Correo == email);
        }

        /// <summary>
        /// Obtiene un usuario por su ID (int).
        /// </summary>
        public async Task<User?> GetUserByIdAsync(int id)
        {
            // FindAsync es eficiente para buscar por clave primaria (int)
            return await _context.Users.FindAsync(id); 
        }

        /// <summary>
        /// Obtiene la lista de todos los usuarios.
        /// </summary>
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            // Se elimina el throw new NotImplementedException() duplicado
            return await _context.Users.ToListAsync(); 
        }

        /// <summary>
        /// Actualiza un usuario existente.
        /// </summary>
        public async Task<bool> UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Elimina un usuario por su ID (int).
        /// </summary>
        public async Task<bool> DeleteUserAsync(int id)
        {
            // 1. Buscar el usuario
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return false;
            }
            
            // 2. Eliminar y guardar cambios
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }
        
       
    }
}
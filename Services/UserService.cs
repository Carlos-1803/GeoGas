using GEOGAS.Api.Data;
using GEOGAS.Api.Models;
using Microsoft.EntityFrameworkCore;
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

        /// <summary>
        /// Busca un usuario por correo electrónico de forma asíncrona.
        /// </summary>
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            // Busca la primera coincidencia con el correo ignorando mayúsculas/minúsculas
            return await _context.Users
                                 .FirstOrDefaultAsync(u => u.Correo == email);
        }

        /// <summary>
        /// Crea un nuevo usuario y lo guarda en la base de datos.
        /// </summary>
        public async Task<User> CreateUserAsync(User newUser)
        {
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            return newUser;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
            throw new NotImplementedException();
        }

        public Task<User?> GetUserByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            //throw new NotImplementedException();
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public Task<bool> DeleteUserAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task GetUserByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        async Task<User?> IUserService.GetUserByIdAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            return user;
            //throw new NotImplementedException();
        }

        public async Task<bool> DeleteUserAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return false;
            }
            
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
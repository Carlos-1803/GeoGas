
using GEOGAS.Api.Models;
using System.Threading.Tasks;

namespace GEOGAS.Api.Services
{
    // Interfaz que define las operaciones del servicio de usuarios
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        // Busca un usuario por su correo electrónico
        Task<User?> GetUserByEmailAsync(string email);

        Task<User?> GetUserByIdAsync(Guid id);

        Task<bool> UpdateUserAsync(User user);

        Task<bool> DeleteUserAsync(int id);

        

        // Agrega un nuevo usuario a la base de datos
        Task<User> CreateUserAsync(User newUser);
        Task<bool> DeleteUserAsync(Guid id);
    }
}
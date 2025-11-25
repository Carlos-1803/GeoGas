using GEOGAS.Api.Models;
using System.Collections.Generic; // Asegúrate de incluir esta dependencia para IEnumerable
using System.Threading.Tasks;
using System; // Necesario si se usa Guid en el modelo o en otras referencias

namespace GEOGAS.Api.Services
{
    // Interfaz que define las operaciones del servicio de usuarios
    public interface IUserService
    {
        // CRUD: READ ALL
        Task<IEnumerable<User>> GetAllUsersAsync();
        
        // CRUD: READ BY EMAIL
        // Busca un usuario por su correo electrónico (tipo string)
        Task<User?> GetUserByEmailAsync(string email); 

        // CRUD: READ BY ID
        Task<User?> GetUserByIdAsync(int id); // Usa int

        // CRUD: CREATE
        // Agrega un nuevo usuario a la base de datos
        Task<User> CreateUserAsync(User newUser);

        // CRUD: UPDATE
        Task<bool> UpdateUserAsync(User user);

        // CRUD: DELETE
        Task<bool> DeleteUserAsync(int id); // Usa int
    }
}
using GEOGAS.Api.Models;

namespace GEOGAS.Api.Services
{
    // Define el contrato para la generación de tokens
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
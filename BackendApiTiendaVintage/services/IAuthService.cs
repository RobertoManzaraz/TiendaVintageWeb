using BackendApiTiendaVintage.Models; 
using BackendApiTiendaVintage.DTOs; // ¡IMPORTANTE! Asegúrate de que esta línea esté aquí
using System.Threading.Tasks;

namespace BackendApiTiendaVintage.Services
{
    public interface IAuthService
    {
        Task<User> Register(string username, string stringPassword, string role = "User");
        
        // ¡IMPORTANTE! El método Login ahora devuelve un objeto de tipo LoginResponseDto (puede ser nulo)
        Task<LoginResponseDto?> Login(string username, string stringPassword); 

        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);

        // Asegúrate de que este método exista y tenga el '?' para indicar que puede ser nulo
        Task<User?> GetUserByUsername(string username);
    }
}
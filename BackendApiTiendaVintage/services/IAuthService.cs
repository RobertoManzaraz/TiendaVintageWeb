// Services/IAuthService.cs
using BackendApiTiendaVintage.Models; // Asegúrate de que este namespace sea correcto
using System.Threading.Tasks;

namespace BackendApiTiendaVintage.Services // ¡IMPORTANTE! Asegura que este namespace sea el de tu proyecto.
{
    public interface IAuthService
    {
        // Método para registrar un nuevo usuario
        Task<User> Register(string username, string password, string role = "User");
        
        // Método para iniciar sesión, devuelve el JWT si es exitoso
        Task<string> Login(string username, string password);

        // Métodos para hashear y verificar contraseñas (uso interno del servicio)
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);

        // Método para obtener un usuario por su nombre de usuario (necesario para el LoginController)
        Task<User> GetUserByUsername(string username);
    }
}

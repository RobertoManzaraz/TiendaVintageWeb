// BackendApiTiendaVintage/DTOs/LoginResponseDto.cs

namespace BackendApiTiendaVintage.DTOs
{
    // Define la estructura de la respuesta que se enviará al frontend después de un login exitoso
    public class LoginResponseDto
    {
        public string Token { get; set; }
        public string Username { get; set; } // Nombre de usuario para enviar al frontend
        public string Role { get; set; }     // Rol del usuario para enviar al frontend
    }
}
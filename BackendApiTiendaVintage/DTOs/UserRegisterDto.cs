using System.ComponentModel.DataAnnotations;

namespace BackendApiTiendaVintage.DTOs
{
    public class UserRegisterDto
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Username { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)] // Longitud mínima para la contraseña
        public string Password { get; set; }

        // Opcional: Permitir especificar el rol al registrarse (ej. para admins iniciales)
        // En un sistema real, la asignación de roles debería ser controlada y no directamente accesible al usuario final
        [StringLength(20)]
        public string Role { get; set; }
    }
}

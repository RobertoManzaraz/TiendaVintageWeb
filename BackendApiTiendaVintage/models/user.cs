// Models/User.cs
using System.ComponentModel.DataAnnotations; // Para Data Annotations como Key

namespace BackendApiTiendaVintage.Models // ¡IMPORTANTE! Asegúrate que este sea el namespace de tus modelos
{
    public class User
    {
        [Key] // Marca Id como la clave primaria
        public int Id { get; set; }

        [Required] // Campo requerido
        [StringLength(50)] // Longitud máxima
        public string Username { get; set; }

        [Required]
        // Se recomienda una longitud mayor para el hash de la contraseña
        [StringLength(256)]
        public string PasswordHash { get; set; } // Almacenará el hash de la contraseña

        [Required]
        [StringLength(20)]
        public string Role { get; set; } = "User"; // Rol del usuario (ej. "Admin", "User")
    }
}
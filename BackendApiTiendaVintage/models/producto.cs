using System.ComponentModel.DataAnnotations; // Para [Key], [Required], [MaxLength]
using Newtonsoft.Json; // Para [JsonIgnore]

namespace BackendApiTiendaVintage.Models
{
    public class Producto
    {
        public int Id { get; set; }

        [Required] // Hace que el nombre sea obligatorio
        [MaxLength(200)] // Límite de longitud para el nombre
        public string Nombre { get; set; } = string.Empty;

        [Required] // Hace que la descripción sea obligatoria
        [MaxLength(1000)] // Límite de longitud para la descripción
        public string Descripcion { get; set; } = string.Empty;

        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public string ImagenUrl { get; set; } = string.Empty;

        public bool EstaEnOferta { get; set; } = false;

        // Clave foránea para la relación con Categoria
        public int CategoriaId { get; set; }

        // *** CAMBIO CRÍTICO AQUÍ: 'Categoria?' para hacerla nullable ***
        // Esto le dice al validador que el objeto Categoria no es estrictamente requerido para la vinculación del modelo
        // cuando solo se proporciona CategoriaId.
        [JsonIgnore] // Sigue ignorando esta propiedad al serializar/deserializar JSON.
        public Categoria? Categoria { get; set; }
    }
}
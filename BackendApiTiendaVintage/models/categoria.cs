using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; // Asegúrate de usar este para [JsonIgnore]

namespace BackendApiTiendaVintage.Models
{
    public class Categoria
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        // CAMBIO CRUCIAL: Renombrado a ParentCategoryId para coincidir con el frontend
        // y la convención común en C# para claves foráneas.
        public int? ParentCategoryId { get; set; } // Renombrado de ParentId

        [JsonIgnore] // Ignora 'Parent' en la serialización JSON para evitar ciclos
        public Categoria? Parent { get; set; }

        [JsonIgnore] // Ignora 'Children' en la serialización JSON para evitar ciclos
        public ICollection<Categoria> Children { get; set; } = new List<Categoria>();

        [JsonIgnore] // Ignora 'Productos' en la serialización JSON para evitar ciclos
        public ICollection<Producto> Productos { get; set; } = new List<Producto>();
    }
}

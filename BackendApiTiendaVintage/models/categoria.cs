using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json; // <-- ¡Añade esta línea!

namespace BackendApiTiendaVintage.Models
{
    public class Categoria
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        public int? ParentId { get; set; }

        [JsonIgnore] // <-- ¡Añade esta línea! Ignora 'Parent' en la serialización JSON
        public Categoria? Parent { get; set; }

        [JsonIgnore] // <-- ¡Añade esta línea! Ignora 'Children' en la serialización JSON
        public ICollection<Categoria> Children { get; set; } = new List<Categoria>();

        [JsonIgnore] // <-- ¡Añade esta línea! Ignora 'Productos' en la serialización JSON
        public ICollection<Producto> Productos { get; set; } = new List<Producto>();
    }
}
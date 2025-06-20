using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendApiTiendaVintage.Data;
using BackendApiTiendaVintage.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendApiTiendaVintage.Controllers
{
    // Define la ruta base para este controlador: /api/Productos
    [Route("api/[controller]")]
    [ApiController] // Indica que esta clase es un controlador de API
    public class ProductosController : ControllerBase
    {
        // Campo privado para la instancia del contexto de la base de datos
        private readonly ApplicationDbContext _context;

        // Constructor: ASP.NET Core inyectará una instancia de ApplicationDbContext aquí
        public ProductosController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Productos
        // Este método recupera todos los productos de la base de datos.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Producto>>> GetProductos()
        {
            // Retorna una lista de productos de forma asíncrona.
            return await _context.Productos.ToListAsync();
        }

        // GET: api/Productos/5
        // Este método recupera un producto específico por su ID.
        [HttpGet("{id}")]
        public async Task<ActionResult<Producto>> GetProducto(int id)
        {
            // Busca el producto por ID de forma asíncrona.
            var producto = await _context.Productos.FindAsync(id);

            // Si el producto no se encuentra, devuelve un código 404 Not Found.
            if (producto == null)
            {
                return NotFound();
            }

            // Si se encuentra, devuelve el producto.
            return producto;
        }

        // POST: api/Productos
        // Este método permite crear un nuevo producto.
        [HttpPost]
        public async Task<ActionResult<Producto>> PostProducto(Producto producto)
        {
            // Añade el nuevo producto al contexto.
            _context.Productos.Add(producto);
            // Guarda los cambios en la base de datos de forma asíncrona.
            await _context.SaveChangesAsync();

            // Devuelve una respuesta 201 CreatedAtAction, indicando que el recurso fue creado
            // y proporcionando la URL para obtener el nuevo producto.
            return CreatedAtAction("GetProducto", new { id = producto.Id }, producto);
        }

        // PUT: api/Productos/5
        // Este método permite actualizar un producto existente por su ID.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProducto(int id, Producto producto)
        {
            // Verifica que el ID en la URL coincide con el ID del producto en el cuerpo de la solicitud.
            if (id != producto.Id)
            {
                return BadRequest(); // Devuelve 400 Bad Request si no coinciden.
            }

            // Marca la entidad como modificada en el contexto para que EF Core sepa que debe actualizarla.
            _context.Entry(producto).State = EntityState.Modified;

            try
            {
                // Guarda los cambios en la base de datos.
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Maneja el caso en que el producto ya no existe o fue modificado por otro proceso.
                if (!ProductoExists(id))
                {
                    return NotFound(); // Devuelve 404 Not Found.
                }
                else
                {
                    throw; // Vuelve a lanzar la excepción si es otro tipo de error de concurrencia.
                }
            }

            return NoContent(); // Devuelve 204 No Content para indicar una actualización exitosa sin contenido de retorno.
        }

        // DELETE: api/Productos/5
        // Este método permite eliminar un producto por su ID.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProducto(int id)
        {
            // Busca el producto a eliminar.
            var producto = await _context.Productos.FindAsync(id);
            // Si el producto no existe, devuelve 404 Not Found.
            if (producto == null)
            {
                return NotFound();
            }

            // Elimina el producto del contexto.
            _context.Productos.Remove(producto);
            // Guarda los cambios en la base de datos.
            await _context.SaveChangesAsync();

            return NoContent(); // Devuelve 204 No Content.
        }

        // Método auxiliar para verificar si un producto existe por su ID.
        private bool ProductoExists(int id)
        {
            return _context.Productos.Any(e => e.Id == id);
        }
    }
}

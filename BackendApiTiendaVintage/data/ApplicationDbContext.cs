using Microsoft.EntityFrameworkCore;
using BackendApiTiendaVintage.Models; // Asegúrate de que este namespace sea correcto para tus modelos

namespace BackendApiTiendaVintage.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSet representa una colección de entidades en el contexto que pueden ser consultadas desde la base de datos.
        public DbSet<Producto> Productos { get; set; }

        // Esta es la línea para tu DbSet de Categorias.
        public DbSet<Categoria> Categorias { get; set; }

        // ¡NUEVO! Añade este DbSet para tu modelo User
        public DbSet<User> Users { get; set; } // Añadido el DbSet para el modelo User

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Aquí puedes agregar configuraciones adicionales para tus modelos,
            // por ejemplo, si los nombres de las tablas en la BD son diferentes,
            // o para configurar claves compuestas, etc.
            // Ejemplo: modelBuilder.Entity<Producto>().ToTable("productos");

            // ¡NUEVO! Seed Data para un usuario administrador inicial
            // CAMBIA "adminpasshash_placeholder" por el hash real de tu contraseña
            // una vez que implementes la función de hash en AuthService.
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    // Esto es un PLACEHOLDER.
                    // Una vez que tengas tu AuthService implementado y puedas hashear contraseñas,
                    // DEBES reemplazar "adminpasshash_placeholder" con el HASH real de tu contraseña de admin.
                    PasswordHash = "adminpasshash_placeholder",
                    Role = "Admin"
                }
            );
        }
    }
}

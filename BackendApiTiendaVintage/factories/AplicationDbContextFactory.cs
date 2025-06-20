using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using BackendApiTiendaVintage.Data; // Asegúrate de que esta ruta sea correcta para tu DbContext
using System.IO;

namespace BackendApiTiendaVintage.Factories
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            // Construye la configuración para leer appsettings.json
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            // Obtiene la cadena de conexión
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            // Configura las opciones del DbContext usando Npgsql
            var builder = new DbContextOptionsBuilder<ApplicationDbContext>();
            builder.UseNpgsql(connectionString);

            // Retorna una nueva instancia de tu DbContext
            return new ApplicationDbContext(builder.Options);
        }
    }
}
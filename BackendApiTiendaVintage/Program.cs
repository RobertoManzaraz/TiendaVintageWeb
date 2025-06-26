using Npgsql; // Esta línea es crucial para que Npgsql funcione.
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore; // Importante para Entity Framework Core.
using BackendApiTiendaVintage.Data; // Necesario para acceder a tu ApplicationDbContext.
using System.Text.Json.Serialization; // Necesaria para manejar ciclos de referencia en JSON.

// --- NUEVOS USINGS PARA AUTENTICACIÓN JWT ---
using System.Text; // Necesario para Encoding.ASCII
using Microsoft.AspNetCore.Authentication.JwtBearer; // Necesario para JwtBearerDefaults y AddJwtBearer
using Microsoft.IdentityModel.Tokens; // Necesario para SymmetricSecurityKey y TokenValidationParameters
using BackendApiTiendaVintage.Services; // ¡IMPORTANTE! Tu namespace de Services para IAuthService y AuthService
// --- FIN NUEVOS USINGS ---

var builder = WebApplication.CreateBuilder(args);

// Configuración de los servicios para tu aplicación.
builder.Services.AddControllers();

// *** INICIO: CONFIGURACIÓN CORS (Permite que tu frontend se comunique con esta API) ***
// Define una política de CORS llamada "AllowSpecificOrigin".
// Ahora permite ambos posibles orígenes de Live Server (localhost y 127.0.0.1).
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:5500", "http://127.0.0.1:5500") // Aquí está la CORRECCIÓN CLAVE
                            .AllowAnyHeader() // Permite cualquier tipo de encabezado en la petición (ej. Content-Type).
                            .AllowAnyMethod()); // Permite cualquier método HTTP (GET, POST, PUT, DELETE, etc.).
});
// *** FIN: CONFIGURACIÓN CORS ***

// Configuración de Swagger/OpenAPI para la documentación de tu API.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuración de la conexión a la base de datos PostgreSQL usando Entity Framework Core.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// *** INICIO: SOLUCIÓN PARA EVITAR ERRORES DE CICLOS DE REFERENCIA EN JSON ***
// Esta línea es esencial. Evita que la API falle cuando tus datos tienen relaciones circulares
// (por ejemplo, una Categoría se relaciona con Productos, y esos Productos se relacionan de nuevo con la Categoría).
builder.Services.AddControllers().AddJsonOptions(x =>
    x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
// *** FIN: SOLUCIÓN PARA EVITAR ERRORES DE CICLOS DE REFERENCIA EN JSON ***


// --- INICIO: REGISTRO DEL SERVICIO DE AUTENTICACIÓN ---
builder.Services.AddScoped<IAuthService, AuthService>();
// --- FIN: REGISTRO DEL SERVICIO DE AUTENTICACIÓN ---


// --- INICIO: CONFIGURACIÓN JWT ---
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]); // Obtiene la clave secreta de appsettings.json
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme; // Define el esquema por defecto para autenticación
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme; // Define el esquema por defecto para desafío
})
.AddJwtBearer(x => // Configura el esquema de JWT Bearer
{
    x.RequireHttpsMetadata = false; // TRUE en producción para exigir HTTPS (por ahora en false para desarrollo HTTP)
    x.SaveToken = true; // Guarda el token en el HttpContext para que se pueda acceder después
    x.TokenValidationParameters = new TokenValidationParameters // Define cómo se validará el token
    {
        ValidateIssuerSigningKey = true, // Valida la clave con la que se firmó el token
        IssuerSigningKey = new SymmetricSecurityKey(key), // La clave secreta para la validación
        ValidateIssuer = false, // TRUE en producción si quieres validar el Issuer (definido en appsettings.json)
        ValidateAudience = false, // TRUE en producción si quieres validar la Audience (definido en appsettings.json)
        ValidateLifetime = true, // Valida la fecha de expiración del token
        ClockSkew = TimeSpan.Zero // No hay tolerancia de tiempo para la expiración
    };
});

// --- INICIO: CONFIGURACIÓN DE POLÍTICAS DE AUTORIZACIÓN BASADAS EN ROLES ---
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminPolicy", policy => policy.RequireRole("Admin")); // Define una política para usuarios con el rol "Admin"
    // Puedes añadir más políticas aquí si necesitas otros roles (ej. "UserPolicy")
});
// --- FIN: CONFIGURACIÓN DE POLÍTICAS DE AUTORIZACIÓN BASADAS EN ROLES ---


var app = builder.Build();

// Configuración del pipeline de peticiones HTTP.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(); // Habilita Swagger en desarrollo.
    app.UseSwaggerUI(); // Habilita la interfaz de usuario de Swagger.
}

// *** INICIO: ACTIVACIÓN DE LA POLÍTICA CORS EN EL FLUJO DE LA APLICACIÓN ***
// Es MUY IMPORTANTE que esta línea esté ANTES de app.UseHttpsRedirection() y app.UseAuthentication()/app.UseAuthorization().
app.UseCors("AllowSpecificOrigin"); // Aplica la política CORS que definimos arriba.
// *** FIN: ACTIVACIÓN DE LA POLÍTICA CORS ***

app.UseHttpsRedirection(); // Redirige automáticamente las peticiones HTTP a HTTPS.

// --- NUEVO: HABILITA EL MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN ---
app.UseAuthentication(); // Primero: Autentica al usuario (verifica el JWT si existe)
app.UseAuthorization();  // Segundo: Autoriza al usuario basándose en su rol/políticas
// --- FIN NUEVO: MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN ---

app.MapControllers(); // Mapea las rutas de los controladores de tu API.


app.Run(); // Inicia la aplicación.

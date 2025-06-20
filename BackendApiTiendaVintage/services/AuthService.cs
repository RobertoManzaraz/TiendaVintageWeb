// Services/AuthService.cs
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using BackendApiTiendaVintage.Data; // ¡IMPORTANTE! Asegura que este namespace sea el de tu Data
using BackendApiTiendaVintage.Models; // ¡IMPORTANTE! Asegura que este namespace sea el de tus Models

namespace BackendApiTiendaVintage.Services // ¡IMPORTANTE! Asegura que este namespace sea el de tu proyecto.
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // --- MÉTODOS DE HASHING Y VERIFICACIÓN (¡TEMPORALES PARA DESARROLLO!) ---
        // *** PARA PRODUCCIÓN, DEBES USAR UNA LIBRERÍA DE HASHING ROBUSTA COMO BCrypt.Net O Argon2 ***
        // Para BCrypt.Net: Instala NuGet 'BCrypt.Net-Core'
        // public string HashPassword(string password)
        // {
        //     return BCrypt.Net.BCrypt.HashPassword(password, 12); // Costo de hashing 12
        // }
        // public bool VerifyPassword(string password, string hashedPassword)
        // {
        //     return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        // }

        // MÉTODOS ACTUALES (¡Solo para desarrollo y pruebas rápidas! NO USAR EN PRODUCCIÓN)
        public string HashPassword(string password)
        {
            // Este es un HASH MUY SIMPLE y NO SEGURO. Sirve solo para que la lógica funcione.
            // La "sal" es fija para simplificar; en producción debería ser aleatoria por usuario.
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(password + "_fixed_salt_for_demo"));
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            return HashPassword(password) == hashedPassword;
        }
        // --- FIN MÉTODOS DE HASHING TEMPORALES ---


        public async Task<User> Register(string username, string password, string role = "User")
        {
            if (await _context.Users.AnyAsync(u => u.Username == username))
            {
                throw new ApplicationException("El nombre de usuario ya existe.");
            }

            var passwordHash = HashPassword(password); // Usamos el método de hash definido arriba
            var user = new User { Username = username, PasswordHash = passwordHash, Role = role };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<string> Login(string username, string stringPassword)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == username);
            if (user == null || !VerifyPassword(stringPassword, user.PasswordHash))
            {
                return null; // Credenciales inválidas
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            // Asegúrate de que "Jwt:Key" esté configurado en appsettings.json
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role) // Añade el rol al token
                }),
                Expires = DateTime.UtcNow.AddHours(1), // Token válido por 1 hora
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // Implementación del nuevo método para obtener usuario por username
        public async Task<User> GetUserByUsername(string username)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Username == username);
        }
    }
}

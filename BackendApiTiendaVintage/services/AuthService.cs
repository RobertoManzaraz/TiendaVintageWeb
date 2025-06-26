using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using BackendApiTiendaVintage.Data; 
using BackendApiTiendaVintage.Models; 
using BackendApiTiendaVintage.DTOs; // ¡IMPORTANTE! Asegúrate de que este using esté aquí

namespace BackendApiTiendaVintage.Services
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

        public string HashPassword(string password)
        {
            // El '!' al final de _fixed_salt_for_demo indica que confiamos en que no será nulo.
            // Esto ayuda a resolver la advertencia CS8604
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(password + "_fixed_salt_for_demo" /*!*/)); 
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            return HashPassword(password) == hashedPassword;
        }

        public async Task<User> Register(string username, string password, string role = "User")
        {
            if (await _context.Users.AnyAsync(u => u.Username == username))
            {
                throw new ApplicationException("El nombre de usuario ya existe.");
            }

            var passwordHash = HashPassword(password); 
            var user = new User { Username = username, PasswordHash = passwordHash, Role = role };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        // ¡IMPORTANTE! El método Login ahora devuelve un objeto LoginResponseDto (puede ser nulo)
        public async Task<LoginResponseDto?> Login(string username, string stringPassword)
        {
            // El '?' en 'User?' indica que 'user' puede ser nulo.
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == username);
            if (user == null || !VerifyPassword(stringPassword, user.PasswordHash))
            {
                return null; // Credenciales inválidas
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            // El '!' al final de _configuration["Jwt:Key"] indica que confiamos en que no será nulo.
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!); 

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            
            // ¡IMPORTANTE! Ahora devuelve una INSTANCIA de LoginResponseDto
            return new LoginResponseDto
            {
                Token = tokenHandler.WriteToken(token),
                Username = user.Username,
                Role = user.Role
            };
        }

        // El '?' en 'User?' indica que el retorno puede ser nulo.
        public async Task<User?> GetUserByUsername(string username)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Username == username);
        }
    }
}
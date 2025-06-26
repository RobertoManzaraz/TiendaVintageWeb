using Microsoft.AspNetCore.Mvc;
using BackendApiTiendaVintage.Services; 
using BackendApiTiendaVintage.Models; 
using System.Threading.Tasks;
using BackendApiTiendaVintage.DTOs; // ¡IMPORTANTE! Asegúrate de que este using esté aquí

namespace BackendApiTiendaVintage.Controllers
{
    [ApiController] 
    [Route("api/[controller]")] 
    public class AuthController : ControllerBase 
    {
        private readonly IAuthService _authService; 

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")] 
        public async Task<IActionResult> Register([FromBody] UserRegisterDto request) 
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); 
            }

            try
            {
                var user = await _authService.Register(request.Username, request.Password, request.Role ?? "User");
                return StatusCode(201, user);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")] 
        public async Task<IActionResult> Login([FromBody] UserLoginDto request) 
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // ¡IMPORTANTE! Ahora esperamos un LoginResponseDto del servicio
            var loginResponse = await _authService.Login(request.Username, request.Password);
            
            if (loginResponse == null)
            {
                return Unauthorized(new { message = "Credenciales inválidas." });
            }

            // ¡IMPORTANTE! Devuelve el objeto LoginResponseDto directamente, ASP.NET Core lo serializará a JSON
            return Ok(loginResponse);
        }
    }
}
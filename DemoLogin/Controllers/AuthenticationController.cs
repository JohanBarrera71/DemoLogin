using DemoLogin.DTOs;
using DemoLogin.Repositories.Contracts;
using DemoLogin.Responses;
using DemoLogin.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DemoLogin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController(IUserAccount accountInterface) : ControllerBase
    {
        [HttpGet("user")]
        [Authorize]
        public async Task<ActionResult<UserResponse>> GetUserAsync()
        {
            try
            {
                var token = Request.GetBearerToken();
                var response = await accountInterface.GetUserAsync(token);

                if (!response.Flag)
                    return BadRequest(response.Message);

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateAsync([FromForm] RegisterDto user)
        {
            if (user is null)
                return BadRequest("Model is empty.");

            var result = await accountInterface.CreateAsync(user);
            return Ok(result);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> SignInAsync(LoginDto user)
        {
            if (user is null)
                return BadRequest("Model is empty.");
            var result = await accountInterface.SignInAsync(user);
            return Ok(result);
        }

        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshTokenAsync(RefreshTokenDto refreshToken)
        {
            if (refreshToken is null)
                return BadRequest("Model is empty");
            var result = await accountInterface.RefreshTokenAsync(refreshToken);
            return Ok(result);
        }
    }
}

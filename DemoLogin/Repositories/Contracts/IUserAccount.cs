using DemoLogin.DTOs;
using DemoLogin.Responses;

namespace DemoLogin.Repositories.Contracts
{
    public interface IUserAccount
    {
        Task<UserResponse> GetUserAsync(string token);
        Task<GeneralResponse> CreateAsync(RegisterDto user);
        Task<LoginResponse> SignInAsync(LoginDto user);
        Task<LoginResponse> RefreshTokenAsync(RefreshTokenDto token);
    }
}

using DemoLogin.Data;
using DemoLogin.DTOs;
using DemoLogin.Entities;
using DemoLogin.Helpers;
using DemoLogin.Repositories.Contracts;
using DemoLogin.Responses;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace DemoLogin.Repositories.Implementations
{
    public class UserAccountRepository(IOptions<JwtSection> config, AppDbContext appDbContext, IFileStorage fileStorage) : IUserAccount
    {
        private readonly string container = "users";

        public async Task<UserResponse> GetUserAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
                return new UserResponse(false, "Token is missing or invalid.");

            // Validar y decodificar el token
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            // Obtener el claim del email
            var emailClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.Email);
            if (emailClaim == null)
                return new UserResponse(false, "Email claim is missing in token.");

            var email = emailClaim.Value;

            // Buscar al usuario por el email
            var user = await appDbContext.ApplicationUsers.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return new UserResponse(false, "User not found.");

            // Devolver la información del usuario
            return new UserResponse(true, "User info", user.Email!, user.Fullname!, user.PhotoPerfil!);
        }

        public async Task<GeneralResponse> CreateAsync(RegisterDto user)
        {
            if (user is null)
                return new GeneralResponse(false, "Model is empty.");

            var checkUser = await FindUserByEmail(user.Email!);
            if (checkUser is not null)
                return new GeneralResponse(false, "User registered already.");

            // Save user
            var applicationUser = new ApplicationUser()
            {
                Fullname = user.Fullname,
                Email = user.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(user.Password),
            };

            // Upload Image Profile to a Blob
            if (user.PhotoProfile != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await user.PhotoProfile.CopyToAsync(memoryStream);
                    var content = memoryStream.ToArray();
                    var extension = Path.GetExtension(user.PhotoProfile.FileName);
                    applicationUser.PhotoPerfil = await fileStorage.SaveFile(content, extension, container, user.PhotoProfile.ContentType);
                }
            }
            await AddToDatabase(applicationUser);

            // Check, create and assign role
            var checkAdminRole = await appDbContext.SystemRoles.FirstOrDefaultAsync(_ => _.Name!.Equals(Constants.Admin));
            if(checkAdminRole is null)
            {
                var createAdminRole = await AddToDatabase(new SystemRole() { Name = Constants.Admin });
                await AddToDatabase(new UserRole() { RoleId = createAdminRole.Id, UserId = applicationUser.Id });
                return new GeneralResponse(true, "Account created!");
            }

            var checkUserRole = await appDbContext.SystemRoles.FirstOrDefaultAsync(_ => _.Name!.Equals(Constants.User));
            SystemRole response = new();
            if(checkUserRole is null)
            {
                response = await AddToDatabase(new SystemRole() { Name = Constants.User });
                await AddToDatabase(new UserRole() { RoleId = response.Id, UserId = applicationUser.Id });
            }
            else
            {
                await AddToDatabase(new UserRole() { RoleId = checkUserRole.Id, UserId = applicationUser.Id });
            }
            return new GeneralResponse(true, "Account created!");
        }

        public async Task<LoginResponse> SignInAsync(LoginDto user)
        {
            if (user is null)
                return new LoginResponse(false, "Model is empty.");

            var applicationUser = await FindUserByEmail(user.Email!);
            if (applicationUser is null)
                return new LoginResponse(false, "User not found.");

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(user.Password, applicationUser.Password))
                return new LoginResponse(false, "Email/Password not valid.");

            var getUserRole = await FindUserRole(applicationUser.Id);
            if (getUserRole is null)
                return new LoginResponse(false, "User role not found.");

            var getRoleName = await FindRoleName(getUserRole.RoleId);
            if (getRoleName is null)
                return new LoginResponse(false, "User role not found.");

            //TODO: Implement JWT
            string jwtToken = GenerateToken(applicationUser, getRoleName!.Name!);
            string refreshToken = GenerateRefreshToken();

            // Save the refresh token to the database
            var findUser = await appDbContext.RefreshTokenInfos.FirstOrDefaultAsync(_ => _.UserId == applicationUser.Id);
            if(findUser is not null)
            {
                findUser!.Token = refreshToken;
                await appDbContext.SaveChangesAsync();
            }
            else
            {
                await AddToDatabase(new RefreshTokenInfo() { Token = refreshToken, UserId = applicationUser.Id });
            }

            return new LoginResponse(true, "Login Successfully!", jwtToken, refreshToken);
        }

        public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenDto token)
        {
            if (token is null)
                return new LoginResponse(false, "Model is empty.");

            var findToken = await appDbContext.RefreshTokenInfos.FirstOrDefaultAsync(_ => _.Token!.Equals(token.RefreshToken));
            if (findToken is null)
                return new LoginResponse(false, "Refresh token is required");

            // Get user details
            var user = await appDbContext.ApplicationUsers.FirstOrDefaultAsync(_ => _.Id == findToken.UserId);
            if (user is null)
                return new LoginResponse(false, "Refresh token could not be generated because user not found.");

            var userRole = await FindUserRole(user.Id);
            var roleName = await FindRoleName(userRole.RoleId);
            string jwtToken = GenerateToken(user, roleName.Name!);
            string refreshToken = GenerateRefreshToken();

            var updateRefreshToken = await appDbContext.RefreshTokenInfos.FirstOrDefaultAsync(_ => _.UserId == user.Id);
            if (updateRefreshToken is null)
                return new LoginResponse(false, "Refresh token could not be generated because user has not signed in");

            updateRefreshToken.Token = refreshToken;
            await appDbContext.SaveChangesAsync();
            return new LoginResponse(true, "Token refreshed successfully", jwtToken, refreshToken);
        }

        private string GenerateToken(ApplicationUser user, string role)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config.Value.Key!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var userClaims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Fullname!),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Role, role!)
            };

            var token = new JwtSecurityToken(
                issuer: config.Value.Issuer,
                audience: config.Value.Audience,
                claims: userClaims,
                expires: DateTime.UtcNow.AddMinutes(1),
                signingCredentials:credentials
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        private async Task<SystemRole> FindRoleName(int roleId) => 
            await appDbContext.SystemRoles.FirstOrDefaultAsync(_ => _.Id == roleId);

        private async Task<UserRole> FindUserRole(int userId) => 
            await appDbContext.UserRoles.FirstOrDefaultAsync(_ => _.UserId == userId);

        private async Task<ApplicationUser> FindUserByEmail(string email) =>
            await appDbContext.ApplicationUsers.FirstOrDefaultAsync(_ => _.Email!.ToLower()!.Equals(email!.ToLower()));

        private async Task<T> AddToDatabase<T>(T model)
        {
            var result = appDbContext.Add(model!);
            await appDbContext.SaveChangesAsync();
            return (T)result.Entity;
        }
    }
}

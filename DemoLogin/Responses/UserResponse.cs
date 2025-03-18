namespace DemoLogin.Responses
{
    public record UserResponse(bool Flag, string Message = null!, string Email = null!, string Fullname = null!, string PhotoProfile = null!);
}

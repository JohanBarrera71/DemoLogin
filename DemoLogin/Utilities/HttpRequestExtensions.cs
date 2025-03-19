namespace DemoLogin.Utilities
{
    public static class HttpRequestExtensions
    {
        public static string GetBearerToken(this HttpRequest request)
        {
            var authHeader = request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                throw new UnauthorizedAccessException("Token is missing or invalid.");

            return authHeader.Substring("Bearer ".Length).Trim();
        }
    }
}

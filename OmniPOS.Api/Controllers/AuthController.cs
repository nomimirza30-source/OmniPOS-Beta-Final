using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using OmniPOS.Api.Data;
using OmniPOS.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace OmniPOS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly OmniDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(OmniDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Global staff check (or tenant-specific depending on how user wants it)
        // For this POS, we'll try to find the staff across all tenants if tenantId isn't provided, 
        // but ideally the user picks a tenant or we derive from URL.
        // For MVP, we'll find by username.
        
        var staff = await _context.StaffMembers
            .IgnoreQueryFilters() // Login needs to find user globally first
            .FirstOrDefaultAsync(s => s.Username == request.Username);

        var count = await _context.StaffMembers.IgnoreQueryFilters().CountAsync();
        Console.WriteLine($"[AUTH_DEBUG] Login attempt: {request.Username}. Total staff in DB: {count}");

        if (staff == null)
        {
            Console.WriteLine($"[AUTH_DEBUG] Staff not found for username: {request.Username}");
            return Unauthorized(new { message = "Invalid username or password" });
        }

        bool isValid = PasswordHasher.VerifyPassword(request.Password, staff.PasswordHash);
        Console.WriteLine($"[AUTH_DEBUG] User found: {staff.FullName}. Password valid: {isValid}");

        if (!isValid)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        try
        {
            var token = GenerateJwtToken(staff);

            return Ok(new
            {
                token,
                user = new
                {
                    id = staff.StaffId,
                    fullName = staff.FullName,
                    role = staff.Role,
                    tenantId = staff.TenantId
                }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AUTH_ERROR] Login crashed: {ex}");
            if (ex.InnerException != null) Console.WriteLine($"[AUTH_ERROR_INNER] {ex.InnerException}");
            return StatusCode(500, new { message = "Server Error: " + ex.Message });
        }
    }

    private string GenerateJwtToken(Staff staff)
    {
        var jwtKey = _config["Jwt:Key"] ?? "a_very_secure_and_long_secret_key_for_omnipos_2026";
        var jwtIssuer = _config["Jwt:Issuer"] ?? "OmniPOS";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, staff.StaffId.ToString()),
            new Claim(ClaimTypes.Role, staff.Role),
            new Claim("TenantId", staff.TenantId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtIssuer,
            claims: claims,
            expires: DateTime.Now.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OmniPOS.Api.Data;
using OmniPOS.Api.Middleware;

namespace OmniPOS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize] - Temporarily disabled for MVP as no login UI is present
public class SettingsController : ControllerBase
{
    private readonly OmniDbContext _context;
    private readonly ITenantProvider _tenantProvider;
    private readonly IWebHostEnvironment _environment;

    public SettingsController(OmniDbContext context, ITenantProvider tenantProvider, IWebHostEnvironment environment)
    {
        _context = context;
        _tenantProvider = tenantProvider;
        _environment = environment;
    }

    [HttpPost("upload-logo")]
    // [Authorize(Policy = "RequireAdmin")]
    public async Task<IActionResult> UploadLogo(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

        var tenantId = _tenantProvider.TenantId;
        if (tenantId == null) return BadRequest("Tenant not identified.");

        var wwwRootPath = _environment.WebRootPath;
        if (string.IsNullOrEmpty(wwwRootPath))
        {
            wwwRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadsFolder = Path.Combine(wwwRootPath, "uploads", "logos");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = $"{tenantId}_{DateTime.UtcNow.Ticks}{fileExtension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var logoUrl = $"/uploads/logos/{fileName}";

        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.TenantId == tenantId);
        if (tenant == null)
        {
            tenant = new Tenant { TenantId = tenantId.Value, Name = "New Tenant" };
            _context.Tenants.Add(tenant);
        }
        
        tenant.LogoUrl = logoUrl;
        await _context.SaveChangesAsync();

        return Ok(new { logoUrl });
    }

    [HttpGet("branding")]
    public async Task<ActionResult<BrandingResponse>> GetBranding()
    {
        var tenantId = _tenantProvider.TenantId;
        if (tenantId == null) return BadRequest("Tenant not identified.");

        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.TenantId == tenantId);
        if (tenant == null) return NotFound("Tenant not found.");

        return new BrandingResponse
        {
            AppName = tenant.AppName,
            LogoUrl = tenant.LogoUrl,
            PrimaryColor = tenant.PrimaryColor,
            SecondaryColor = tenant.SecondaryColor,
            ThemeMode = tenant.ThemeMode
        };
    }

    [HttpPost("branding")]
    // [Authorize(Policy = "RequireAdmin")]
    public async Task<IActionResult> UpdateBranding([FromBody] UpdateBrandingRequest request)
    {
        var tenantId = _tenantProvider.TenantId;
        if (tenantId == null) return BadRequest("Tenant not identified.");

        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.TenantId == tenantId);
        if (tenant == null)
        {
            tenant = new Tenant { TenantId = tenantId.Value, Name = "New Tenant" };
            _context.Tenants.Add(tenant);
        }

        tenant.AppName = request.AppName ?? tenant.AppName;
        tenant.LogoUrl = request.LogoUrl ?? tenant.LogoUrl;
        tenant.PrimaryColor = request.PrimaryColor ?? tenant.PrimaryColor;
        tenant.SecondaryColor = request.SecondaryColor ?? tenant.SecondaryColor;
        tenant.ThemeMode = request.ThemeMode ?? tenant.ThemeMode;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Branding updated successfully." });
    }
}

public class BrandingResponse
{
    public string AppName { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = "#38bdf8"; // Default Sky Blue
    public string SecondaryColor { get; set; } = "#818cf8"; // Default Indigo
    public string ThemeMode { get; set; } = "dark"; // dark or light
}

public class UpdateBrandingRequest
{
    public string? AppName { get; set; }
    public string? LogoUrl { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? ThemeMode { get; set; }
}

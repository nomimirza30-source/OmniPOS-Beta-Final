using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OmniPOS.Api.Data;
using OmniPOS.Api.Services.Payments;

namespace OmniPOS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly OmniDbContext _dbContext;
    private readonly IPaymentGateway _paymentGateway;
    private readonly QrCodeService _qrService;

    public PaymentController(OmniDbContext dbContext, IPaymentGateway paymentGateway, QrCodeService qrService)
    {
        _dbContext = dbContext;
        _paymentGateway = paymentGateway;
        _qrService = qrService;
    }

    [HttpGet("generate-qr/{orderId}")]
    [Authorize(Policy = "RequireServer")]
    public async Task<IActionResult> GetQrCode(Guid orderId)
    {
        var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
        if (order == null) return NotFound("Order not found or access denied.");

        var link = _qrService.GeneratePaymentLink(order.OrderId, order.TotalAmount, order.TenantId);
        
        // In a real app, we would use a library like QRCoder to return an actual image.
        // For MVP, we return the encoded link.
        return Ok(new { PaymentLink = link });
    }

    [HttpPost("process")]
    [Authorize(Policy = "RequireServer")]
    public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequest request)
    {
        var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.OrderId == request.OrderId);
        if (order == null) return NotFound("Order not found.");

        var result = await _paymentGateway.ProcessPaymentAsync(request);

        if (result.Success)
        {
            order.Status = "Paid";
            await _dbContext.SaveChangesAsync();
        }

        return Ok(result);
    }
}

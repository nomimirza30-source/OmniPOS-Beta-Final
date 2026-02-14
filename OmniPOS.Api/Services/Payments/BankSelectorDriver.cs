namespace OmniPOS.Api.Services.Payments;

public class BankSelectorDriver : IPaymentGateway
{
    public async Task<PaymentResponse> ProcessPaymentAsync(PaymentRequest request)
    {
        // Simulate external bank API call
        await Task.Delay(500); 

        return new PaymentResponse
        {
            TransactionId = "BANK-" + Guid.NewGuid().ToString().Substring(0, 8),
            Success = true,
            Status = "Completed",
            Message = "Payment authorized by Bank Selector"
        };
    }

    public Task<PaymentResponse> GetStatusAsync(string transactionId)
    {
        return Task.FromResult(new PaymentResponse
        {
            TransactionId = transactionId,
            Success = true,
            Status = "Completed"
        });
    }
}

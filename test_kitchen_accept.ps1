$baseUrl = "http://localhost:5000"

# 1. Login as Kitchen to get Token
$kitchenUser = @{
    username = "kitchen"
    password = "kitchen123"
}
$loginUrl = "$baseUrl/api/auth/login"
try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body ($kitchenUser | ConvertTo-Json) -ContentType "application/json"
    $token = $loginResponse.token
    $tenantId = $loginResponse.user.tenantId
    Write-Host "Login Successful. Token received. TenantId: $tenantId" -ForegroundColor Green
}
catch {
    Write-Host "Login Failed: $_" -ForegroundColor Red
    exit
}

# 2. Get Pending Orders
$ordersUrl = "$baseUrl/api/order"
$headers = @{
    Authorization = "Bearer $token"
    "X-Tenant-ID" = $tenantId
}
try {
    $orders = Invoke-RestMethod -Uri $ordersUrl -Method Get -Headers $headers
    $pendingOrder = $orders | Where-Object { $_.workflowStatus -eq "Placed" } | Select-Object -First 1

    if ($pendingOrder) {
        $orderId = $pendingOrder.orderId
        Write-Host "Found Pending Order: $orderId" -ForegroundColor Cyan
        
        # 3. Try to Accept Order (Update Status to 'Preparing')
        $updateUrl = "$baseUrl/api/order/$orderId/status"
        $body = @{
            newStatus = "Preparing"
        }
        
        Write-Host "Attempting to Accept Order..." -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri $updateUrl -Method Post -Headers $headers -Body ($body | ConvertTo-Json) -ContentType "application/json"
            Write-Host "Order Accepted Successfully!" -ForegroundColor Green
            Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
        }
        catch {
            Write-Host "Failed to Accept Order: $_" -ForegroundColor Red
            # Print detailed error if available
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $details = $reader.ReadToEnd()
                Write-Host "Error Details: $details" -ForegroundColor Red
            }
        }
    }
    else {
        Write-Host "No 'Pending' orders found to test acceptance." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Failed to fetch orders: $_" -ForegroundColor Red
}

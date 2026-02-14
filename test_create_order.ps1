$baseUrl = "http://localhost:5000"
$loginUrl = "$baseUrl/api/auth/login"
$syncUrl = "$baseUrl/api/OfflineSync/sync-orders"

# 1. Login
$kitchenUser = @{
    username = "admin" # Admin receives notifications too
    password = "admin123"
}
try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body ($kitchenUser | ConvertTo-Json) -ContentType "application/json"
    $token = $loginResponse.token
    $tenantId = $loginResponse.user.tenantId
    Write-Host "Login Successful. Tenant: $tenantId" -ForegroundColor Green
}
catch {
    Write-Host "Login Failed: $_" -ForegroundColor Red
    exit
}

# 2. Create Order Payload
$orderId = [Guid]::NewGuid().ToString()
$payload = @(
    @{
        orderId      = $orderId
        customerName = "Test User"
        totalAmount  = 50.00
        status       = "Placed"
        createdAt    = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        tableId      = "1"
        items        = @()
    }
)

$headers = @{
    Authorization = "Bearer $token"
    "X-Tenant-ID" = $tenantId
}

# 3. Send Request
try {
    Write-Host "Sending SyncOrders request..."
    $jsonPayload = $payload | ConvertTo-Json -Depth 5
    if (!$jsonPayload.Trim().StartsWith("[")) {
        $jsonPayload = "[$jsonPayload]"
    }
    $response = Invoke-RestMethod -Uri $syncUrl -Method Post -Headers $headers -Body $jsonPayload -ContentType "application/json"
    Write-Host "Order Created Successfully!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json)
}
catch {
    Write-Host "Create Order Failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
    }
}

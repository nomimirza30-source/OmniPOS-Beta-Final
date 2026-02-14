# Direct Customer API Test - Minimal Version
Write-Host "Testing Customer API..." -ForegroundColor Cyan

# Step 1: Login
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"username":"admin","password":"admin123"}' `
    -UseBasicParsing

Write-Host "Logged in as: $($login.user.fullName)" -ForegroundColor Green
Write-Host "Tenant ID: $($login.user.tenantId)" -ForegroundColor Cyan
Write-Host ""

# Step 2: Get Customers
try {
    $customers = Invoke-RestMethod -Uri "http://localhost:5000/api/customer" `
        -Method GET `
        -Headers @{
        "Authorization" = "Bearer $($login.token)"
        "X-Tenant-ID"   = $login.user.tenantId
    } `
        -UseBasicParsing
    
    Write-Host "SUCCESS! Found $($customers.Count) customers:" -ForegroundColor Green
    Write-Host ""
    
    $customers | ForEach-Object {
        Write-Host "[$($_.vipTier)] $($_.name)" -ForegroundColor $(if ($_.vipTier -eq "P1") { "Magenta" } elseif ($_.vipTier -eq "P2") { "Yellow" } else { "Gray" })
        Write-Host "  Spend: £$($_.totalLifetimeSpend) | Visits: $($_.totalVisits)" -ForegroundColor Cyan
    }
    
}
catch {
    Write-Host "FAILED to get customers!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "Response: $body" -ForegroundColor Yellow
    }
}

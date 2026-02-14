# Quick Customer Verification Script
# Checks if the VIP customers were created successfully

Write-Host "Checking VIP Customers..." -ForegroundColor Cyan
Write-Host ""

# Login
$loginBody = '{"username":"admin","password":"admin123"}'
$loginResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -UseBasicParsing
$token = $loginResp.token
$tenantId = $loginResp.user.tenantId

# Get customers
$headers = @{
    "Authorization" = "Bearer $token"
    "X-Tenant-ID"   = $tenantId
}

try {
    $customers = Invoke-RestMethod -Uri "http://localhost:5000/api/customer" -Headers $headers -UseBasicParsing
    
    Write-Host "Found $($customers.Count) customers in database:" -ForegroundColor Green
    Write-Host ""
    
    foreach ($c in $customers) {
        $tierBadge = if ($c.vipTier) { "[$($c.vipTier)]" } else { "[No Tier]" }
        $tierColor = switch ($c.vipTier) {
            "P1" { "Magenta" }
            "P2" { "Yellow" }
            "P3" { "Gray" }
            default { "White" }
        }
        
        Write-Host "$tierBadge $($c.name)" -ForegroundColor $tierColor
        Write-Host "  Email: $($c.email)" -ForegroundColor White
        Write-Host "  Phone: $($c.phone)" -ForegroundColor White
        Write-Host "  Lifetime Spend: £$($c.totalLifetimeSpend)" -ForegroundColor Cyan
        Write-Host "  Total Visits: $($c.totalVisits)" -ForegroundColor Cyan
        if ($c.dietaryRestrictions) {
            Write-Host "  Dietary: $($c.dietaryRestrictions)" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    Write-Host "Customers exist in the database!" -ForegroundColor Green
    Write-Host "The frontend needs a Customers page to display them." -ForegroundColor Yellow
    
}
catch {
    Write-Host "Error fetching customers: $_" -ForegroundColor Red
}

# Simple VIP Customer Creator - Minimal Version
# Creates one test customer to verify the API works

Write-Host "Testing Customer API..." -ForegroundColor Cyan

# Login
$loginBody = '{"username":"admin","password":"admin123"}'
try {
    $loginResp = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $loginData = $loginResp.Content | ConvertFrom-Json
    $token = $loginData.token
    Write-Host "Logged in as: $($loginData.user.fullName)" -ForegroundColor Green
}
catch {
    Write-Host "Login failed. Make sure password is correct." -ForegroundColor Red
    exit
}

# Create simple test customer
$customerBody = @"
{
    "name": "James Anderson",
    "email": "james.anderson@example.com",
    "phone": "+44 7700 900001",
    "dietaryRestrictions": "[\"Severe Nut Allergy\"]",
    "preferences": "{\"seating\":\"Corner tables\"}",
    "personalMilestones": "{\"birthday\":\"1975-06-15\"}",
    "dataConsentGiven": true
}
"@

Write-Host "Creating customer..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type"  = "application/json"
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/customer" -Method POST -Headers $headers -Body $customerBody
    $customer = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS! Created customer: $($customer.name)" -ForegroundColor Green
    Write-Host "Customer ID: $($customer.customerId)" -ForegroundColor Cyan
    
    # Now update with VIP data
    $vipBody = @"
{
    "totalLifetimeSpend": 12500.00,
    "totalVisits": 58,
    "vipTier": "P1",
    "vipNotes": "Food critic. Always comp amuse-bouche."
}
"@
    
    Write-Host "Updating VIP data..." -ForegroundColor Yellow
    $updateResp = Invoke-WebRequest -Uri "http://localhost:5000/api/customer/$($customer.customerId)" -Method PUT -Headers $headers -Body $vipBody
    Write-Host "SUCCESS! Customer is now a P1 VIP!" -ForegroundColor Green
    
}
catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get response body
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

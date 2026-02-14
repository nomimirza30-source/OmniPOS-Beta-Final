# Automated VPS Log Checker
$password = "Ayaaniman184@"
$vpsIP = "72.60.23.21"

# Create SSH command
$command = "cd /root/omnipos && docker compose logs api --tail=100"

# Use plink (PuTTY) if available, otherwise use expect-like behavior
Write-Host "Connecting to VPS and fetching logs..." -ForegroundColor Yellow
Write-Host ""

# Try using plink first
$plinkPath = "C:\Program Files\PuTTY\plink.exe"
if (Test-Path $plinkPath) {
    & $plinkPath -ssh -pw $password -batch root@$vpsIP $command
}
else {
    # Fallback: Create a temporary expect script
    Write-Host "Installing plink for automated SSH..." -ForegroundColor Yellow
    winget install -e --id PuTTY.PuTTY --accept-package-agreements --accept-source-agreements
    
    Write-Host "Please run this script again after PuTTY installation completes." -ForegroundColor Green
}

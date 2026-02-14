# VPS Diagnostic Script for OmniPOS
# This script connects to the VPS and checks the Docker container logs

Write-Host "=== OmniPOS VPS Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

# VPS connection details (you'll need to provide these)
$vpsIP = Read-Host "Enter VPS IP address (e.g., 123.45.67.89)"
$vpsUser = Read-Host "Enter VPS username (default: root)"
if ([string]::IsNullOrWhiteSpace($vpsUser)) { $vpsUser = "root" }

Write-Host ""
Write-Host "Connecting to VPS..." -ForegroundColor Yellow
Write-Host ""

# SSH command to check container status and logs
$sshCommand = @"
echo '--- Docker Container Status ---'
cd /root/omnipos
docker compose ps

echo ''
echo '--- API Container Logs (Last 100 lines) ---'
docker compose logs api --tail=100

echo ''
echo '--- Checking for Database File ---'
docker compose exec -T api ls -lah /app/*.db 2>/dev/null || echo 'No database files found'

echo ''
echo '--- Container Resource Usage ---'
docker stats --no-stream
"@

# Execute SSH command
ssh "$vpsUser@$vpsIP" $sshCommand

Write-Host ""
Write-Host "=== Diagnostic Complete ===" -ForegroundColor Cyan

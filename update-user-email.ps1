# PowerShell script to update WordPress user email
# Usage: .\update-user-email.ps1

$ContainerName = "farmer-johns-botanicals-wp"
$PhpFile = "update-user-email.php"

Write-Host "WordPress User Email Update Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if WordPress container is running
Write-Host "Checking if WordPress container is running..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=$ContainerName" --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "ERROR: Container '$ContainerName' is not running!" -ForegroundColor Red
    Write-Host "Please start the containers first with: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}
Write-Host "Container is running: $containerStatus" -ForegroundColor Green
Write-Host ""

# Check if PHP file exists
if (-not (Test-Path $PhpFile)) {
    Write-Host "ERROR: PHP file not found: $PhpFile" -ForegroundColor Red
    exit 1
}

Write-Host "Updating WordPress user email..." -ForegroundColor Yellow
Write-Host ""

# Execute the PHP script inside the WordPress container
try {
    docker exec $ContainerName php /var/www/html/$PhpFile
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to update user email"
    }
    
    Write-Host ""
    Write-Host "Script completed!" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to update user email!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- Make sure the WordPress container is running" -ForegroundColor White
    Write-Host "- Check container logs: docker logs $ContainerName" -ForegroundColor White
    exit 1
}


# PowerShell script to upgrade WordPress using WP-CLI
# Usage: .\upgrade-wordpress.ps1 [-Force]
param(
    [switch]$Force
)

$ContainerName = "farmer-johns-botanicals-wp"

Write-Host "WordPress Upgrade Script" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
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

# Check current WordPress version
Write-Host "Checking current WordPress version..." -ForegroundColor Yellow
$currentVersion = docker exec $ContainerName wp core version --allow-root
Write-Host "Current version: $currentVersion" -ForegroundColor White
Write-Host ""

# Check for updates
Write-Host "Checking for WordPress updates..." -ForegroundColor Yellow
docker exec $ContainerName wp core check-update --allow-root
Write-Host ""

# Confirm before proceeding
Write-Host "This will upgrade WordPress to the latest version." -ForegroundColor Yellow
Write-Host "WARNING: Make sure you have a backup before proceeding!" -ForegroundColor Red
Write-Host ""
if (-not $Force) {
    if ([Environment]::UserInteractive) {
        $confirm = Read-Host "Do you want to continue? (y/N)"
        if ($confirm -ne "y" -and $confirm -ne "Y") {
            Write-Host "Upgrade cancelled." -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "Non-interactive mode detected. Use -Force parameter to skip confirmation." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "Starting WordPress upgrade..." -ForegroundColor Yellow
Write-Host ""

try {
    # Download the latest WordPress core files
    Write-Host "Downloading WordPress core files..." -ForegroundColor Yellow
    docker exec $ContainerName wp core download --force --allow-root
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to download WordPress core"
    }
    
    # Update the database if needed
    Write-Host "Updating database..." -ForegroundColor Yellow
    docker exec $ContainerName wp core update-db --allow-root
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Database update had issues, but continuing..." -ForegroundColor Yellow
    }
    
    # Check new version
    Write-Host ""
    Write-Host "Checking new WordPress version..." -ForegroundColor Yellow
    $newVersion = docker exec $ContainerName wp core version --allow-root
    Write-Host "New version: $newVersion" -ForegroundColor Green
    Write-Host ""
    Write-Host "WordPress upgrade completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Check your site at: http://local.farmerjohnsbotanicals.com:8080" -ForegroundColor White
    Write-Host "2. Update plugins and themes from the WordPress admin" -ForegroundColor White
    Write-Host "3. Test all functionality to ensure everything works" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Upgrade failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- Check container logs: docker logs $ContainerName" -ForegroundColor White
    Write-Host "- Ensure you have backups before trying again" -ForegroundColor White
    exit 1
}


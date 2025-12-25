# PowerShell script to update WordPress site URLs in the database
# Usage: .\update-site-urls.ps1 [-Force]
param(
    [switch]$Force
)

$ContainerName = "farmer-johns-botanicals-db"
$DatabaseName = "fjb_db"
$DatabaseUser = "russell_fjb_user"
$DatabasePassword = "EZsDNwLGpIPKi4E"
$SqlFile = "update-site-urls.sql"

Write-Host "WordPress Site URL Update Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if container is running
Write-Host "Checking if MySQL container is running..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=$ContainerName" --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "ERROR: Container '$ContainerName' is not running!" -ForegroundColor Red
    Write-Host "Please start the containers first with: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}
Write-Host "Container is running: $containerStatus" -ForegroundColor Green
Write-Host ""

# Check if SQL file exists
if (-not (Test-Path $SqlFile)) {
    Write-Host "ERROR: SQL file not found: $SqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "SQL file found: $SqlFile" -ForegroundColor Green
Write-Host ""

# Confirm before proceeding
Write-Host "This will update site URLs in the WordPress database." -ForegroundColor Yellow
Write-Host "Old URLs (hammerheadsilver.local, hammerheadsilver.com) will be replaced with:" -ForegroundColor Yellow
Write-Host "  http://local.farmerjohnsbotanicals.com:8080" -ForegroundColor White
Write-Host ""
if (-not $Force) {
    if ([Environment]::UserInteractive) {
        $confirm = Read-Host "Do you want to continue? (y/N)"
        if ($confirm -ne "y" -and $confirm -ne "Y") {
            Write-Host "Update cancelled." -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "Non-interactive mode detected. Use -Force parameter to skip confirmation." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "Updating site URLs..." -ForegroundColor Yellow
Write-Host ""

# Execute the SQL file
try {
    # Copy SQL file into container
    Write-Host "Copying SQL file into container..." -ForegroundColor Yellow
    docker cp $SqlFile "${ContainerName}:/tmp/update-urls.sql"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to copy SQL file into container"
    }
    
    # Execute the SQL file
    Write-Host "Executing SQL updates..." -ForegroundColor Yellow
    docker exec $ContainerName sh -c "mysql -u$DatabaseUser -p$DatabasePassword $DatabaseName < /tmp/update-urls.sql"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to execute SQL updates"
    }
    
    # Clean up
    Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
    docker exec $ContainerName rm -f /tmp/update-urls.sql
    
    Write-Host ""
    Write-Host "Site URLs updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Note: If you see warnings about serialized data, you may need to use" -ForegroundColor Yellow
    Write-Host "WordPress tools or WP-CLI for more thorough URL replacement." -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Update failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- Make sure the MySQL container is running and healthy" -ForegroundColor White
    Write-Host "- Check container logs: docker logs $ContainerName" -ForegroundColor White
    exit 1
}


# PowerShell script to import WordPress database backup into Docker MySQL container
# Usage: .\import-db.ps1 [backup-file.sql]

param(
    [string]$BackupFile = "db-backup\hammerhe_wrdp1_local_2018-11-24_654pm.sql",
    [switch]$Force
)

$ContainerName = "farmer-johns-botanicals-db"
$DatabaseName = "fjb_db"
$DatabaseUser = "russell_fjb_user"
$DatabasePassword = "EZsDNwLGpIPKi4E"

Write-Host "WordPress Database Import Script" -ForegroundColor Cyan
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

# Check if backup file exists
if (-not (Test-Path $BackupFile)) {
    Write-Host "ERROR: Backup file not found: $BackupFile" -ForegroundColor Red
    Write-Host "Available backup files:" -ForegroundColor Yellow
    Get-ChildItem -Path "db-backup\*.sql" | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
    exit 1
}

Write-Host "Backup file found: $BackupFile" -ForegroundColor Green
$fileSize = (Get-Item $BackupFile).Length / 1MB
Write-Host "File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Gray
Write-Host ""

# Confirm before proceeding (unless -Force is used)
if (-not $Force) {
    Write-Host "This will import the database backup into the MySQL container." -ForegroundColor Yellow
    Write-Host "WARNING: This will overwrite any existing data in the database!" -ForegroundColor Red
    if ([Environment]::UserInteractive) {
        $confirm = Read-Host "Do you want to continue? (y/N)"
        if ($confirm -ne "y" -and $confirm -ne "Y") {
            Write-Host "Import cancelled." -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "Non-interactive mode detected. Use -Force parameter to skip confirmation." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "Importing database..." -ForegroundColor Yellow
Write-Host "This may take a few minutes for large files..." -ForegroundColor Gray
Write-Host ""

# Import the database
try {
    # Copy file into container first (for large files, this is more reliable)
    Write-Host "Copying SQL file into container..." -ForegroundColor Yellow
    docker cp $BackupFile "${ContainerName}:/tmp/backup.sql"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to copy file into container"
    }
    
    # Import the database using the copied file
    Write-Host "Importing SQL file..." -ForegroundColor Yellow
    docker exec $ContainerName sh -c "mysql -u$DatabaseUser -p$DatabasePassword $DatabaseName < /tmp/backup.sql"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to import database"
    }
    
    # Clean up
    Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
    docker exec $ContainerName rm -f /tmp/backup.sql
    
    Write-Host ""
    Write-Host "Database import completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update site URLs in the database if needed (the backup may have old URLs)" -ForegroundColor White
    Write-Host "2. Access your site at http://local.farmerjohnsbotanicals.com:8080" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Import failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- Make sure the MySQL container is running and healthy" -ForegroundColor White
    Write-Host "- Check container logs: docker logs $ContainerName" -ForegroundColor White
    Write-Host "- Verify database credentials in wp-config.php match docker-compose.yml" -ForegroundColor White
    exit 1
}



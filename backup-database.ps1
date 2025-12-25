# Database Backup Script
# Backs up the WordPress database to db-backup folder with timestamp
# This version runs mysqldump via Docker

$dbName = "fjb_db"
$dbUser = "russell_fjb_user"
$dbPassword = "EZsDNwLGpIPKi4E"
$dbContainer = "farmer-johns-botanicals-db"
$backupDir = "db-backup"

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Created backup directory: $backupDir"
}

# Generate timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "$backupDir\$dbName`_$timestamp.sql"

Write-Host "Starting database backup..."
Write-Host "Database: $dbName"
Write-Host "Container: $dbContainer"
Write-Host "Backup file: $backupFile"

# Check if Docker container is running
$containerRunning = docker ps --filter "name=$dbContainer" --format "{{.Names}}"
if (-not $containerRunning) {
    Write-Host "Error: Docker container '$dbContainer' is not running!" -ForegroundColor Red
    Write-Host "Please start the container with: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Function to sanitize secrets from backup file
function Remove-SecretsFromBackup {
    param(
        [string]$FilePath
    )
    
    Write-Host "Sanitizing secrets from backup file..." -ForegroundColor Yellow
    
    $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
    
    # Remove Stripe secret keys (sk_live_... or sk_test_... followed by alphanumeric characters)
    $content = $content -replace '(sk_(?:live|test)_[a-zA-Z0-9]{32,})', '[REDACTED_STRIPE_SECRET_KEY]'
    
    # Remove Stripe publishable keys (pk_live_... or pk_test_... followed by alphanumeric characters)
    $content = $content -replace '(pk_(?:live|test)_[a-zA-Z0-9]{32,})', '[REDACTED_STRIPE_PUBLISHABLE_KEY]'
    
    # Remove Stripe restricted keys (rk_live_... or rk_test_... followed by alphanumeric characters)
    $content = $content -replace '(rk_(?:live|test)_[a-zA-Z0-9]{32,})', '[REDACTED_STRIPE_RESTRICTED_KEY]'
    
    # Remove Stripe webhook secrets (whsec_... followed by alphanumeric characters)
    $content = $content -replace '(whsec_[a-zA-Z0-9]{32,})', '[REDACTED_STRIPE_WEBHOOK_SECRET]'
    
    # Save the sanitized content
    Set-Content -Path $FilePath -Value $content -Encoding UTF8 -NoNewline
    
    Write-Host "Secrets sanitized successfully!" -ForegroundColor Green
}

# Run mysqldump inside the Docker container
try {
    $mysqldumpCmd = "mysqldump -u$dbUser -p$dbPassword --single-transaction --quick --lock-tables=false --no-tablespaces $dbName"
    docker exec $dbContainer bash -c $mysqldumpCmd | Out-File -FilePath $backupFile -Encoding utf8
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile) -and (Get-Item $backupFile).Length -gt 0) {
        # Sanitize secrets from the backup file
        Remove-SecretsFromBackup -FilePath $backupFile
        
        $fileSize = (Get-Item $backupFile).Length / 1MB
        Write-Host "Backup completed successfully!" -ForegroundColor Green
        Write-Host "File size: $([math]::Round($fileSize, 2)) MB"
        Write-Host "Location: $backupFile"
    } else {
        Write-Host "Backup failed!" -ForegroundColor Red
        if (Test-Path $backupFile) {
            Remove-Item $backupFile
        }
        exit 1
    }
} catch {
    Write-Host "Error running backup: $_" -ForegroundColor Red
    if (Test-Path $backupFile) {
        Remove-Item $backupFile
    }
    exit 1
}


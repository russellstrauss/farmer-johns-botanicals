# Database Backup Script
# Backs up the WordPress database to db-backup folder with timestamp

$dbName = "fjb_db"
$dbUser = "russell_fjb_user"
$dbPassword = "EZsDNwLGpIPKi4E"
$dbHost = "localhost"
$dbPort = "3306"
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
Write-Host "Backup file: $backupFile"

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

# Run mysqldump (assuming MySQL client is installed on Windows)
# If mysqldump is not in PATH, you may need to use the full path
try {
    $env:MYSQL_PWD = $dbPassword
    mysqldump -h $dbHost -P $dbPort -u $dbUser --single-transaction --quick --lock-tables=false $dbName > $backupFile
    
    if ($LASTEXITCODE -eq 0) {
        # Sanitize secrets from the backup file
        Remove-SecretsFromBackup -FilePath $backupFile
        
        $fileSize = (Get-Item $backupFile).Length / 1MB
        Write-Host "Backup completed successfully!" -ForegroundColor Green
        Write-Host "File size: $([math]::Round($fileSize, 2)) MB"
        Write-Host "Location: $backupFile"
    } else {
        Write-Host "Backup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        if (Test-Path $backupFile) {
            Remove-Item $backupFile
        }
        exit 1
    }
} catch {
    Write-Host "Error running mysqldump: $_" -ForegroundColor Red
    Write-Host "Make sure MySQL client tools are installed and mysqldump is in your PATH" -ForegroundColor Yellow
    exit 1
} finally {
    $env:MYSQL_PWD = $null
}


# PowerShell script to fix broken product images
# This script will use WP-CLI if available, otherwise use the PHP fix script
# Usage: .\fix-broken-images.ps1

param(
    [switch]$DiagnoseOnly
)

$ContainerName = "farmer-johns-botanicals-db"
$WpContainerName = "farmer-johns-botanicals-wp"

Write-Host "Broken Product Images Fix Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if we should only diagnose
if ($DiagnoseOnly) {
    Write-Host "Running diagnostic only..." -ForegroundColor Yellow
    Write-Host ""
    
    if (Test-Path "diagnose-broken-images.php") {
        Write-Host "Running PHP diagnostic script..." -ForegroundColor Yellow
        php diagnose-broken-images.php
    } else {
        Write-Host "ERROR: diagnose-broken-images.php not found!" -ForegroundColor Red
        exit 1
    }
    exit 0
}

# Try to use WP-CLI first (best method)
Write-Host "Checking for WP-CLI..." -ForegroundColor Yellow

# Check if WP-CLI is available in the container
$wpCliAvailable = $false
try {
    $wpCheck = docker exec $WpContainerName wp --info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $wpCliAvailable = $true
        Write-Host "WP-CLI is available!" -ForegroundColor Green
    }
} catch {
    Write-Host "WP-CLI not available in container, will use PHP script instead" -ForegroundColor Yellow
}

if ($wpCliAvailable) {
    Write-Host ""
    Write-Host "Using WP-CLI to fix URLs (this properly handles serialized data)..." -ForegroundColor Yellow
    Write-Host ""
    
    $oldUrls = @(
        "http://hammerheadsilver.local",
        "http://hammerheadsilver.com",
        "https://hammerheadsilver.com"
    )
    $newUrl = "http://local.farmerjohnsbotanicals.com:8080"
    
    foreach ($oldUrl in $oldUrls) {
        Write-Host "Replacing: $oldUrl -> $newUrl" -ForegroundColor Cyan
        docker exec $WpContainerName wp search-replace $oldUrl $newUrl --all-tables --allow-root 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Success" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ Warning: Some replacements may have failed" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Clearing WordPress cache..." -ForegroundColor Yellow
    docker exec $WpContainerName wp cache flush --allow-root 2>&1 | Out-Null
    
    Write-Host ""
    Write-Host "URL replacement complete!" -ForegroundColor Green
} else {
    # Fall back to PHP script
    Write-Host ""
    Write-Host "Using PHP fix script..." -ForegroundColor Yellow
    Write-Host ""
    
    if (Test-Path "fix-broken-images.php") {
        php fix-broken-images.php
    } else {
        Write-Host "ERROR: fix-broken-images.php not found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please ensure the fix script exists, or install WP-CLI in your container." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Check your product images in the WordPress admin" -ForegroundColor White
Write-Host "2. If images are still broken, you may need to:" -ForegroundColor White
Write-Host "   - Regenerate thumbnails (use 'Regenerate Thumbnails' plugin)" -ForegroundColor White
Write-Host "   - Clear any caching plugins" -ForegroundColor White
Write-Host "   - Verify uploads directory permissions" -ForegroundColor White
Write-Host ""


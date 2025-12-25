# PowerShell setup script for static site migration
# Run this after exporting products

Write-Host "Setting up static e-commerce site (dist directory)..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if PHP is installed (for product export)
$phpAvailable = $false
try {
    $phpVersion = php --version
    $phpAvailable = $true
    Write-Host "PHP is available" -ForegroundColor Green
} catch {
    Write-Host "Warning: PHP is not installed. You'll need to export products manually." -ForegroundColor Yellow
}

# Export products
Write-Host "`nStep 1: Exporting products from WordPress..." -ForegroundColor Cyan
if ($phpAvailable) {
    php scripts/export-products.php
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Products exported successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Error exporting products" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠ Skipping product export (PHP not available)" -ForegroundColor Yellow
}

# Copy assets
Write-Host "`nStep 2: Copying theme assets..." -ForegroundColor Cyan
node scripts/copy-assets.js
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Assets copied successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Error copying assets" -ForegroundColor Red
    exit 1
}

# Generate product pages
Write-Host "`nStep 3: Generating product pages..." -ForegroundColor Cyan
node scripts/generate-pages.js
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Product pages generated successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Error generating product pages" -ForegroundColor Red
    exit 1
}

Write-Host "`nSetup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Review dist/data/products.json"
Write-Host "2. Update dist/wrangler.toml with your Cloudflare settings"
Write-Host "3. Set up Cloudflare D1 database (see README.md)"
Write-Host "4. Configure Stripe and set environment variables"
Write-Host "5. Deploy to Cloudflare Pages"


#!/bin/bash
# Setup script for static site migration
# Run this after exporting products

echo "Setting up static e-commerce site (dist directory)..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PHP is installed (for product export)
if ! command -v php &> /dev/null; then
    echo "Warning: PHP is not installed. You'll need to export products manually."
fi

# Export products
echo "Step 1: Exporting products from WordPress..."
if command -v php &> /dev/null; then
    php scripts/export-products.php
    if [ $? -eq 0 ]; then
        echo "✓ Products exported successfully"
    else
        echo "✗ Error exporting products"
        exit 1
    fi
else
    echo "⚠ Skipping product export (PHP not available)"
fi

# Copy assets
echo "Step 2: Copying theme assets..."
node scripts/copy-assets.js
if [ $? -eq 0 ]; then
    echo "✓ Assets copied successfully"
else
    echo "✗ Error copying assets"
    exit 1
fi

# Generate product pages
echo "Step 3: Generating product pages..."
node scripts/generate-pages.js
if [ $? -eq 0 ]; then
    echo "✓ Product pages generated successfully"
else
    echo "✗ Error generating product pages"
    exit 1
fi

echo ""
echo "Setup complete! Next steps:"
echo "1. Review dist/data/products.json"
echo "2. Update dist/wrangler.toml with your Cloudflare settings"
echo "3. Set up Cloudflare D1 database (see README.md)"
echo "4. Configure Stripe and set environment variables"
echo "5. Deploy to Cloudflare Pages"


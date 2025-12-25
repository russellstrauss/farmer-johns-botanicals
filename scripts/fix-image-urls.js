/**
 * Fix Image URLs in products.json
 * Converts WordPress URLs to relative paths or CDN URLs
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../dist/data/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Function to convert WordPress URL to relative path
function convertImageUrl(url) {
    if (!url) return null;
    
    // Extract filename from WordPress URL
    // Example: http://local.farmerjohnsbotanicals.com:8080/wp-content/uploads/2018/07/DSC_4978-scaled.jpg
    const match = url.match(/wp-content\/uploads\/(.+)$/);
    if (match) {
        // Use relative path to products images
        return `/assets/images/products/${match[1]}`;
    }
    
    // If it's already a relative path, return as is
    if (url.startsWith('/')) {
        return url;
    }
    
    // If it's an absolute URL from the same domain, convert to relative
    if (url.includes('farmerjohnsbotanicals.com')) {
        const pathMatch = url.match(/farmerjohnsbotanicals\.com[:\d]*\/(.+)$/);
        if (pathMatch) {
            return `/${pathMatch[1]}`;
        }
    }
    
    return url;
}

// Update image URLs in all products
let updated = 0;
products.forEach(product => {
    if (product.images && product.images.length > 0) {
        product.images = product.images.map(img => {
            const newUrl = convertImageUrl(img);
            if (newUrl !== img) {
                updated++;
            }
            return newUrl;
        });
    }
});

// Save updated products
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');

console.log(`Updated ${updated} image URLs in products.json`);
console.log('Note: Make sure product images are copied to dist/assets/images/products/');


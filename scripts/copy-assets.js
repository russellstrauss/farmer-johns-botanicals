/**
 * Copy Theme Assets to Static Site
 * Copies CSS, JS, and images from WordPress theme to static site
 */

const fs = require('fs');
const path = require('path');

const themeDir = path.join(__dirname, '../wp-content/themes/billie');
const staticDir = path.join(__dirname, '../dist');

// Directories to copy
const copyMap = [
    {
        from: path.join(themeDir, 'assets/img'),
        to: path.join(staticDir, 'assets/images'),
        description: 'Theme images'
    },
    {
        from: path.join(themeDir, 'assets/js'),
        to: path.join(staticDir, 'assets/js/theme'),
        description: 'Theme JavaScript (for reference, may need adaptation)'
    }
];

// Files to copy individually
const filesToCopy = [
    {
        from: path.join(themeDir, 'style.css'),
        to: path.join(staticDir, 'assets/css/style.css'),
        description: 'Main stylesheet'
    }
];

/**
 * Copy directory recursively
 */
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Copy file
 */
function copyFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
}

// Copy directories
console.log('Copying theme assets...');
copyMap.forEach(({ from, to, description }) => {
    if (fs.existsSync(from)) {
        console.log(`Copying ${description}...`);
        copyDir(from, to);
        console.log(`  ✓ Copied to ${to}`);
    } else {
        console.log(`  ⚠ ${description} not found at ${from}`);
    }
});

// Copy individual files
filesToCopy.forEach(({ from, to, description }) => {
    if (fs.existsSync(from)) {
        console.log(`Copying ${description}...`);
        copyFile(from, to);
        console.log(`  ✓ Copied to ${to}`);
    } else {
        console.log(`  ⚠ ${description} not found at ${from}`);
    }
});

// Copy product images from uploads
const uploadsDir = path.join(__dirname, '../wp-content/uploads');
const productsImagesDir = path.join(staticDir, 'assets/images/products');

if (fs.existsSync(uploadsDir)) {
    console.log('Copying product images from uploads...');
    // Note: This is a basic copy - you may want to filter for product images only
    // For now, we'll copy the entire uploads directory structure
    try {
        copyDir(uploadsDir, productsImagesDir);
        console.log(`  ✓ Copied uploads to ${productsImagesDir}`);
    } catch (error) {
        console.log(`  ⚠ Error copying uploads: ${error.message}`);
        console.log('  Note: Product images will be referenced from original URLs or need manual copying');
    }
}

console.log('\nAsset copying complete!');
console.log('\nNote: You may need to:');
console.log('1. Update image paths in HTML/CSS if they reference WordPress URLs');
console.log('2. Compile SASS to CSS if using SASS files');
console.log('3. Update JavaScript to work without WordPress dependencies');


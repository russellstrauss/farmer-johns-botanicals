# Images Directory

This directory should contain all static images for the site.

## Required Files

- `logo.png` - Site logo (should be placed here)

## Product Images

Product images should be placed in subdirectories matching the structure in `products.json`.

For example:
- `/assets/images/products/2018/07/DSC_4978-scaled.jpg`

## Copying Images

Run the setup script to copy images from the dist folder:
```bash
npm run copy-assets
```

Or manually copy from `dist/assets/images/` to `public/assets/images/`.

## Logo

If you don't have a logo file, you can:
1. Add your logo as `logo.png` in this directory
2. Or the site will fall back to a text logo if the image is missing



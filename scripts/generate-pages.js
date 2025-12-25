/**
 * Generate Static Product Pages
 * Reads products.json and generates individual HTML pages for each product
 */

const fs = require('fs');
const path = require('path');

// Load products data
const productsPath = path.join(__dirname, '../dist/data/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Template for product page
const productPageTemplate = (product) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${product.short_description || product.name}">
    <link rel="stylesheet" href="/assets/css/style.css">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,500,600" rel="stylesheet">
    <title>${product.name} - Farmer John's Botanicals</title>
</head>
<body>
    <div id="page" class="hfeed site">
        <a class="skip-link screen-reader-text" href="#content">Skip to content</a>
        <header id="masthead" class="site-header" role="banner">
            <nav id="site-navigation" class="main-navigation" role="navigation">
                <ul class="menu">
                    <li><a href="/">Home</a></li>
                    <li><a href="/shop.html">Shop</a></li>
                    <li><a href="/about.html">About</a></li>
                </ul>
                <button class="menu-toggle hamburger hamburger--squeeze" type="button">
                    <span class="hamburger-box">
                        <span class="hamburger-inner"></span>
                    </span>
                </button>
            </nav>
            <div class="site-branding">
                <a href="/">
                    <img id="site-logo" src="/assets/images/logo.png" alt="Farmer John's Botanicals Logo" />
                </a>
            </div>
            <div class="fjb-checkout">
                <a href="/cart.html" class="cart-link">
                    <span>checkout <span class="cart-count"></span></span>
                    <div class="bling-shark-container">
                        <div class="bling-shark"></div>
                        <div class="bling-shark-hover"></div>
                    </div>
                </a>
            </div>
        </header>
        <div class="site-content">
            <div id="primary" class="content-area">
                <main id="main" class="site-main" role="main">
                    <div class="product-detail">
                        <div class="product-images">
                            ${product.images && product.images.length > 0 ? `
                                <div class="product-gallery">
                                    ${product.images.map((img, idx) => `
                                        <img src="${img}" alt="${product.name} ${idx + 1}" class="${idx === 0 ? 'main-image' : 'gallery-image'}" />
                                    `).join('')}
                                </div>
                            ` : '<img src="/assets/images/placeholder.jpg" alt="' + product.name + '" />'}
                        </div>
                        <div class="product-info">
                            <h1>${product.name}</h1>
                            <div class="product-price">
                                ${product.sale_price ? `
                                    <span class="sale-price">${formatPrice(product.sale_price)}</span>
                                    <span class="regular-price">${formatPrice(product.regular_price)}</span>
                                ` : `<span class="price">${formatPrice(product.price)}</span>`}
                            </div>
                            ${product.short_description ? `<div class="product-short-description">${product.short_description}</div>` : ''}
                            ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
                            ${product.sku ? `<div class="product-sku">SKU: ${product.sku}</div>` : ''}
                            ${product.in_stock ? `
                                <div class="product-stock in-stock">In Stock</div>
                            ` : `
                                <div class="product-stock out-of-stock">Out of Stock</div>
                            `}
                            ${product.variations && product.variations.length > 0 ? `
                                <div class="product-variations">
                                    <label>Select Variation:</label>
                                    <select id="variation-select">
                                        ${product.variations.map((variation, idx) => `
                                            <option value="${idx}" data-price="${variation.price}">
                                                ${Object.values(variation.attributes || {}).join(' - ')} - ${formatPrice(variation.price)}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                            ` : ''}
                            <div class="product-actions">
                                <input type="number" id="quantity" min="1" value="1" />
                                <button class="add-to-cart-button" data-product-id="${product.id}">Add to Cart</button>
                            </div>
                            ${product.categories && product.categories.length > 0 ? `
                                <div class="product-categories">
                                    Categories: ${product.categories.map(cat => `<a href="/shop.html?category=${cat.slug}">${cat.name}</a>`).join(', ')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </main>
            </div>
        </div>
        <footer id="colophon" class="site-footer" role="contentinfo">
            <h2 class="screen-reader-text">Footer Content</h2>
            <div class="widget-area" role="complementary">
                <!-- Footer widgets can be added here -->
            </div>
        </footer>
    </div>
    <script src="/assets/js/cart.js"></script>
    <script src="/assets/js/products.js"></script>
    <script src="/assets/js/stripe.js"></script>
    <script>
        // Product data embedded in page
        const productData = ${JSON.stringify(product)};
        
        // Add to cart functionality
        document.querySelector('.add-to-cart-button').addEventListener('click', function() {
            const quantity = parseInt(document.getElementById('quantity').value) || 1;
            const variationSelect = document.getElementById('variation-select');
            let variation = null;
            
            if (variationSelect) {
                const selectedIndex = parseInt(variationSelect.value);
                variation = productData.variations[selectedIndex];
            }
            
            cart.addItem(productData, quantity, variation);
            alert('Product added to cart!');
        });
        
        // Update price if variation selected
        const variationSelect = document.getElementById('variation-select');
        if (variationSelect) {
            variationSelect.addEventListener('change', function() {
                const selectedIndex = parseInt(this.value);
                const variation = productData.variations[selectedIndex];
                const priceElement = document.querySelector('.product-price');
                if (priceElement && variation) {
                    priceElement.innerHTML = '<span class="price">' + formatPrice(variation.price) + '</span>';
                }
            });
        }
        
        function formatPrice(price) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(price);
        }
    </script>
</body>
</html>`;

// Format price helper
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Create product directory if it doesn't exist
const productDir = path.join(__dirname, '../dist/product');
if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, { recursive: true });
}

// Generate pages for each product
let generated = 0;
products.forEach(product => {
    const html = productPageTemplate(product);
    const filePath = path.join(productDir, `${product.slug}.html`);
    fs.writeFileSync(filePath, html, 'utf8');
    generated++;
});

console.log(`Successfully generated ${generated} product pages in ${productDir}`);


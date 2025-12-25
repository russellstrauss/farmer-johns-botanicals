# WordPress to Static E-commerce Migration Guide

This guide walks you through migrating your WordPress/WooCommerce site to a fully static e-commerce site hosted on Cloudflare Pages.

## Quick Start

1. **Export Products**
   ```bash
   php scripts/export-products.php
   ```

2. **Copy Assets**
   ```bash
   node scripts/copy-assets.js
   ```

3. **Generate Product Pages**
   ```bash
   node scripts/generate-pages.js
   ```

4. **Set Up Cloudflare**
   - Create D1 database
   - Deploy Workers
   - Set up Cloudflare Pages

5. **Configure Stripe**
   - Get API keys
   - Set up webhook
   - Add publishable key to site

## Detailed Steps

### Step 1: Export Products

The export script extracts all WooCommerce products and saves them to `static-site/data/products.json`.

**Requirements:**
- WordPress with WooCommerce installed
- PHP CLI access
- Database connection configured in `wp-config.php`

**Run:**
```bash
php scripts/export-products.php
```

**Output:**
- `static-site/data/products.json` - All product data
- `static-site/data/export-summary.json` - Export statistics

### Step 2: Copy Theme Assets

Copy CSS, JavaScript, and images from your WordPress theme to the static site.

**Run:**
```bash
node scripts/copy-assets.js
```

**What it copies:**
- Theme images (`wp-content/themes/billie/assets/img/`)
- Theme JavaScript (for reference)
- Main stylesheet (`style.css`)
- Product images from uploads (if available)

**Note:** You may need to:
- Compile SASS to CSS if using SASS
- Update image paths in HTML/CSS
- Adapt JavaScript to work without WordPress

### Step 3: Generate Product Pages

Generate individual HTML pages for each product.

**Run:**
```bash
node scripts/generate-pages.js
```

**Output:**
- Individual product pages in `static-site/product/[slug].html`

### Step 4: Set Up Cloudflare D1 Database

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Login:**
   ```bash
   wrangler login
   ```

3. **Create Database:**
   ```bash
   wrangler d1 create fjb-orders
   ```

4. **Note the database ID** from the output

5. **Update `wrangler.toml`:**
   - Replace `database_id = "your-database-id-here"` with your actual ID

6. **Create Tables:**
   ```bash
   cd static-site
   wrangler d1 execute fjb-orders --file=./database-schema.sql
   ```

### Step 5: Configure Stripe

1. **Create Stripe Account:**
   - Go to https://stripe.com
   - Create account or login
   - Get API keys from Dashboard

2. **Set Environment Variables:**
   ```bash
   wrangler secret put STRIPE_SECRET_KEY
   # Paste your Stripe secret key (starts with sk_)
   
   wrangler secret put STRIPE_WEBHOOK_SECRET
   # You'll get this after setting up the webhook
   ```

3. **Add Publishable Key to Site:**
   - Add to HTML pages as meta tag:
     ```html
     <meta name="stripe-publishable-key" content="pk_test_...">
     ```
   - Or set in JavaScript:
     ```javascript
     window.STRIPE_PUBLISHABLE_KEY = 'pk_test_...';
     ```

### Step 6: Deploy Cloudflare Workers

1. **Update `wrangler.toml`:**
   - Set your domain in `zone_name`
   - Verify database ID is correct

2. **Deploy:**
   ```bash
   cd static-site
   wrangler deploy
   ```

3. **Set Up Webhook in Stripe:**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhook`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
   - Copy the webhook signing secret
   - Set it as `STRIPE_WEBHOOK_SECRET` secret in Cloudflare

### Step 7: Deploy to Cloudflare Pages

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial static site"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Pages Project:**
   - Go to Cloudflare Dashboard > Pages
   - Click "Create a project"
   - Connect your GitHub repository
   - Configure:
     - **Build command:** (leave empty or `node scripts/generate-pages.js`)
     - **Build output directory:** `static-site`
     - **Root directory:** `/` (or set to project root)

3. **Deploy:**
   - Cloudflare will automatically deploy
   - Or trigger manual deployment

4. **Set Custom Domain:**
   - In Pages project settings
   - Add custom domain
   - Update DNS as instructed

### Step 8: Test

1. **Test Product Pages:**
   - Visit your site
   - Browse products
   - Verify images load

2. **Test Shopping Cart:**
   - Add products to cart
   - View cart page
   - Verify totals calculate correctly

3. **Test Checkout:**
   - Click "Proceed to Checkout"
   - Complete test payment in Stripe
   - Verify order is saved to D1
   - Check email confirmation (if configured)

## Troubleshooting

### Products Not Loading
- Check `products.json` exists and is valid JSON
- Verify file paths in JavaScript
- Check browser console for errors

### Stripe Checkout Not Working
- Verify publishable key is set
- Check Worker logs in Cloudflare Dashboard
- Ensure `STRIPE_SECRET_KEY` is set correctly
- Verify webhook endpoint is accessible

### Orders Not Saving
- Check D1 database is created and tables exist
- Verify database ID in `wrangler.toml`
- Check Worker logs for errors
- Ensure webhook secret matches Stripe

### Images Not Displaying
- Verify image paths are correct
- Check if images were copied to `static-site/assets/images/`
- Update image URLs in `products.json` if needed
- Consider using CDN or absolute URLs

## Maintenance

### Updating Products

1. Update `static-site/data/products.json`
2. Run `node scripts/generate-pages.js`
3. Commit and push to trigger deployment

### Adding New Products

1. Add product to WordPress (temporary, for export)
2. Run export script
3. Generate pages
4. Deploy

Or manually add to `products.json` and regenerate pages.

## Cost Breakdown

- **Cloudflare Pages:** Free (unlimited bandwidth)
- **Cloudflare Workers:** Free (100,000 requests/day)
- **Cloudflare D1:** Free (5GB storage, 5M reads/month)
- **Stripe:** 2.9% + $0.30 per transaction
- **Total Monthly:** $0 (only transaction fees)

## Support

For issues:
1. Check Cloudflare Worker logs
2. Check browser console
3. Verify all environment variables are set
4. Review Stripe webhook logs

## Next Steps

- Set up email notifications (Mailgun/SendGrid)
- Create admin dashboard for order management
- Add product search functionality
- Implement inventory management
- Add customer account system (optional)


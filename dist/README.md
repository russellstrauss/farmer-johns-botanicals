# Farmer John's Botanicals - Static E-commerce Site

This is a fully static e-commerce site hosted on Cloudflare Pages with Stripe Checkout integration.

## Architecture

- **Frontend**: Static HTML/CSS/JS on Cloudflare Pages (free)
- **Payments**: Stripe Checkout (transaction fees only)
- **Backend**: Cloudflare Workers (free tier) for webhook handling
- **Database**: Cloudflare D1 (free tier) for order storage
- **Total Cost**: $0/month (only Stripe transaction fees)

## Setup Instructions

### 1. Export Products from WordPress

Run the export script to extract products from your WordPress/WooCommerce installation:

```bash
php scripts/export-products.php
```

This will create `dist/data/products.json` with all your product data.

### 2. Generate Product Pages

After exporting products, generate static HTML pages for each product:

```bash
node scripts/generate-pages.js
```

This creates individual product pages in `dist/product/` directory.

### 3. Set Up Cloudflare D1 Database

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Create D1 database:
   ```bash
   wrangler d1 create fjb-orders
   ```

4. Note the database ID from the output and update `wrangler.toml` with the database ID.

5. Create database tables:
   ```bash
   wrangler d1 execute fjb-orders --file=./database-schema.sql
   ```

### 4. Set Up Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Set up webhook endpoint (after deploying workers):
   - URL: `https://your-domain.com/api/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`

### 5. Configure Environment Variables

Set secrets in Cloudflare:

```bash
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
# Optional: for email notifications
wrangler secret put MAILGUN_API_KEY
wrangler secret put MAILGUN_DOMAIN
```

Or set them in Cloudflare Dashboard under Workers & Pages > Your Worker > Settings > Variables.

### 6. Deploy Cloudflare Workers

Deploy the workers:

```bash
cd dist
wrangler deploy
```

### 7. Deploy to Cloudflare Pages

1. Push your code to a GitHub repository
2. Go to Cloudflare Dashboard > Pages
3. Create a new project
4. Connect your GitHub repository
5. Set build settings:
   - Build command: (none, or `node scripts/generate-pages.js` if you want to generate pages on build)
   - Build output directory: `dist`
6. Deploy

### 8. Configure Custom Domain

1. In Cloudflare Pages, go to your project settings
2. Add your custom domain
3. Update DNS records as instructed

### 9. Update Configuration

Update the following files with your actual values:

- `wrangler.toml`: Update `zone_name` and `database_id`
- `dist/assets/js/stripe.js`: Add Stripe publishable key (or use meta tag)
- Add Stripe publishable key to HTML pages:
  ```html
  <meta name="stripe-publishable-key" content="pk_test_...">
  ```

## File Structure

```
dist/
├── index.html              # Homepage
├── shop.html              # Product listing
├── cart.html              # Shopping cart
├── success.html           # Order confirmation
├── product/               # Individual product pages (generated)
├── assets/
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── images/           # Images
├── data/
│   └── products.json     # Product data (exported from WordPress)
├── _functions/           # Cloudflare Workers
│   ├── create-checkout.js
│   └── webhook.js
└── wrangler.toml         # Workers configuration
```

## Features

- ✅ Static product pages
- ✅ Shopping cart (localStorage)
- ✅ Stripe Checkout integration
- ✅ Order processing via webhooks
- ✅ Order storage in D1 database
- ✅ Email notifications (optional)
- ✅ Product filtering by category/tag
- ✅ Responsive design

## Limitations

- No WordPress admin - update products via JSON file
- No customer accounts - users can't view order history
- Manual product updates - regenerate pages when products change
- Basic inventory tracking (can be enhanced)

## Development

### Local Testing

You can test the static site locally using a simple HTTP server:

```bash
cd dist
python -m http.server 8000
# or
npx serve .
```

Note: Workers and Stripe integration require Cloudflare deployment.

### Updating Products

1. Update `dist/data/products.json`
2. Run `node scripts/generate-pages.js` to regenerate product pages
3. Commit and push to trigger Cloudflare Pages deployment

## Support

For issues or questions, refer to:
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)


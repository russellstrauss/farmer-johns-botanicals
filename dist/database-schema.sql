-- Cloudflare D1 Database Schema for Orders
-- Run this to create the database tables

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  customer_email TEXT,
  customer_name TEXT,
  total_amount INTEGER, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT, -- pending, completed, failed
  shipping_address TEXT, -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  product_sku TEXT,
  product_name TEXT,
  quantity INTEGER,
  price INTEGER, -- in cents
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS inventory (
  sku TEXT PRIMARY KEY,
  stock_quantity INTEGER,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items(product_sku);


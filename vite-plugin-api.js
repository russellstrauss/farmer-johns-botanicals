import Stripe from 'stripe'
import { loadEnv } from 'vite'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs/promises'
import { generateOrderEmailHtml, generateCustomerConfirmationEmailHtml } from './functions/utils/email.js'
import { detectStripeKeyMode, getKeyConfigurationGuide } from './functions/utils/stripe-validation.js'

/**
 * Vite plugin to add API middleware for local development
 * Handles /api/create-checkout route for Stripe checkout sessions
 * Handles /api/save-products and /api/save-pages for admin content management
 */
export function apiMiddleware() {
  // Get the root directory (project root)
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  
  return {
    name: 'api-middleware',
    configureServer(server) {
      // Load .env file using dotenv for server-side access
      // Load it here to ensure it's fresh when server configures
      const envPath = resolve(server.config.root || __dirname, '.env')
      const dotenvResult = dotenv.config({ path: envPath })
      
      if (dotenvResult.error) {
        console.warn('[dotenv] Failed to load .env file:', dotenvResult.error.message)
        console.warn('[dotenv] Attempted path:', envPath)
      } else if (dotenvResult.parsed) {
        console.log('[dotenv] Loaded .env file successfully')
        // Merge parsed env vars into process.env
        Object.assign(process.env, dotenvResult.parsed)
      }
      
      // Also load env vars using Vite's loadEnv as a fallback
      const viteEnv = loadEnv(server.config.mode || 'development', server.config.root || __dirname, '')
      
      server.middlewares.use('/api/create-checkout', async (req, res, next) => {
        // Only handle POST requests
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Method not allowed' }))
          return
        }

        try {
          // Get Stripe secret key from environment
          // Check both prefixed and non-prefixed versions, from both dotenv and Vite loadEnv
          // Also check server.config.env which Vite might have loaded
          const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 
                                   process.env.VITE_STRIPE_SECRET_KEY || 
                                   viteEnv.STRIPE_SECRET_KEY || 
                                   viteEnv.VITE_STRIPE_SECRET_KEY ||
                                   server.config.env?.STRIPE_SECRET_KEY ||
                                   server.config.env?.VITE_STRIPE_SECRET_KEY
          
          if (!stripeSecretKey) {
            // Debug: Log what we found (without exposing the actual key)
            console.error('[Stripe] Secret key not found. Checked:')
            console.error('  - process.env.STRIPE_SECRET_KEY:', !!process.env.STRIPE_SECRET_KEY)
            console.error('  - process.env.VITE_STRIPE_SECRET_KEY:', !!process.env.VITE_STRIPE_SECRET_KEY)
            console.error('  - viteEnv.STRIPE_SECRET_KEY:', !!viteEnv.STRIPE_SECRET_KEY)
            console.error('  - viteEnv.VITE_STRIPE_SECRET_KEY:', !!viteEnv.VITE_STRIPE_SECRET_KEY)
            console.error('  - server.config.root:', server.config.root)
            console.error('  - env file path:', resolve(server.config.root || __dirname, '.env'))
            
            // Check if .env file exists
            const envPath = resolve(server.config.root || __dirname, '.env')
            try {
              await fs.access(envPath)
              console.error('  - .env file exists but STRIPE_SECRET_KEY is not set')
            } catch {
              console.error('  - .env file does not exist at:', envPath)
              console.error('  - Please create a .env file in the project root (see .env.example for template)')
            }
            
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ 
              message: 'Stripe secret key not configured. Please create a .env file in the project root with STRIPE_SECRET_KEY or VITE_STRIPE_SECRET_KEY. See .env.example for a template.'
            }))
            return
          }

          // Validate and log key mode
          const keyMode = detectStripeKeyMode(stripeSecretKey)
          const envMode = server.config.mode || 'development'
          const configGuide = getKeyConfigurationGuide(envMode === 'production' ? 'production' : 'development')
          
          if (keyMode === 'unknown') {
            console.warn('[Stripe] Warning: Unable to detect key mode. Key should start with sk_test_ or sk_live_')
          } else {
            console.log(`[Stripe] Using ${keyMode.toUpperCase()} mode secret key`)
            
            // Warn if key mode doesn't match environment expectations
            if (envMode === 'production' && keyMode === 'test') {
              console.warn('[Stripe] ⚠️  WARNING: Production environment detected but using TEST key!')
              console.warn('[Stripe] For production, use a LIVE key (sk_live_...) from your Stripe Dashboard.')
            } else if (envMode !== 'production' && keyMode === 'live') {
              console.warn('[Stripe] ⚠️  WARNING: Development environment detected but using LIVE key!')
              console.warn('[Stripe] Using live keys in development can process real payments. Use TEST keys (sk_test_...) for development.')
              console.warn('[Stripe] IMPORTANT: Test cards (e.g., 4242 4242 4242 4242) will be REJECTED with live keys.')
            }
          }

          const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2024-06-20'
          })

          // Read request body
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })

          req.on('end', async () => {
            try {
              if (!body) {
                throw new Error('Request body is empty')
              }

              let requestData
              try {
                requestData = JSON.parse(body)
              } catch (parseError) {
                throw new Error(`Invalid JSON in request body: ${parseError.message}`)
              }

              const { line_items, customer_email, customer_name, shipping_address, shipping_name, success_url, cancel_url, metadata } = requestData

              // Get origin from request headers
              const origin = req.headers.origin || req.headers.referer || 'http://localhost:5173'

              // Calculate totals from line items
              const subtotal = line_items.reduce((sum, item) => {
                return sum + (item.price_data.unit_amount * item.quantity) / 100
              }, 0)

              // Create order object (will be saved as pending)
              const orders = await loadOrders()
              const orderNumber = generateOrderNumber(orders)
              const now = new Date().toISOString()

              const order = {
                id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                stripeSessionId: null, // Will be set after session creation
                stripePaymentIntentId: null,
                orderNumber: orderNumber,
                status: 'pending',
                createdAt: now,
                updatedAt: now,
                customer: {
                  name: customer_name || metadata?.customer_name || '',
                  email: customer_email || metadata?.customer_email || '',
                  phone: metadata?.customer_phone || ''
                },
                shipping: {
                  name: shipping_name || customer_name || metadata?.customer_name || '',
                  address: shipping_address || (metadata?.shipping_address ? JSON.parse(metadata.shipping_address) : {
                    line1: '',
                    line2: null,
                    city: '',
                    state: '',
                    postal_code: '',
                    country: 'US'
                  })
                },
                items: line_items.map(item => ({
                  name: item.price_data.product_data.name,
                  sku: metadata?.cart_items ? JSON.parse(metadata.cart_items).find(ci => ci.name === item.price_data.product_data.name)?.sku || 'N/A' : 'N/A',
                  quantity: item.quantity,
                  price: item.price_data.unit_amount / 100,
                  total: (item.price_data.unit_amount * item.quantity) / 100
                })),
                totals: {
                  subtotal: subtotal,
                  shipping: 0, // Stripe will calculate shipping if configured
                  tax: 0, // Stripe will calculate tax if configured
                  total: subtotal
                },
                currency: line_items[0]?.price_data?.currency || 'usd',
                notes: metadata?.order_notes || ''
              }

              // Create Stripe Checkout session (before saving order, so we can get session ID)
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items,
                mode: 'payment',
                success_url: success_url || `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancel_url || `${origin}/cart`,
                customer_email: customer_email || undefined,
                metadata: metadata || {}
              })

              // Update order with session ID and save
              order.stripeSessionId = session.id
              orders.push(order)
              await saveOrders(orders)

              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({
                url: session.url,
                sessionId: session.id
              }))
            } catch (error) {
              console.error('Stripe API error:', error)
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({
                message: error.message || 'Failed to create checkout session'
              }))
            }
          })
        } catch (error) {
          console.error('API middleware error:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            message: error.message || 'Internal server error'
          }))
        }
      })

      // Helper function to read request body
      const readBody = (req) => {
        return new Promise((resolve, reject) => {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              resolve(body ? JSON.parse(body) : {})
            } catch (error) {
              reject(new Error(`Invalid JSON: ${error.message}`))
            }
          })
          req.on('error', reject)
        })
      }

      // Helper function to verify admin authentication
      const verifyAdminAuth = (req) => {
        // Simple token check - in production, use proper JWT validation
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return false
        }
        const token = authHeader.substring(7)
        // Check if token exists (we can't access localStorage server-side,
        // so we'll do a simple check - in production, validate against a session store)
        // For now, we'll accept any Bearer token as the client-side auth handles validation
        return token && token.length > 0
      }

      // Helper function to load orders from JSON file
      const loadOrders = async () => {
        const projectRoot = server.config.root || __dirname
        const ordersPath = resolve(projectRoot, 'public', 'data', 'orders.json')
        try {
          const data = await fs.readFile(ordersPath, 'utf8')
          return JSON.parse(data)
        } catch (error) {
          if (error.code === 'ENOENT') {
            // File doesn't exist, return empty array
            return []
          }
          throw error
        }
      }

      // Helper function to save orders to JSON file
      const saveOrders = async (orders) => {
        const projectRoot = server.config.root || __dirname
        const ordersPath = resolve(projectRoot, 'public', 'data', 'orders.json')
        const dataDir = resolve(projectRoot, 'public', 'data')
        
        // Ensure directory exists
        await fs.mkdir(dataDir, { recursive: true })
        
        const dataStr = JSON.stringify(orders, null, 2)
        await fs.writeFile(ordersPath, dataStr, 'utf8')
      }

      // Helper function to generate order number
      const generateOrderNumber = (orders) => {
        const year = new Date().getFullYear()
        const yearOrders = orders.filter(o => {
          const orderYear = new Date(o.createdAt).getFullYear()
          return orderYear === year
        })
        const nextNum = (yearOrders.length + 1).toString().padStart(3, '0')
        return `ORD-${year}-${nextNum}`
      }

      // Helper function to send email via Resend API (local dev)
      const sendOrderEmail = async (order) => {
        console.log('[sendOrderEmail] Called for order:', order.orderNumber)
        // Check multiple sources for environment variables (same pattern as Stripe config)
        const adminEmail = process.env.ADMIN_EMAIL || 
                          process.env.VITE_ADMIN_EMAIL || 
                          viteEnv.ADMIN_EMAIL || 
                          viteEnv.VITE_ADMIN_EMAIL ||
                          server.config.env?.ADMIN_EMAIL ||
                          server.config.env?.VITE_ADMIN_EMAIL
        
        const fromEmail = process.env.SMTP_FROM || 
                         process.env.VITE_SMTP_FROM || 
                         viteEnv.SMTP_FROM || 
                         viteEnv.VITE_SMTP_FROM ||
                         server.config.env?.SMTP_FROM ||
                         server.config.env?.VITE_SMTP_FROM ||
                         'noreply@example.com'
        
        const resendApiKey = process.env.RESEND_API_KEY || 
                            process.env.VITE_RESEND_API_KEY || 
                            viteEnv.RESEND_API_KEY || 
                            viteEnv.VITE_RESEND_API_KEY ||
                            server.config.env?.RESEND_API_KEY ||
                            server.config.env?.VITE_RESEND_API_KEY

        if (!adminEmail) {
          console.error('[Email] ADMIN_EMAIL not configured. Checked:')
          console.error('  - process.env.ADMIN_EMAIL:', !!process.env.ADMIN_EMAIL)
          console.error('  - process.env.VITE_ADMIN_EMAIL:', !!process.env.VITE_ADMIN_EMAIL)
          console.error('  - viteEnv.ADMIN_EMAIL:', !!viteEnv.ADMIN_EMAIL)
          console.error('  - viteEnv.VITE_ADMIN_EMAIL:', !!viteEnv.VITE_ADMIN_EMAIL)
          return { success: false, error: 'ADMIN_EMAIL not configured' }
        }

        // Use Resend API if available
        if (resendApiKey) {
          return await sendViaResend(order, adminEmail, fromEmail, resendApiKey)
        }

        // Fallback: Try other email services or log error
        console.error('[Email] No email API key configured. Please set RESEND_API_KEY. Checked:')
        console.error('  - process.env.RESEND_API_KEY:', !!process.env.RESEND_API_KEY)
        console.error('  - process.env.VITE_RESEND_API_KEY:', !!process.env.VITE_RESEND_API_KEY)
        console.error('  - viteEnv.RESEND_API_KEY:', !!viteEnv.RESEND_API_KEY)
        console.error('  - viteEnv.VITE_RESEND_API_KEY:', !!viteEnv.VITE_RESEND_API_KEY)
        return { success: false, error: 'Email service not configured' }
      }

      // Helper function to send customer confirmation email via Resend API
      const sendCustomerConfirmationEmail = async (order) => {
        console.log('[sendCustomerConfirmationEmail] Called for order:', order.orderNumber)
        const customerEmail = order.customer?.email
        
        // Check multiple sources for environment variables (same pattern as Stripe config)
        const fromEmail = process.env.SMTP_FROM || 
                         process.env.VITE_SMTP_FROM || 
                         viteEnv.SMTP_FROM || 
                         viteEnv.VITE_SMTP_FROM ||
                         server.config.env?.SMTP_FROM ||
                         server.config.env?.VITE_SMTP_FROM ||
                         'noreply@farmerjohnsbotanicals.com'
        
        const resendApiKey = process.env.RESEND_API_KEY || 
                            process.env.VITE_RESEND_API_KEY || 
                            viteEnv.RESEND_API_KEY || 
                            viteEnv.VITE_RESEND_API_KEY ||
                            server.config.env?.RESEND_API_KEY ||
                            server.config.env?.VITE_RESEND_API_KEY

        if (!customerEmail) {
          console.error('Customer email not found in order')
          return { success: false, error: 'Customer email not found' }
        }

        // Use Resend API if available
        if (resendApiKey) {
          return await sendCustomerEmailViaResend(order, customerEmail, fromEmail, resendApiKey)
        }

        // Fallback: Try other email services or log error
        console.error('[Email] No email API key configured for customer email. Please set RESEND_API_KEY. Checked:')
        console.error('  - process.env.RESEND_API_KEY:', !!process.env.RESEND_API_KEY)
        console.error('  - process.env.VITE_RESEND_API_KEY:', !!process.env.VITE_RESEND_API_KEY)
        console.error('  - viteEnv.RESEND_API_KEY:', !!viteEnv.RESEND_API_KEY)
        console.error('  - viteEnv.VITE_RESEND_API_KEY:', !!viteEnv.VITE_RESEND_API_KEY)
        return { success: false, error: 'Email service not configured' }
      }

      // Helper function to send admin email via Resend API
      async function sendViaResend(order, adminEmail, fromEmail, apiKey) {
        const emailHtml = generateOrderEmailHtml(order)
        const subject = `New Order Received - ${order.orderNumber}`

        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              from: fromEmail,
              to: adminEmail,
              subject: subject,
              html: emailHtml
            })
          })

          if (!response.ok) {
            const error = await response.json()
            console.error('Resend API error:', error)
            return { success: false, error: error.message || 'Failed to send email' }
          }

          const data = await response.json()
          return { success: true, id: data.id }
        } catch (error) {
          console.error('Error sending email via Resend:', error)
          return { success: false, error: error.message }
        }
      }

      // Helper function to send customer email via Resend API
      async function sendCustomerEmailViaResend(order, customerEmail, fromEmail, apiKey) {
        const emailHtml = generateCustomerConfirmationEmailHtml(order)
        const subject = `Order Confirmation - ${order.orderNumber}`

        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              from: fromEmail,
              to: customerEmail,
              subject: subject,
              html: emailHtml
            })
          })

          if (!response.ok) {
            const error = await response.json()
            console.error('Resend API error:', error)
            return { success: false, error: error.message || 'Failed to send email' }
          }

          const data = await response.json()
          return { success: true, id: data.id }
        } catch (error) {
          console.error('Error sending customer email via Resend:', error)
          return { success: false, error: error.message }
        }
      }

      // Email HTML generation functions are now imported from functions/utils/email.js
      // This ensures both local dev and production use the same email templates

      // Save Products endpoint
      server.middlewares.use('/api/save-products', async (req, res, next) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Method not allowed' }))
          return
        }

        // Verify authentication
        if (!verifyAdminAuth(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Unauthorized' }))
          return
        }

        try {
          const requestData = await readBody(req)
          const { products } = requestData

          if (!products || !Array.isArray(products)) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Invalid request: products array required' }))
            return
          }

          // Write to public/data/products.json
          // Use server.config.root to get the project root directory
          const projectRoot = server.config.root || __dirname
          const productsPath = resolve(projectRoot, 'public', 'data', 'products.json')
          
          // Ensure the directory exists
          const dataDir = resolve(projectRoot, 'public', 'data')
          try {
            await fs.mkdir(dataDir, { recursive: true })
          } catch (dirError) {
            // Directory might already exist, that's fine
            if (dirError.code !== 'EEXIST') {
              console.warn('Could not create data directory:', dirError.message)
            }
          }
          
          const dataStr = JSON.stringify(products, null, 2)
          await fs.writeFile(productsPath, dataStr, 'utf8')
          
          console.log(`Products saved to: ${productsPath}`)
          console.log(`Saved ${products.length} products`)

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: true,
            message: 'Products saved successfully',
            count: products.length,
            path: productsPath
          }))
        } catch (error) {
          console.error('Error saving products:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            message: error.message || 'Failed to save products'
          }))
        }
      })

      // Save Categories endpoint
      server.middlewares.use('/api/save-categories', async (req, res, next) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Method not allowed' }))
          return
        }

        // Verify authentication
        if (!verifyAdminAuth(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Unauthorized' }))
          return
        }

        try {
          const requestData = await readBody(req)
          const { categories } = requestData

          if (!categories || !Array.isArray(categories)) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Invalid request: categories array required' }))
            return
          }

          // Write to public/data/categories.json
          const projectRoot = server.config.root || __dirname
          const categoriesPath = resolve(projectRoot, 'public', 'data', 'categories.json')
          
          // Ensure the directory exists
          const dataDir = resolve(projectRoot, 'public', 'data')
          try {
            await fs.mkdir(dataDir, { recursive: true })
          } catch (dirError) {
            if (dirError.code !== 'EEXIST') {
              console.warn('Could not create data directory:', dirError.message)
            }
          }
          
          const dataStr = JSON.stringify(categories, null, 2)
          await fs.writeFile(categoriesPath, dataStr, 'utf8')

          console.log(`Categories saved to: ${categoriesPath}`)
          console.log(`Saved ${categories.length} categories`)

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: true,
            message: 'Categories saved successfully',
            count: categories.length,
            path: categoriesPath
          }))
        } catch (error) {
          console.error('Error saving categories:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            message: error.message || 'Failed to save categories'
          }))
        }
      })

      // Save Pages endpoint
      server.middlewares.use('/api/save-pages', async (req, res, next) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Method not allowed' }))
          return
        }

        // Verify authentication
        if (!verifyAdminAuth(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Unauthorized' }))
          return
        }

        try {
          const requestData = await readBody(req)
          const { pages } = requestData

          if (!pages || !Array.isArray(pages)) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Invalid request: pages array required' }))
            return
          }

          // Write to public/data/pages.json
          // Use server.config.root to get the project root directory
          const projectRoot = server.config.root || __dirname
          const pagesPath = resolve(projectRoot, 'public', 'data', 'pages.json')
          
          // Ensure the directory exists
          const dataDir = resolve(projectRoot, 'public', 'data')
          try {
            await fs.mkdir(dataDir, { recursive: true })
          } catch (dirError) {
            // Directory might already exist, that's fine
            if (dirError.code !== 'EEXIST') {
              console.warn('Could not create data directory:', dirError.message)
            }
          }
          
          const dataStr = JSON.stringify(pages, null, 2)
          await fs.writeFile(pagesPath, dataStr, 'utf8')
          
          console.log(`Pages saved to: ${pagesPath}`)
          console.log(`Saved ${pages.length} pages`)

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: true,
            message: 'Pages saved successfully',
            count: pages.length,
            path: pagesPath
          }))
        } catch (error) {
          console.error('Error saving pages:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            message: error.message || 'Failed to save pages'
          }))
        }
      })

      // File Upload endpoint
      server.middlewares.use('/api/upload-image', async (req, res, next) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Method not allowed' }))
          return
        }

        // Verify authentication
        if (!verifyAdminAuth(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Unauthorized' }))
          return
        }

        try {
          const contentType = req.headers['content-type'] || ''
          if (!contentType.includes('multipart/form-data')) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Invalid content type' }))
            return
          }

          const projectRoot = server.config.root || __dirname
          const uploadsDir = resolve(projectRoot, 'public', 'uploads')
          const year = new Date().getFullYear().toString()
          const yearDir = resolve(uploadsDir, year)

          // Ensure directories exist
          await fs.mkdir(yearDir, { recursive: true })

          // Parse multipart manually
          const boundary = contentType.split('boundary=')[1]
          if (!boundary) {
            throw new Error('No boundary found')
          }

          const chunks = []
          req.on('data', chunk => chunks.push(chunk))
          
          await new Promise((resolvePromise, reject) => {
            req.on('end', async () => {
              try {
                const buffer = Buffer.concat(chunks)
                const boundaryBuffer = Buffer.from(`--${boundary}`)
                const parts = []
                let start = 0

                // Split by boundary
                while (true) {
                  const index = buffer.indexOf(boundaryBuffer, start)
                  if (index === -1) break
                  if (start > 0) {
                    parts.push(buffer.slice(start, index))
                  }
                  start = index + boundaryBuffer.length
                }

                // First pass: check all files for duplicates
                const fileParts = []
                const duplicateFiles = []

                for (const part of parts) {
                  const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'))
                  if (headerEnd === -1) continue

                  const headers = part.slice(0, headerEnd).toString()
                  const content = part.slice(headerEnd + 4)

                  // Extract filename
                  const filenameMatch = headers.match(/filename="([^"]+)"/)
                  if (!filenameMatch) continue

                  const originalFilename = filenameMatch[1]
                  const filePath = resolve(yearDir, originalFilename)
                  
                  // Check if file already exists
                  try {
                    await fs.access(filePath)
                    // File exists, add to duplicate list
                    duplicateFiles.push(originalFilename)
                  } catch (accessError) {
                    // File doesn't exist, add to upload list
                    if (accessError.code === 'ENOENT') {
                      fileParts.push({
                        filename: originalFilename,
                        filePath: filePath,
                        content: content,
                        publicPath: `/uploads/${year}/${originalFilename}`
                      })
                    } else {
                      throw accessError
                    }
                  }
                }

                // If any duplicates were found, return error without uploading anything
                if (duplicateFiles.length > 0) {
                  res.writeHead(409, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({
                    success: false,
                    message: `File(s) already exist: ${duplicateFiles.join(', ')}. Please use different filenames.`,
                    duplicates: duplicateFiles
                  }))
                  return
                }

                // Second pass: upload all files (no duplicates found)
                const uploadedPaths = []
                for (const filePart of fileParts) {
                  // Remove trailing boundary/carriage returns
                  let cleanContent = filePart.content
                  const trailingBoundary = cleanContent.lastIndexOf(Buffer.from('\r\n--'))
                  if (trailingBoundary !== -1) {
                    cleanContent = cleanContent.slice(0, trailingBoundary)
                  }
                  // Remove trailing \r\n
                  if (cleanContent.slice(-2).equals(Buffer.from('\r\n'))) {
                    cleanContent = cleanContent.slice(0, -2)
                  }
                  
                  await fs.writeFile(filePart.filePath, cleanContent)
                  uploadedPaths.push(filePart.publicPath)
                }

                if (uploadedPaths.length === 0) {
                  reject(new Error('No files uploaded'))
                  return
                }

                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({
                  success: true,
                  path: uploadedPaths[0],
                  paths: uploadedPaths
                }))
                resolvePromise()
              } catch (error) {
                reject(error)
              }
            })
            
            req.on('error', reject)
          })
        } catch (error) {
          console.error('Error uploading file:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            message: error.message || 'Failed to upload file'
          }))
        }
      })

      // Finalize Order endpoint
      server.middlewares.use('/api/finalize-order', async (req, res, next) => {
        console.log('[Finalize Order] Request received:', req.method, req.url)
        
        if (req.method !== 'GET' && req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Method not allowed' }))
          return
        }

        try {
          const url = new URL(req.url, `http://${req.headers.host}`)
          const sessionId = url.searchParams.get('session_id')
          console.log('[Finalize Order] Session ID:', sessionId)

          if (!sessionId) {
            console.error('[Finalize Order] No session_id provided')
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'session_id parameter required' }))
            return
          }

          const orders = await loadOrders()
          console.log('[Finalize Order] Loaded orders:', orders.length)
          const orderIndex = orders.findIndex(o => o.stripeSessionId === sessionId)
          console.log('[Finalize Order] Order index:', orderIndex)

          if (orderIndex === -1) {
            console.error('[Finalize Order] Order not found for session:', sessionId)
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Order not found' }))
            return
          }

          const order = orders[orderIndex]
          console.log('[Finalize Order] Order status:', order.status)
          console.log('[Finalize Order] Order customer email:', order.customer?.email)

          // Only finalize if status is pending
          if (order.status === 'pending') {
            console.log('[Finalize Order] Finalizing order...')
            order.status = 'paid'
            order.updatedAt = new Date().toISOString()
            orders[orderIndex] = order
            await saveOrders(orders)
            console.log('[Finalize Order] Order saved with status: paid')

            // Send email notifications (admin and customer)
            // Send both emails independently so one failure doesn't prevent the other
            console.log('[Finalize Order] Attempting to send admin email...')
            try {
              const adminEmailResult = await sendOrderEmail(order)
              if (!adminEmailResult.success) {
                console.error('[Finalize Order] Failed to send admin email notification:', adminEmailResult.error)
              } else {
                console.log('[Finalize Order] Admin email sent successfully:', adminEmailResult.id)
              }
            } catch (error) {
              console.error('[Finalize Order] Error sending admin email notification:', error)
            }
            
            console.log('[Finalize Order] Attempting to send customer confirmation email...')
            try {
              const customerEmailResult = await sendCustomerConfirmationEmail(order)
              if (!customerEmailResult.success) {
                console.error('[Finalize Order] Failed to send customer confirmation email:', customerEmailResult.error)
              } else {
                console.log('[Finalize Order] Customer confirmation email sent successfully:', customerEmailResult.id)
              }
            } catch (error) {
              console.error('[Finalize Order] Error sending customer confirmation email:', error)
            }
          } else {
            console.log('[Finalize Order] Order already finalized, skipping email sending. Status:', order.status)
          }

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: true,
            order: order
          }))
        } catch (error) {
          console.error('Error finalizing order:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            message: error.message || 'Failed to finalize order'
          }))
        }
      })

      // Get Orders endpoint
      server.middlewares.use('/api/orders', async (req, res, next) => {
        // Handle DELETE requests
        if (req.method === 'DELETE') {
          // Verify authentication
          if (!verifyAdminAuth(req)) {
            res.writeHead(401, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Unauthorized' }))
            return
          }

          try {
            const url = new URL(req.url, `http://${req.headers.host}`)
            const orderId = url.searchParams.get('id')

            if (!orderId) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ message: 'Invalid request: order ID required' }))
              return
            }

            const orders = await loadOrders()
            const filteredOrders = orders.filter(o => o.id !== orderId)

            if (filteredOrders.length === orders.length) {
              res.writeHead(404, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ message: 'Order not found' }))
              return
            }

            await saveOrders(filteredOrders)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              success: true,
              message: 'Order deleted successfully'
            }))
          } catch (error) {
            console.error('Error deleting order:', error)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              message: error.message || 'Failed to delete order'
            }))
          }
          return
        }

        // Handle GET requests
        if (req.method !== 'GET') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Method not allowed' }))
          return
        }

        // Verify authentication
        if (!verifyAdminAuth(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Unauthorized' }))
          return
        }

        try {
          const orders = await loadOrders()
          // Sort by date, newest first
          orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: true,
            orders: orders
          }))
        } catch (error) {
          console.error('Error loading orders:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            message: error.message || 'Failed to load orders'
          }))
        }
      })

      // Save Orders endpoint (for admin updates)
      server.middlewares.use('/api/save-orders', async (req, res, next) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Method not allowed' }))
          return
        }

        // Verify authentication
        if (!verifyAdminAuth(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Unauthorized' }))
          return
        }

        try {
          const requestData = await readBody(req)
          const { orders } = requestData

          if (!orders || !Array.isArray(orders)) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: 'Invalid request: orders array required' }))
            return
          }

          await saveOrders(orders)

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: true,
            message: 'Orders saved successfully',
            count: orders.length
          }))
        } catch (error) {
          console.error('Error saving orders:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            message: error.message || 'Failed to save orders'
          }))
        }
      })

      // List Uploaded Images endpoint
      server.middlewares.use('/api/list-images', async (req, res, next) => {
        if (req.method !== 'GET') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Method not allowed' }))
          return
        }

        // Verify authentication
        if (!verifyAdminAuth(req)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Unauthorized' }))
          return
        }

        try {
          const projectRoot = server.config.root || __dirname
          const uploadsDir = resolve(projectRoot, 'public', 'uploads')
          
          // Check if uploads directory exists
          try {
            await fs.access(uploadsDir)
          } catch (accessError) {
            // Directory doesn't exist, return empty array
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              success: true,
              images: []
            }))
            return
          }

          // Read all subdirectories (years) and collect images
          const images = []
          const years = await fs.readdir(uploadsDir, { withFileTypes: true })
          
          for (const year of years) {
            if (year.isDirectory()) {
              const yearPath = resolve(uploadsDir, year.name)
              const files = await fs.readdir(yearPath)
              
              for (const file of files) {
                // Check if it's an image file
                if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)) {
                  images.push({
                    path: `/uploads/${year.name}/${file}`,
                    filename: file,
                    year: year.name
                  })
                }
              }
            }
          }

          // Sort by year (newest first) and then by filename
          images.sort((a, b) => {
            if (b.year !== a.year) {
              return b.year.localeCompare(a.year)
            }
            return b.filename.localeCompare(a.filename)
          })

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: true,
            images: images
          }))
        } catch (error) {
          console.error('Error listing images:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: false,
            message: error.message || 'Failed to list images'
          }))
        }
      })
    }
  }
}


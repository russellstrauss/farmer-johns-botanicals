import Stripe from 'stripe'
import { loadEnv } from 'vite'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

/**
 * Vite plugin to add API middleware for local development
 * Handles /api/create-checkout route for Stripe checkout sessions
 */
export function apiMiddleware() {
  // Load .env file using dotenv for server-side access
  // Get the root directory (project root)
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  
  // Load environment variables from .env file in the project root
  dotenv.config({ path: resolve(__dirname, '.env') })
  
  return {
    name: 'api-middleware',
    configureServer(server) {
      // Also load env vars using Vite's loadEnv as a fallback
      const viteEnv = loadEnv(server.config.mode || 'development', server.config.root, '')
      
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
          const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 
                                   process.env.VITE_STRIPE_SECRET_KEY || 
                                   viteEnv.STRIPE_SECRET_KEY || 
                                   viteEnv.VITE_STRIPE_SECRET_KEY
          
          if (!stripeSecretKey) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ 
              message: 'Stripe secret key not configured. Please set STRIPE_SECRET_KEY or VITE_STRIPE_SECRET_KEY environment variable.'
            }))
            return
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

              const { line_items, customer_email, success_url, cancel_url, metadata } = requestData

              // Get origin from request headers
              const origin = req.headers.origin || req.headers.referer || 'http://localhost:5173'

              // Create Stripe Checkout session
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items,
                mode: 'payment',
                success_url: success_url || `${origin}/success`,
                cancel_url: cancel_url || `${origin}/cart`,
                customer_email: customer_email || undefined,
                metadata: metadata || {}
              })

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
    }
  }
}


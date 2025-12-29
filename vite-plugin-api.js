import Stripe from 'stripe'
import { loadEnv } from 'vite'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs/promises'

/**
 * Vite plugin to add API middleware for local development
 * Handles /api/create-checkout route for Stripe checkout sessions
 * Handles /api/save-products and /api/save-pages for admin content management
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


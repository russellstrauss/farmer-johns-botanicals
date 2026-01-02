// Email utility for Cloudflare Pages Functions
// Uses Resend API (or other HTTP-based email service)

export async function sendOrderEmail(order, env) {
  const adminEmail = env.ADMIN_EMAIL || env.VITE_ADMIN_EMAIL
  const fromEmail = env.SMTP_FROM || env.VITE_SMTP_FROM || 'noreply@example.com'
  const resendApiKey = env.RESEND_API_KEY || env.VITE_RESEND_API_KEY

  if (!adminEmail) {
    console.error('ADMIN_EMAIL not configured')
    return { success: false, error: 'ADMIN_EMAIL not configured' }
  }

  // Use Resend API if available
  if (resendApiKey) {
    return await sendViaResend(order, adminEmail, fromEmail, resendApiKey)
  }

  // Fallback: Try other email services or log error
  console.error('No email API key configured. Please set RESEND_API_KEY')
  return { success: false, error: 'Email service not configured' }
}

export async function sendCustomerConfirmationEmail(order, env) {
  const customerEmail = order.customer?.email
  const fromEmail = env.SMTP_FROM || env.VITE_SMTP_FROM || 'noreply@example.com'
  const resendApiKey = env.RESEND_API_KEY || env.VITE_RESEND_API_KEY

  if (!customerEmail) {
    console.error('Customer email not found in order')
    return { success: false, error: 'Customer email not found' }
  }

  // Use Resend API if available
  if (resendApiKey) {
    return await sendCustomerEmailViaResend(order, customerEmail, fromEmail, resendApiKey)
  }

  // Fallback: Try other email services or log error
  console.error('No email API key configured. Please set RESEND_API_KEY')
  return { success: false, error: 'Email service not configured' }
}

export async function sendPurchaseFailureAlert(errorDetails, env) {
  const adminEmail = env.ADMIN_EMAIL || env.VITE_ADMIN_EMAIL
  const fromEmail = env.SMTP_FROM || env.VITE_SMTP_FROM || 'noreply@example.com'
  const resendApiKey = env.RESEND_API_KEY || env.VITE_RESEND_API_KEY

  if (!adminEmail) {
    console.error('ADMIN_EMAIL not configured - cannot send failure alert')
    return { success: false, error: 'ADMIN_EMAIL not configured' }
  }

  // Use Resend API if available
  if (resendApiKey) {
    return await sendFailureAlertViaResend(errorDetails, adminEmail, fromEmail, resendApiKey)
  }

  // Fallback: log error
  console.error('No email API key configured. Please set RESEND_API_KEY')
  return { success: false, error: 'Email service not configured' }
}

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

async function sendFailureAlertViaResend(errorDetails, adminEmail, fromEmail, apiKey) {
  const emailHtml = generateFailureAlertEmailHtml(errorDetails)
  const subject = `🚨 Purchase Failed - ${errorDetails.customerName || 'Unknown Customer'}`

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
    console.error('Error sending failure alert via Resend:', error)
    return { success: false, error: error.message }
  }
}

export function generateOrderEmailHtml(order) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order.currency || 'USD'
    }).format(price)
  }

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.sku || 'N/A'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatPrice(item.price)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatPrice(item.total)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #0098d6; padding-bottom: 10px; }
        .section { margin: 20px 0; }
        .section-title { font-weight: bold; color: #0098d6; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th { background-color: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
        .total-row { font-weight: bold; font-size: 1.1em; }
        .address { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>New Order Received</h1>
        
        <div class="section">
          <div class="section-title">Order Information</div>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>

        <div class="section">
          <div class="section-title">Customer Information</div>
          <p><strong>Name:</strong> ${order.customer.name}</p>
          <p><strong>Email:</strong> ${order.customer.email}</p>
          <p><strong>Phone:</strong> ${order.customer.phone || 'N/A'}</p>
        </div>

        <div class="section">
          <div class="section-title">Shipping Address</div>
          <div class="address">
            ${order.shipping.name}<br>
            ${order.shipping.address.line1}<br>
            ${order.shipping.address.line2 ? order.shipping.address.line2 + '<br>' : ''}
            ${order.shipping.address.city}, ${order.shipping.address.state} ${order.shipping.address.postal_code}<br>
            ${order.shipping.address.country}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div class="section">
          <table>
            <tr>
              <td style="text-align: right; padding: 5px;"><strong>Subtotal:</strong></td>
              <td style="text-align: right; padding: 5px;">${formatPrice(order.totals.subtotal)}</td>
            </tr>
            <tr>
              <td style="text-align: right; padding: 5px;"><strong>Shipping:</strong></td>
              <td style="text-align: right; padding: 5px;">${formatPrice(order.totals.shipping || 0)}</td>
            </tr>
            <tr>
              <td style="text-align: right; padding: 5px;"><strong>Tax:</strong></td>
              <td style="text-align: right; padding: 5px;">${formatPrice(order.totals.tax || 0)}</td>
            </tr>
            <tr class="total-row">
              <td style="text-align: right; padding: 10px; border-top: 2px solid #333;"><strong>Total:</strong></td>
              <td style="text-align: right; padding: 10px; border-top: 2px solid #333;">${formatPrice(order.totals.total)}</td>
            </tr>
          </table>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateCustomerConfirmationEmailHtml(order) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order.currency || 'USD'
    }).format(price)
  }

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">${formatPrice(item.price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">${formatPrice(item.total)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
        }
        .email-header {
          background-color: #0098d6;
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .email-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .email-body {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #333;
        }
        .message {
          margin-bottom: 30px;
          color: #666;
          line-height: 1.8;
        }
        .section { 
          margin: 25px 0; 
        }
        .section-title { 
          font-weight: 600; 
          color: #0098d6; 
          margin-bottom: 12px;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .order-number {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #0098d6;
          margin: 20px 0;
        }
        .order-number strong {
          display: block;
          margin-bottom: 5px;
          color: #333;
        }
        .order-number span {
          font-size: 18px;
          color: #0098d6;
          font-weight: 600;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 15px 0; 
        }
        th { 
          background-color: #f5f5f5; 
          padding: 12px; 
          text-align: left; 
          border-bottom: 2px solid #ddd;
          font-weight: 600;
          color: #333;
        }
        .total-row { 
          font-weight: 600; 
          font-size: 1.1em; 
          background-color: #f9f9f9;
        }
        .address { 
          background-color: #f9f9f9; 
          padding: 15px; 
          border-radius: 5px;
          line-height: 1.8;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
          border-top: 1px solid #e0e0e0;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>Thank You for Your Order!</h1>
        </div>
        <div class="email-body">
          <div class="greeting">
            Hello ${order.customer.name || 'Valued Customer'},
          </div>
          
          <div class="message">
            We're excited to confirm that we've received your order and payment has been processed successfully. 
            We'll begin preparing your items for shipment right away.
          </div>

          <div class="order-number">
            <strong>Order Number:</strong>
            <span>${order.orderNumber}</span>
          </div>
          
          <div class="section">
            <div class="section-title">Order Details</div>
            <p style="margin: 5px 0; color: #666;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Order Status:</strong> ${order.status === 'paid' ? 'Confirmed' : order.status}</p>
          </div>

          <div class="section">
            <div class="section-title">Shipping Address</div>
            <div class="address">
              ${order.shipping.name}<br>
              ${order.shipping.address.line1}<br>
              ${order.shipping.address.line2 ? order.shipping.address.line2 + '<br>' : ''}
              ${order.shipping.address.city}, ${order.shipping.address.state} ${order.shipping.address.postal_code}<br>
              ${order.shipping.address.country}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="section">
            <table>
              <tr>
                <td style="text-align: right; padding: 8px; color: #666;"><strong>Subtotal:</strong></td>
                <td style="text-align: right; padding: 8px; color: #666;">${formatPrice(order.totals.subtotal)}</td>
              </tr>
              ${order.totals.shipping ? `
              <tr>
                <td style="text-align: right; padding: 8px; color: #666;"><strong>Shipping:</strong></td>
                <td style="text-align: right; padding: 8px; color: #666;">${formatPrice(order.totals.shipping)}</td>
              </tr>
              ` : ''}
              ${order.totals.tax ? `
              <tr>
                <td style="text-align: right; padding: 8px; color: #666;"><strong>Tax:</strong></td>
                <td style="text-align: right; padding: 8px; color: #666;">${formatPrice(order.totals.tax)}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td style="text-align: right; padding: 12px; border-top: 2px solid #333; color: #333;"><strong>Total:</strong></td>
                <td style="text-align: right; padding: 12px; border-top: 2px solid #333; color: #333;">${formatPrice(order.totals.total)}</td>
              </tr>
            </table>
          </div>

          <div class="message" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0;">If you have any questions about your order, please contact Farmer John directly at (678) 927-3289 or farmerjsbotanicals@gmail.com</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Thank you for your business!</strong></p>
          <p>Farmer John's Botanicals</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateFailureAlertEmailHtml(errorDetails) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: errorDetails.currency || 'USD'
    }).format(price)
  }

  const itemsHtml = (errorDetails.items || []).map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${item.name || 'Unknown Item'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">${formatPrice(item.price || 0)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">${formatPrice((item.price || 0) * (item.quantity || 1))}</td>
    </tr>
  `).join('')

  const errorMessage = errorDetails.errorMessage || 'Unknown error occurred'
  const errorType = errorDetails.errorType || 'Checkout Session Creation Failed'
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
        }
        .email-header {
          background-color: #dc3545;
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .email-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .email-body {
          padding: 30px 20px;
        }
        .alert-box {
          background-color: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 5px;
          padding: 20px;
          margin: 20px 0;
        }
        .error-box {
          background-color: #f8d7da;
          border: 2px solid #dc3545;
          border-radius: 5px;
          padding: 15px;
          margin: 15px 0;
        }
        .error-box strong {
          color: #721c24;
          display: block;
          margin-bottom: 10px;
        }
        .error-box code {
          background-color: #fff;
          padding: 10px;
          border-radius: 3px;
          display: block;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #721c24;
          word-break: break-word;
        }
        .section { 
          margin: 25px 0; 
        }
        .section-title { 
          font-weight: 600; 
          color: #dc3545; 
          margin-bottom: 12px;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 10px;
          margin: 10px 0;
        }
        .info-label {
          font-weight: 600;
          color: #666;
        }
        .info-value {
          color: #333;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 15px 0; 
        }
        th { 
          background-color: #f5f5f5; 
          padding: 12px; 
          text-align: left; 
          border-bottom: 2px solid #ddd;
          font-weight: 600;
          color: #333;
        }
        .total-row { 
          font-weight: 600; 
          font-size: 1.1em; 
          background-color: #f9f9f9;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
          border-top: 1px solid #e0e0e0;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>🚨 Purchase Failed</h1>
        </div>
        <div class="email-body">
          <div class="alert-box">
            <strong>⚠️ A customer's purchase attempt has failed.</strong>
            <p style="margin: 10px 0 0 0;">Please review the details below and investigate the issue.</p>
          </div>

          <div class="section">
            <div class="section-title">Error Information</div>
            <div class="error-box">
              <strong>Error Type:</strong>
              <div>${errorType}</div>
              <strong style="margin-top: 15px;">Error Message:</strong>
              <code>${errorMessage}</code>
            </div>
            <div class="info-grid">
              <div class="info-label">Timestamp:</div>
              <div class="info-value">${timestamp}</div>
            </div>
          </div>

          ${errorDetails.customerName || errorDetails.customerEmail ? `
          <div class="section">
            <div class="section-title">Customer Information</div>
            ${errorDetails.customerName ? `
            <div class="info-grid">
              <div class="info-label">Name:</div>
              <div class="info-value">${errorDetails.customerName}</div>
            </div>
            ` : ''}
            ${errorDetails.customerEmail ? `
            <div class="info-grid">
              <div class="info-label">Email:</div>
              <div class="info-value">${errorDetails.customerEmail}</div>
            </div>
            ` : ''}
            ${errorDetails.customerPhone ? `
            <div class="info-grid">
              <div class="info-label">Phone:</div>
              <div class="info-value">${errorDetails.customerPhone}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}

          ${errorDetails.items && errorDetails.items.length > 0 ? `
          <div class="section">
            <div class="section-title">Cart Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            ${errorDetails.subtotal ? `
            <div style="text-align: right; margin-top: 15px; font-size: 18px; font-weight: 600;">
              Total: ${formatPrice(errorDetails.subtotal)}
            </div>
            ` : ''}
          </div>
          ` : ''}

          ${errorDetails.shippingAddress ? `
          <div class="section">
            <div class="section-title">Shipping Address</div>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; line-height: 1.8;">
              ${errorDetails.shippingAddress.line1 || ''}<br>
              ${errorDetails.shippingAddress.line2 ? errorDetails.shippingAddress.line2 + '<br>' : ''}
              ${errorDetails.shippingAddress.city || ''}, ${errorDetails.shippingAddress.state || ''} ${errorDetails.shippingAddress.postal_code || ''}<br>
              ${errorDetails.shippingAddress.country || ''}
            </div>
          </div>
          ` : ''}

          <div class="section" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; margin: 0;">
              <strong>Action Required:</strong> Please investigate this error and ensure your payment processing is functioning correctly. 
              Check Stripe Dashboard for any issues with your account or API keys.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Farmer John's Botanicals</strong></p>
          <p>Automated Alert System</p>
        </div>
      </div>
    </body>
    </html>
  `
}


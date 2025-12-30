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

function generateOrderEmailHtml(order) {
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


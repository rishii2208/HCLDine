// Email Service using Nodemailer with Gmail
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email service error:", error.message);
  } else {
    console.log("✅ Email service ready");
  }
});

/**
 * Format order items as HTML table
 */
const formatOrderItemsHTML = (items) => {
  let html = `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #ff6b35; color: white;">
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Item</th>
          <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Qty</th>
          <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Price</th>
          <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  items.forEach((item, index) => {
    const bgColor = index % 2 === 0 ? "#ffffff" : "#f9f9f9";
    html += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 12px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$${item.price.toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  return html;
};

/**
 * Generate order confirmation email HTML
 */
const generateOrderConfirmationHTML = (order) => {
  const orderDate = new Date(order.orderDate).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🍽️ HCLDine</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Order Confirmation</p>
      </div>
      
      <!-- Main Content -->
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
        
        <!-- Success Message -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 50px; margin-bottom: 10px;">✅</div>
          <h2 style="color: #28a745; margin: 0;">Order Confirmed!</h2>
          <p style="color: #666; margin: 10px 0 0 0;">Thank you for your order, ${order.deliveryInfo.firstName}!</p>
        </div>
        
        <!-- Order Info Box -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 5px 0;"><strong>Order ID:</strong></td>
              <td style="text-align: right; color: #ff6b35; font-weight: bold;">#${order.orderId}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Date:</strong></td>
              <td style="text-align: right;">${orderDate}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Status:</strong></td>
              <td style="text-align: right;">
                <span style="background-color: #28a745; color: white; padding: 4px 12px; border-radius: 15px; font-size: 12px;">
                  ${order.status.toUpperCase()}
                </span>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Order Items -->
        <h3 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 10px; margin-bottom: 15px;">
          📦 Order Items
        </h3>
        ${formatOrderItemsHTML(order.items)}
        
        <!-- Order Summary -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0;">Subtotal:</td>
              <td style="text-align: right;">$${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Delivery Fee:</td>
              <td style="text-align: right;">$${order.deliveryFee.toFixed(2)}</td>
            </tr>
            <tr style="border-top: 2px solid #ddd;">
              <td style="padding: 12px 0; font-size: 18px;"><strong>Total:</strong></td>
              <td style="text-align: right; font-size: 18px; color: #ff6b35;"><strong>$${order.total.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>
        
        <!-- Delivery Address -->
        <h3 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 10px; margin-bottom: 15px;">
          📍 Delivery Address
        </h3>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <p style="margin: 0;">
            <strong>${order.deliveryInfo.firstName} ${order.deliveryInfo.lastName}</strong><br>
            ${order.deliveryInfo.street}<br>
            ${order.deliveryInfo.city}, ${order.deliveryInfo.state} ${order.deliveryInfo.zipCode}<br>
            ${order.deliveryInfo.country}<br>
            <br>
            📞 ${order.deliveryInfo.phone}<br>
            ✉️ ${order.deliveryInfo.email}
          </p>
        </div>
        
        <!-- Footer Message -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; margin: 0;">
            We're preparing your delicious meal! 🍳<br>
            <small>You'll receive updates on your order status.</small>
          </p>
        </div>
        
      </div>
      
      <!-- Footer -->
      <div style="background-color: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0 0 10px 0; font-size: 14px;">
          Questions? Contact us at contact@hcldine.com
        </p>
        <p style="margin: 0; font-size: 12px; color: #999;">
          © 2024 HCLDine. All rights reserved.
        </p>
      </div>
      
    </body>
    </html>
  `;
};

/**
 * Send order confirmation email
 * @param {Object} order - Order details
 * @returns {Promise<Object>} Result
 */
export const sendOrderConfirmationEmail = async (order) => {
  try {
    const recipientEmail = order.deliveryInfo.email || order.userEmail;
    
    if (!recipientEmail) {
      console.error("No recipient email provided for order:", order.orderId);
      return { success: false, error: "No recipient email" };
    }

    const mailOptions = {
      from: {
        name: "HCLDine",
        address: process.env.GMAIL_USER
      },
      to: recipientEmail,
      subject: `🍽️ Order Confirmed - #${order.orderId} | HCLDine`,
      html: generateOrderConfirmationHTML(order)
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Order confirmation email sent to ${recipientEmail}`);
    console.log("   Message ID:", info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send order confirmation email:", error.message);
    return { success: false, error: error.message };
  }
};

export default {
  sendOrderConfirmationEmail
};

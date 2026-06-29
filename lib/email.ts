import nodemailer from 'nodemailer';
import { Order } from '@/types';

function getTransporter() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true only for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(p);
}

/** Send order confirmation to customer */
export async function sendOrderConfirmation(order: Order): Promise<void> {
  if (!process.env.SMTP_USER) return; // silently skip if not configured

  const itemRows = order.items
    .map(i => `<tr style="border-bottom:1px solid #222">
      <td style="padding:10px 0;color:#aaa">${i.product_title} / ${i.size}</td>
      <td style="padding:10px 0;color:#aaa;text-align:right">×${i.quantity}</td>
      <td style="padding:10px 0;color:#fff;text-align:right">${formatPrice(i.unit_price * i.quantity)}</td>
    </tr>`)
    .join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#000;color:#fff;font-family:Inter,sans-serif">
    <div style="max-width:560px;margin:0 auto;padding:40px 20px">
      <h1 style="font-size:28px;letter-spacing:0.15em;margin-bottom:4px">NOYR</h1>
      <p style="color:#cc0000;letter-spacing:0.3em;font-size:10px;margin-top:0">DRESSED FOR THE VOID</p>

      <h2 style="font-size:18px;letter-spacing:0.1em;margin-top:36px;margin-bottom:4px">ORDER CONFIRMED</h2>
      <p style="color:#666;font-size:13px">Thank you, ${order.customer_name}. Your order has been received.</p>

      <div style="border:1px solid #222;padding:20px;margin:24px 0">
        <p style="font-size:11px;letter-spacing:0.3em;color:#555;margin-bottom:12px">ORDER ID</p>
        <p style="font-family:monospace;font-size:18px;margin:0">${order.id}</p>
      </div>

      <table style="width:100%;border-collapse:collapse">${itemRows}</table>
      <div style="border-top:1px solid #333;padding-top:16px;margin-top:8px;display:flex;justify-content:space-between">
        <span style="font-weight:600;letter-spacing:0.1em">TOTAL</span>
        <span style="font-weight:600">${formatPrice(order.total)}</span>
      </div>

      <div style="border:1px solid #222;padding:20px;margin:24px 0">
        <p style="font-size:11px;letter-spacing:0.3em;color:#555;margin-bottom:12px">NEXT STEPS</p>
        <p style="color:#aaa;font-size:13px;line-height:1.6">
          Our team will verify your UPI payment within <strong style="color:#fff">24 hours</strong>.<br/>
          Your order will be shipped within 3–5 business days after verification.<br/>
          Track your order at <a href="https://noyr.in/track-order?id=${order.id}" style="color:#cc0000">noyr.in/track-order</a>.
        </p>
      </div>

      <p style="color:#333;font-size:11px;margin-top:40px;letter-spacing:0.2em">© NOYR. ALL RIGHTS RESERVED.</p>
    </div>
  </body>
  </html>`;

  await getTransporter().sendMail({
    from:    process.env.EMAIL_FROM ?? 'NOYR <noreply@noyr.in>',
    to:      order.email,
    subject: `NOYR — Order Confirmed · ${order.id}`,
    html,
  });
}

/** Send admin notification when a new order arrives */
export async function sendAdminNotification(order: Order): Promise<void> {
  if (!process.env.SMTP_USER) return;

  await getTransporter().sendMail({
    from:    process.env.EMAIL_FROM ?? 'NOYR <noreply@noyr.in>',
    to:      process.env.SMTP_USER,
    subject: `[NOYR] New Order ${order.id} — ${formatPrice(order.total)}`,
    html: `
      <p>New order from <strong>${order.customer_name}</strong> (${order.email})</p>
      <p>Amount: <strong>${formatPrice(order.total)}</strong></p>
      <p>TXN ID: <code>${order.payment?.transaction_id ?? '—'}</code></p>
      <p>Items: ${order.items.map(i => `${i.product_title} ×${i.quantity}`).join(', ')}</p>
      <p>Address: ${order.address}</p>
    `,
  });
}

/** Send payment verified notification */
export async function sendPaymentVerified(order: Order): Promise<void> {
  if (!process.env.SMTP_USER) return;

  await getTransporter().sendMail({
    from:    process.env.EMAIL_FROM ?? 'NOYR <noreply@noyr.in>',
    to:      order.email,
    subject: `NOYR — Payment Verified · ${order.id}`,
    html: `
      <div style="background:#000;color:#fff;font-family:Inter,sans-serif;padding:40px;max-width:560px;margin:0 auto">
        <h1 style="letter-spacing:0.15em">NOYR</h1>
        <h2>Payment Verified ✓</h2>
        <p>Hi ${order.customer_name}, your payment for order <strong>${order.id}</strong> has been verified.</p>
        <p>Your order is now being processed and will ship within 3–5 business days.</p>
        <p><a href="https://noyr.in/track-order?id=${order.id}" style="color:#cc0000">Track your order →</a></p>
      </div>
    `,
  });
}

/** Send shipped notification with tracking */
export async function sendShippedNotification(order: Order, trackingId?: string): Promise<void> {
  if (!process.env.SMTP_USER) return;

  await getTransporter().sendMail({
    from:    process.env.EMAIL_FROM ?? 'NOYR <noreply@noyr.in>',
    to:      order.email,
    subject: `NOYR — Your Order Has Shipped · ${order.id}`,
    html: `
      <div style="background:#000;color:#fff;font-family:Inter,sans-serif;padding:40px;max-width:560px;margin:0 auto">
        <h1 style="letter-spacing:0.15em">NOYR</h1>
        <h2>Order Shipped 🚚</h2>
        <p>Hi ${order.customer_name}, your order <strong>${order.id}</strong> is on its way.</p>
        ${trackingId ? `<p>Tracking ID: <strong>${trackingId}</strong></p>` : ''}
        <p>Estimated delivery: 5–7 business days.</p>
        <p><a href="https://noyr.in/track-order?id=${order.id}" style="color:#cc0000">Track your order →</a></p>
      </div>
    `,
  });
}

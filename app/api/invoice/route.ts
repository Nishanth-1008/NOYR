import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/types';

function formatPrice(p: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(p);
}

function generateInvoiceHTML(order: Order): string {
  const invoiceNumber = `INV-${order.id}`;
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #111;color:#ccc;font-size:13px">
        ${item.product_title}<br/>
        <span style="color:#666;font-size:11px">Size: ${item.size} · SKU: ${item.variant_id}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #111;color:#666;font-size:13px;text-align:center">
        ${item.quantity}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #111;color:#ccc;font-size:13px;text-align:right">
        ${formatPrice(item.unit_price)}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #111;color:#fff;font-size:13px;text-align:right;font-weight:600">
        ${formatPrice(item.unit_price * item.quantity)}
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>NOYR Invoice ${invoiceNumber}</title>
<style>
  * { margin:0;padding:0;box-sizing:border-box; }
  body { background:#000;color:#fff;font-family:'Inter','Helvetica Neue',Arial,sans-serif;padding:60px 40px; }
  @media print { body { padding:30px; } }
</style>
</head>
<body>
<div style="max-width:640px;margin:0 auto">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:60px">
    <div>
      <h1 style="font-size:36px;font-weight:900;letter-spacing:0.15em">NOYR</h1>
      <p style="color:#cc0000;letter-spacing:0.4em;font-size:9px;margin-top:4px">DRESSED FOR THE VOID</p>
    </div>
    <div style="text-align:right">
      <p style="letter-spacing:0.3em;font-size:9px;color:#555;margin-bottom:6px">INVOICE</p>
      <p style="font-size:20px;font-weight:700;letter-spacing:0.1em">${invoiceNumber}</p>
      <p style="color:#444;font-size:12px;margin-top:6px">${date}</p>
    </div>
  </div>

  <!-- Billing info -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:50px">
    <div>
      <p style="letter-spacing:0.3em;font-size:9px;color:#444;margin-bottom:12px">BILLED TO</p>
      <p style="font-weight:600;font-size:15px;margin-bottom:4px">${order.customer_name}</p>
      <p style="color:#666;font-size:12px;line-height:1.8">
        ${order.address}<br/>
        ${order.city} — ${order.pincode}<br/>
        ${order.phone}<br/>
        ${order.email}
      </p>
    </div>
    <div>
      <p style="letter-spacing:0.3em;font-size:9px;color:#444;margin-bottom:12px">ORDER DETAILS</p>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="color:#555;font-size:12px;padding:3px 0">Order ID</td>
          <td style="color:#fff;font-size:12px;text-align:right;font-family:monospace">${order.id}</td>
        </tr>
        <tr>
          <td style="color:#555;font-size:12px;padding:3px 0">Status</td>
          <td style="color:#fff;font-size:12px;text-align:right;text-transform:uppercase;letter-spacing:0.1em">${order.status}</td>
        </tr>
        <tr>
          <td style="color:#555;font-size:12px;padding:3px 0">Payment</td>
          <td style="color:#fff;font-size:12px;text-align:right;text-transform:uppercase;letter-spacing:0.1em">${order.payment_status}</td>
        </tr>
        ${order.tracking_id ? `<tr>
          <td style="color:#555;font-size:12px;padding:3px 0">Tracking</td>
          <td style="color:#fff;font-size:12px;text-align:right;font-family:monospace">${order.tracking_id}</td>
        </tr>` : ''}
      </table>
    </div>
  </div>

  <!-- Items -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:30px">
    <thead>
      <tr>
        <th style="text-align:left;font-size:9px;letter-spacing:0.3em;color:#444;padding-bottom:12px;border-bottom:1px solid #222">ITEM</th>
        <th style="text-align:center;font-size:9px;letter-spacing:0.3em;color:#444;padding-bottom:12px;border-bottom:1px solid #222">QTY</th>
        <th style="text-align:right;font-size:9px;letter-spacing:0.3em;color:#444;padding-bottom:12px;border-bottom:1px solid #222">UNIT</th>
        <th style="text-align:right;font-size:9px;letter-spacing:0.3em;color:#444;padding-bottom:12px;border-bottom:1px solid #222">TOTAL</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <!-- Total -->
  <div style="border-top:1px solid #333;padding-top:20px">
    <div style="display:flex;justify-content:flex-end">
      <div style="width:220px">
        <div style="display:flex;justify-content:space-between;padding:6px 0">
          <span style="color:#555;font-size:13px">Subtotal</span>
          <span style="color:#ccc;font-size:13px">${formatPrice(order.total)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0">
          <span style="color:#555;font-size:13px">Shipping</span>
          <span style="color:#888;font-size:13px">FREE</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:1px solid #333;margin-top:6px">
          <span style="font-weight:700;letter-spacing:0.1em;font-size:14px">TOTAL</span>
          <span style="font-weight:700;font-size:18px">${formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top:60px;border-top:1px solid #111;padding-top:24px;text-align:center">
    <p style="color:#333;font-size:10px;letter-spacing:0.2em">
      NOYR · noyr.in · ${process.env.EMAIL_FROM ?? 'support@noyr.in'}
    </p>
    <p style="color:#222;font-size:10px;margin-top:8px;letter-spacing:0.1em">
      THANK YOU FOR BEING PART OF THE VOID.
    </p>
  </div>
</div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order_id');
  const key = req.headers.get('x-admin-key');

  if (!orderId) return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });

  // Allow either admin key or public access with order ID (self-service invoice)
  const isAdmin = key === process.env.ADMIN_SECRET || key === process.env.ADMIN_PASSWORD;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let order: Order | null = null;

  if (supabaseUrl) {
    const { getSupabaseAdmin } = await import('@/lib/supabase-server');
    const db = getSupabaseAdmin() as any;
    const { data } = await db
      .from('orders')
      .select('*, order_items(*), payments(*)')
      .eq('id', orderId)
      .single();
    order = data as Order | null;
    if (order && (order as any).order_items) {
      (order as any).items = (order as any).order_items;
    }
  }

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Security: non-admin must provide matching email via query param
  const emailParam = searchParams.get('email');
  if (!isAdmin && emailParam !== order.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const html = generateInvoiceHTML(order);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="NOYR-Invoice-${orderId}.html"`,
    },
  });
}

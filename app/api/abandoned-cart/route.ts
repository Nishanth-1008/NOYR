import { NextRequest, NextResponse } from 'next/server';

interface CartItemSummary {
  title: string;
  size: string;
  quantity: number;
  price: number;
  slug: string;
}

function formatPrice(p: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(p);
}

export async function POST(req: NextRequest) {
  try {
    const { email, items }: { email: string; items: CartItemSummary[] } = await req.json();

    if (!email || !items?.length) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (!process.env.SMTP_USER) {
      return NextResponse.json({ skipped: true });
    }

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const itemRows = items.map(i => `
      <tr>
        <td style="padding:10px 0;color:#aaa;border-bottom:1px solid #111;font-size:13px">
          ${i.title} / ${i.size}
        </td>
        <td style="padding:10px 0;color:#aaa;border-bottom:1px solid #111;font-size:13px;text-align:center">
          ×${i.quantity}
        </td>
        <td style="padding:10px 0;color:#fff;border-bottom:1px solid #111;font-size:13px;text-align:right">
          ${formatPrice(i.price * i.quantity)}
        </td>
      </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#000;color:#fff;font-family:Inter,sans-serif">
      <div style="max-width:560px;margin:0 auto;padding:40px 20px">
        <h1 style="font-size:28px;letter-spacing:0.15em;margin-bottom:4px">NOYR</h1>
        <p style="color:#cc0000;letter-spacing:0.3em;font-size:10px;margin-top:0">DRESSED FOR THE VOID</p>

        <h2 style="font-size:18px;letter-spacing:0.1em;margin-top:36px;margin-bottom:4px">
          YOU LEFT SOMETHING BEHIND.
        </h2>
        <p style="color:#666;font-size:13px;margin-bottom:24px">
          Your cart is waiting. These pieces don't stay available forever.
        </p>

        <table style="width:100%;border-collapse:collapse">${itemRows}</table>

        <div style="display:flex;justify-content:space-between;padding:16px 0;border-top:1px solid #222;margin-top:8px">
          <span style="font-weight:600;letter-spacing:0.1em">TOTAL</span>
          <span style="font-weight:600">${formatPrice(total)}</span>
        </div>

        <div style="margin-top:32px;text-align:center">
          <a
            href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noyr.in'}/cart"
            style="display:inline-block;background:#fff;color:#000;padding:14px 40px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-decoration:none"
          >
            RETURN TO CART →
          </a>
        </div>

        <p style="color:#333;font-size:11px;margin-top:40px;letter-spacing:0.2em">
          © NOYR. ALL RIGHTS RESERVED.
        </p>
      </div>
    </body>
    </html>`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? 'NOYR <noreply@noyr.in>',
      to: email,
      subject: 'NOYR — Your cart is waiting.',
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[abandoned-cart/POST]', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}

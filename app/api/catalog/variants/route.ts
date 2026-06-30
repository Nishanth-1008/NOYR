import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { variant_id, product_id, stock, price, notify_restock } = body;
    if (!variant_id) return NextResponse.json({ error: 'variant_id required' }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;

      const changes: Record<string, unknown> = {};
      if (stock !== undefined) changes.stock = Number(stock);
      if (price !== undefined) changes.price = Number(price);

      if (Object.keys(changes).length > 0) {
        await db.from('variants').update(changes).eq('id', variant_id);
      }

      // Trigger restock emails if stock is going from 0 → positive
      if (notify_restock && stock > 0) {
        const { data: subscribers } = await db
          .from('restock_notifications')
          .select('email')
          .eq('variant_id', variant_id)
          .eq('notified', false);

        if (subscribers && subscribers.length > 0) {
          const emails: string[] = subscribers.map((s: { email: string }) => s.email);
          // Mark as notified
          await db.from('restock_notifications').update({ notified: true }).eq('variant_id', variant_id);

          // Fire emails (best-effort)
          if (process.env.SMTP_USER) {
            const nodemailer = await import('nodemailer');
            const transporter = nodemailer.default.createTransport({
              host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
              port: Number(process.env.SMTP_PORT ?? 587),
              secure: false,
              auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            });
            const { data: product } = await db.from('products').select('title, slug').eq('id', product_id).single();
            const { data: variant } = await db.from('variants').select('size').eq('id', variant_id).single();

            for (const email of emails) {
              await transporter.sendMail({
                from: process.env.EMAIL_FROM ?? 'NOYR <noreply@noyr.in>',
                to: email,
                subject: `NOYR — ${product?.title ?? 'Item'} (${variant?.size ?? ''}) is back.`,
                html: `
                  <div style="background:#000;color:#fff;font-family:Inter,sans-serif;padding:40px 24px;max-width:520px">
                    <h1 style="font-size:28px;letter-spacing:.15em;margin-bottom:4px">NOYR</h1>
                    <p style="color:#cc0000;letter-spacing:.3em;font-size:10px;margin-top:0">DRESSED FOR THE VOID</p>
                    <h2 style="font-size:18px;margin-top:32px">${product?.title ?? 'Your item'} is back in stock.</h2>
                    <p style="color:#666;font-size:13px">Size ${variant?.size ?? ''} is available again. Limited units — don't sleep on it.</p>
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noyr.in'}/products/${product?.slug ?? ''}"
                       style="display:inline-block;background:#fff;color:#000;padding:12px 32px;font-size:11px;font-weight:700;letter-spacing:.2em;text-decoration:none;margin-top:24px">
                      SHOP NOW →
                    </a>
                  </div>`,
              }).catch(() => {});
            }
          }

          return NextResponse.json({ ok: true, notified: emails.length });
        }
      }
    }

    return NextResponse.json({ ok: true, notified: 0 });
  } catch (err) {
    console.error('[catalog/variants PATCH]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

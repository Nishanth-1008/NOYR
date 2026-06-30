import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/types';
import { sendOrderConfirmation, sendAdminNotification } from '@/lib/email';
import { isAdminAuthed } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const order: Order = await req.json();

    // Try Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const admin = getSupabaseAdmin();
      const db = admin as any; // bypass strict generated types

      const { error: orderErr } = await db.from('orders').insert({
        id:             order.id,
        customer_name:  order.customer_name,
        email:          order.email,
        phone:          order.phone,
        address:        order.address,
        city:           order.city,
        pincode:        order.pincode,
        total:          order.total,
        status:         order.status,
        payment_status: order.payment_status,
        notes:          order.notes ?? null,
      });
      if (orderErr) throw orderErr;

      await db.from('order_items').insert(
        order.items.map(i => ({
          id:            i.id,
          order_id:      order.id,
          product_id:    i.product_id,
          product_title: i.product_title,
          variant_id:    i.variant_id,
          size:          i.size,
          quantity:      i.quantity,
          unit_price:    i.unit_price,
        }))
      );

      if (order.payment) {
        await db.from('payments').insert({
          id:              order.payment.id,
          order_id:        order.id,
          payment_method:  order.payment.payment_method,
          transaction_id:  order.payment.transaction_id,
          screenshot_url:  order.payment.screenshot_url ?? null,
          verified:        false,
          verified_at:     null,
        });
      }
    }

    // Emails – fire-and-forget
    Promise.allSettled([
      sendOrderConfirmation(order),
      sendAdminNotification(order),
    ]).catch(() => {});

    return NextResponse.json({ success: true, id: order.id });
  } catch (err) {
    console.error('[orders/POST]', err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  const { getSupabaseAdmin } = await import('@/lib/supabase-server');
  const db = getSupabaseAdmin() as any;

  if (id) {
    const { data, error } = await db
      .from('orders')
      .select('*, order_items(*), payments(*)')
      .eq('id', id)
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  const { data, error } = await db
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

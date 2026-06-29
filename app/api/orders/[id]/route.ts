import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const authHeader = req.headers.get('x-admin-key');
  if (
    authHeader !== process.env.ADMIN_SECRET &&
    authHeader !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json(
      { error: 'Supabase not configured; use localStorage admin' },
      { status: 503 }
    );
  }

  const { getSupabaseAdmin } = await import('@/lib/supabase-server');
  const { sendPaymentVerified, sendShippedNotification } = await import('@/lib/email');
  const admin = getSupabaseAdmin();

  // Build a typed partial update object
  type OrderUpdate = {
    updated_at: string;
    status?: string;
    payment_status?: string;
    tracking_id?: string;
  };
  const updates: OrderUpdate = { updated_at: new Date().toISOString() };
  if (body.status)         updates.status         = body.status;
  if (body.payment_status) updates.payment_status = body.payment_status;
  if (body.tracking_id)    updates.tracking_id    = body.tracking_id;

  // Use any to bypass the strict Supabase generated-type constraint
  const { data, error } = await (admin.from('orders') as any)
    .update(updates)
    .eq('id', id)
    .select('*, order_items(*), payments(*)')
    .single();

  if (error)
    return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 });

  // Email side-effects (fire-and-forget)
  if (body.payment_status === 'verified') {
    await (admin.from('payments') as any)
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('order_id', id);
    sendPaymentVerified(data as any).catch(() => {});
  }
  if (body.status === 'shipped') {
    sendShippedNotification(data as any, body.tracking_id).catch(() => {});
  }

  return NextResponse.json(data);
}

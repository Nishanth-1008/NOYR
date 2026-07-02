import { NextRequest, NextResponse } from 'next/server';
import { normalizeSupabaseOrder } from '@/lib/orders';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id')?.trim();
    const email = searchParams.get('email')?.trim().toLowerCase();
    const phone = searchParams.get('phone')?.trim();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }
    if (!email && !phone) {
      return NextResponse.json({ success: false, error: 'Email or phone number is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      // Local localStorage/mock fallback for local dev
      return NextResponse.json({ success: false, error: 'Supabase is not configured' }, { status: 501 });
    }

    const { getSupabaseAdmin } = await import('@/lib/supabase-server');
    const db = getSupabaseAdmin() as any;

    const { data: row, error } = await db
      .from('orders')
      .select('*, order_items(*), payments(*)')
      .eq('id', orderId.toUpperCase())
      .single();

    if (error || !row) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Verify contact info
    const emailMatch = email && row.email.toLowerCase() === email;
    const phoneMatch = phone && row.phone.replace(/\D/g, '') === phone.replace(/\D/g, '');

    if (!emailMatch && !phoneMatch) {
      return NextResponse.json({ success: false, error: 'Contact details do not match this order' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      order: normalizeSupabaseOrder(row),
    });
  } catch (err: any) {
    console.error('[orders/lookup GET]', err);
    return NextResponse.json({ success: false, error: 'Server error looking up order' }, { status: 500 });
  }
}

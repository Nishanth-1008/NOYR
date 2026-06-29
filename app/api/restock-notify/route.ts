import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { product_id, variant_id, email } = await req.json();

    if (!product_id || !variant_id || !email || !email.includes('@')) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    const record = {
      id: uuid(),
      product_id,
      variant_id,
      email: email.toLowerCase().trim(),
      notified: false,
      created_at: new Date().toISOString(),
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;

      // Avoid duplicate registrations
      const { data: existing } = await db
        .from('restock_notifications')
        .select('id')
        .eq('product_id', product_id)
        .eq('variant_id', variant_id)
        .eq('email', record.email)
        .eq('notified', false)
        .single();

      if (!existing) {
        await db.from('restock_notifications').insert(record);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[restock-notify/POST]', err);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}

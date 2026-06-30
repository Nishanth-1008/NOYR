import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    // Strip fields that don't belong on the products row (e.g. variants, id)
    const { variants: _variants, id: _id, created_at: _createdAt, ...rest } = body;
    const changes: Record<string, unknown> = { ...rest };
    if ('collection_id' in changes && (changes.collection_id === '' || changes.collection_id === undefined)) {
      changes.collection_id = null;
    }
    if ('drop_date' in changes && !changes.drop_date) {
      changes.drop_date = null;
    }
    if ('price' in changes) changes.price = Number(changes.price);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;
      const { data, error } = await db.from('products').update(changes).eq('id', id).select('*, variants(*)').single();
      if (error) {
        console.error('[catalog/products/[id] PATCH]', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ product: data });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[catalog/products/[id] PATCH]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;
      const { error } = await db.from('products').delete().eq('id', id);
      if (error) {
        console.error('[catalog/products/[id] DELETE]', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[catalog/products/[id] DELETE]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

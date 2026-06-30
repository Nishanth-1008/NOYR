import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.json({ products: [], source: 'local' });
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase-server');
    const db = getSupabaseAdmin() as any;
    const { data, error } = await db
      .from('products')
      .select('*, variants(*)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[catalog/products GET]', error);
      return NextResponse.json({ products: [], source: 'error', message: error.message });
    }
    return NextResponse.json({ products: data ?? [], source: 'supabase' });
  } catch (err) {
    console.error('[catalog/products GET]', err);
    return NextResponse.json({ products: [], source: 'error' });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.title || !body.price) return NextResponse.json({ error: 'title and price required' }, { status: 400 });

    // collection_id must be null (not '') to satisfy the FK / nullable column
    const collectionId = body.collection_id && body.collection_id !== '' ? body.collection_id : null;

    const product = {
      id: body.id ?? `prod-${Date.now().toString(36)}`,
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: body.description ?? '',
      story: body.story ?? '',
      price: Number(body.price),
      images: Array.isArray(body.images) ? body.images : [],
      category: body.category ?? 'tops',
      collection_id: collectionId,
      active: body.active ?? true,
      limited: body.limited ?? false,
      drop_date: body.drop_date || null,
      details: Array.isArray(body.details) ? body.details : [],
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;
      const { data, error } = await db.from('products').insert(product).select().single();
      if (error) {
        console.error('[catalog/products POST]', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ product: { ...data, variants: [] } }, { status: 201 });
    }

    return NextResponse.json({ product: { ...product, variants: [], created_at: new Date().toISOString() } }, { status: 201 });
  } catch (err) {
    console.error('[catalog/products POST]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

function auth(req: NextRequest) {
  const key = req.headers.get('x-admin-key');
  return key === process.env.ADMIN_SECRET || key === process.env.ADMIN_PASSWORD || key === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'noyr2025');
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.json({ products: [], source: 'local' });
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase-server');
    const db = getSupabaseAdmin() as any;
    const { data } = await db.from('products').select('*, variants(*)').order('created_at', { ascending: false });
    return NextResponse.json({ products: data ?? [], source: 'supabase' });
  } catch {
    return NextResponse.json({ products: [], source: 'error' });
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.title || !body.price) return NextResponse.json({ error: 'title and price required' }, { status: 400 });
    const product = {
      id: body.id ?? `prod-${Date.now().toString(36)}`,
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: body.description ?? '',
      story: body.story ?? '',
      price: Number(body.price),
      images: Array.isArray(body.images) ? body.images : [],
      category: body.category ?? 'tops',
      collection_id: body.collection_id ?? '',
      active: body.active ?? true,
      limited: body.limited ?? false,
      drop_date: body.drop_date ?? null,
      details: Array.isArray(body.details) ? body.details : [],
      created_at: new Date().toISOString(),
    };
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;
      await db.from('products').insert(product);
    }
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error('[catalog/products POST]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

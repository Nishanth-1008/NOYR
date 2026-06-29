import { NextRequest, NextResponse } from 'next/server';

function auth(req: NextRequest) {
  const key = req.headers.get('x-admin-key');
  return key === process.env.ADMIN_SECRET || key === process.env.ADMIN_PASSWORD || key === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'noyr2025');
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.json({ collections: [], source: 'local' });
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase-server');
    const db = getSupabaseAdmin() as any;
    const { data } = await db.from('collections').select('*').order('created_at', { ascending: false });
    return NextResponse.json({ collections: data ?? [] });
  } catch {
    return NextResponse.json({ collections: [] });
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.title) return NextResponse.json({ error: 'title required' }, { status: 400 });
    const collection = {
      id: body.id ?? `col-${Date.now().toString(36)}`,
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      hero_text: body.hero_text ?? '',
      banner_image: body.banner_image ?? '',
      description: body.description ?? '',
      created_at: new Date().toISOString(),
    };
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;
      await db.from('collections').insert(collection);
    }
    return NextResponse.json({ collection }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

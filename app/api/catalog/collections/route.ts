import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.json({ collections: [], source: 'local' });
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase-server');
    const db = getSupabaseAdmin() as any;
    const { data, error } = await db.from('collections').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('[catalog/collections GET]', error);
      return NextResponse.json({ collections: [], source: 'error', message: error.message });
    }
    return NextResponse.json({ collections: data ?? [], source: 'supabase' });
  } catch (err) {
    console.error('[catalog/collections GET]', err);
    return NextResponse.json({ collections: [], source: 'error' });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    };
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;
      const { data, error } = await db.from('collections').insert(collection).select().single();
      if (error) {
        console.error('[catalog/collections POST]', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ collection: data }, { status: 201 });
    }
    return NextResponse.json({ collection: { ...collection, created_at: new Date().toISOString() } }, { status: 201 });
  } catch (err) {
    console.error('[catalog/collections POST]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

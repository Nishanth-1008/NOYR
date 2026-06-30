import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.json({ collections: [], source: 'local' });
  try {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const db = getSupabaseClient() as any;
    const { data, error } = await db
      .from('collections')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[storefront/collections GET]', error);
      return NextResponse.json({ collections: [], source: 'error' });
    }
    return NextResponse.json({ collections: data ?? [], source: 'supabase' });
  } catch (err) {
    console.error('[storefront/collections GET]', err);
    return NextResponse.json({ collections: [], source: 'error' });
  }
}

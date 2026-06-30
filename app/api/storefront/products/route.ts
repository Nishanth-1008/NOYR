import { NextResponse } from 'next/server';

/**
 * Public, unauthenticated catalog read used by the storefront.
 * Returns only active products. Falls back to an empty list (the
 * caller falls back to the static seed data) when Supabase isn't
 * configured or the query fails — it never 401s, since shoppers
 * don't have (and shouldn't need) the admin key.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.json({ products: [], source: 'local' });
  try {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const db = getSupabaseClient() as any;
    const { data, error } = await db
      .from('products')
      .select('*, variants(*)')
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[storefront/products GET]', error);
      return NextResponse.json({ products: [], source: 'error' });
    }
    return NextResponse.json({ products: data ?? [], source: 'supabase' });
  } catch (err) {
    console.error('[storefront/products GET]', err);
    return NextResponse.json({ products: [], source: 'error' });
  }
}

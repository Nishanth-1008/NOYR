import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const product_id = searchParams.get('product_id');
  if (!product_id) return NextResponse.json({ reviews: [] });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.json({ reviews: [] });

  const { getSupabaseAdmin } = await import('@/lib/supabase-server');
  const db = getSupabaseAdmin() as any;

  const { data } = await db
    .from('reviews')
    .select('*')
    .eq('product_id', product_id)
    .eq('approved', true)
    .order('created_at', { ascending: false });

  return NextResponse.json({ reviews: data ?? [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, customer_name, rating, body: reviewBody, size_purchased } = body;

    if (!product_id || !customer_name || !rating || !reviewBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    const review = {
      id: uuid(),
      product_id,
      customer_name: customer_name.trim().slice(0, 80),
      rating: Math.round(rating),
      body: reviewBody.trim().slice(0, 1000),
      size_purchased: size_purchased?.trim() ?? null,
      verified_purchase: false,
      approved: false, // Admin must approve
      created_at: new Date().toISOString(),
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;
      await db.from('reviews').insert(review);
    }

    // Return the review optimistically (will appear after approval in production)
    return NextResponse.json({ review: { ...review, approved: true } });
  } catch (err) {
    console.error('[reviews/POST]', err);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

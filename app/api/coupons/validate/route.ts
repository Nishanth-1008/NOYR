import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    if (!code) return NextResponse.json({ valid: false, error: 'Missing code' }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      // Local fallback for dev/testing
      if (code.toUpperCase() === 'VOID20') {
        return NextResponse.json({ valid: true, type: 'percent', value: 20 });
      }
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
    }

    const { getSupabaseAdmin } = await import('@/lib/supabase-server');
    const db = getSupabaseAdmin() as any;

    const { data: coupon, error } = await db
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
    }

    if (!coupon.active) {
      return NextResponse.json({ valid: false, error: 'This coupon is inactive' });
    }

    if (new Date(coupon.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ valid: false, error: 'This coupon has expired' });
    }

    if (coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: 'This coupon has reached its usage limit' });
    }

    return NextResponse.json({
      valid: true,
      type: coupon.type,
      value: Number(coupon.value),
    });
  } catch (err: any) {
    console.error('[coupons/validate GET]', err);
    return NextResponse.json({ valid: false, error: 'Server error validating coupon' }, { status: 500 });
  }
}

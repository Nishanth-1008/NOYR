import { NextRequest, NextResponse } from 'next/server';

function generateCode(name: string): string {
  const slug = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${slug}-${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const code = generateCode(name);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;

      // Return existing code if already registered
      const { data: existing } = await db
        .from('referrals')
        .select('code')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) return NextResponse.json({ code: existing.code });

      await db.from('referrals').insert({
        email: email.toLowerCase(),
        name,
        code,
        uses: 0,
        reward_pending: false,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ code });
  } catch (err) {
    console.error('[referral/POST]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.json({ valid: false });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.json({ valid: true, discount: 0 });

  const { getSupabaseAdmin } = await import('@/lib/supabase-server');
  const db = getSupabaseAdmin() as any;

  const { data } = await db
    .from('referrals')
    .select('code, uses')
    .eq('code', code.toUpperCase())
    .single();

  if (!data) return NextResponse.json({ valid: false });
  return NextResponse.json({ valid: true, discount: 5, code: data.code }); // 5% discount
}

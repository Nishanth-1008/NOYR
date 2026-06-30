import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.json({ coupons: [], source: 'local' });
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase-server');
    const db = getSupabaseAdmin() as any;
    const { data, error } = await db.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('[coupons GET]', error);
      return NextResponse.json({ coupons: [], source: 'error' });
    }
    return NextResponse.json({ coupons: data ?? [], source: 'supabase' });
  } catch (err) {
    console.error('[coupons GET]', err);
    return NextResponse.json({ coupons: [], source: 'error' });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.code) return NextResponse.json({ error: 'code required' }, { status: 400 });
    const coupon = {
      code: String(body.code).toUpperCase().trim(),
      type: body.type === 'flat' ? 'flat' : 'percent',
      value: Number(body.value ?? 0),
      max_uses: Number(body.maxUses ?? body.max_uses ?? 100),
      used_count: 0,
      active: true,
      expires_at: body.expiresAt || body.expires_at || new Date(Date.now() + 30 * 86400000).toISOString(),
    };
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;
      const { data, error } = await db.from('coupons').insert(coupon).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ coupon: data }, { status: 201 });
    }
    return NextResponse.json({ coupon: { ...coupon, created_at: new Date().toISOString() } }, { status: 201 });
  } catch (err) {
    console.error('[coupons POST]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { code, ...changes } = body;
    if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;
      const { data, error } = await db.from('coupons').update(changes).eq('code', code).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ coupon: data });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[coupons PATCH]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      const db = getSupabaseAdmin() as any;
      const { error } = await db.from('coupons').delete().eq('code', code);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[coupons DELETE]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

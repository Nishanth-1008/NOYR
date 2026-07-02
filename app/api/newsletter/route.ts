import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      // Local dev fallback
      return NextResponse.json({ success: true, message: 'Subscribed locally' });
    }

    const { getSupabaseAdmin } = await import('@/lib/supabase-server');
    const db = getSupabaseAdmin() as any;

    const { error } = await db
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase() });

    if (error) {
      if (error.code === '23505') {
        // Unique violation — already subscribed
        return NextResponse.json({ success: true, message: 'You are already subscribed to the newsletter' });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Successfully subscribed to the newsletter' });
  } catch (err: any) {
    console.error('[newsletter POST]', err);
    return NextResponse.json({ success: false, error: 'Server error subscribing to newsletter' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * Upload endpoint for files.
 * Stores to Supabase Storage when configured; returns a mock URL otherwise.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'payment-screenshots';
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      // MVP fallback — return placeholder
      return NextResponse.json({ url: `/uploads/${folder}/${file.name}` });
    }

    const { getSupabaseAdmin } = await import('@/lib/supabase-server');
    const admin = getSupabaseAdmin();

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext    = file.name.split('.').pop() ?? 'jpg';
    const path   = `${folder}/${Date.now()}.${ext}`;

    const { error } = await admin.storage
      .from('noyr-uploads')
      .upload(path, buffer, { contentType: file.type });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data } = admin.storage.from('noyr-uploads').getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err: any) {
    console.error('[upload POST]', err);
    return NextResponse.json({ error: err.message ?? 'Upload failed' }, { status: 500 });
  }
}

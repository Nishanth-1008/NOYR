import { NextRequest } from 'next/server';

/**
 * Shared admin auth check used by every protected API route.
 * Accepts ADMIN_SECRET, ADMIN_PASSWORD (server-only secrets) or
 * NEXT_PUBLIC_ADMIN_PASSWORD (the one the admin UI actually has access to
 * in the browser). Keeping all three in sync here means every route checks
 * the same set of accepted keys — previously some routes only checked
 * ADMIN_SECRET/ADMIN_PASSWORD which meant the browser's key (always
 * NEXT_PUBLIC_ADMIN_PASSWORD) was silently rejected.
 */
export function isAdminAuthed(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key');
  if (!key) return false;
  return (
    key === process.env.ADMIN_SECRET ||
    key === process.env.ADMIN_PASSWORD ||
    key === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'noyr2025')
  );
}

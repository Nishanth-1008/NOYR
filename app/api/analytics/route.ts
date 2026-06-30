import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { getSupabaseAdmin } = await import('@/lib/supabase-server');
  const db = getSupabaseAdmin() as any;

  // Fetch all orders and items
  const { data: orders = [] } = await db
    .from('orders')
    .select('id, total, status, payment_status, created_at')
    .order('created_at', { ascending: true });

  const { data: items = [] } = await db
    .from('order_items')
    .select('product_id, product_title, quantity, unit_price');

  const { data: restockNotifications = [] } = await db
    .from('restock_notifications')
    .select('id');

  const { data: reviews = [] } = await db
    .from('reviews')
    .select('id, rating');

  // Compute metrics
  const verifiedOrders = orders.filter((o: any) => o.payment_status === 'verified');
  const totalRevenue = verifiedOrders.reduce((s: number, o: any) => s + Number(o.total), 0);
  const avgOrderValue = verifiedOrders.length ? totalRevenue / verifiedOrders.length : 0;

  // Revenue by day (last 30 days)
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const revenueByDay: Record<string, number> = {};
  for (const order of verifiedOrders) {
    const d = new Date(order.created_at);
    if (d.getTime() < thirtyDaysAgo) continue;
    const key = d.toISOString().slice(0, 10);
    revenueByDay[key] = (revenueByDay[key] ?? 0) + Number(order.total);
  }

  // Top products
  const productTotals: Record<string, { title: string; quantity: number; revenue: number }> = {};
  for (const item of items) {
    if (!productTotals[item.product_id]) {
      productTotals[item.product_id] = { title: item.product_title, quantity: 0, revenue: 0 };
    }
    productTotals[item.product_id].quantity += item.quantity;
    productTotals[item.product_id].revenue += Number(item.unit_price) * item.quantity;
  }
  const topProducts = Object.values(productTotals)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Order status breakdown
  const statusBreakdown: Record<string, number> = {};
  for (const order of orders) {
    statusBreakdown[order.status] = (statusBreakdown[order.status] ?? 0) + 1;
  }

  // Average rating
  const avgRating = reviews.length
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : null;

  return NextResponse.json({
    summary: {
      total_orders: orders.length,
      verified_orders: verifiedOrders.length,
      total_revenue: totalRevenue,
      avg_order_value: avgOrderValue,
      pending_payment: orders.filter((o: any) => o.payment_status === 'submitted').length,
      restock_requests: restockNotifications.length,
      avg_rating: avgRating,
      total_reviews: reviews.length,
    },
    revenue_by_day: Object.entries(revenueByDay)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    top_products: topProducts,
    status_breakdown: statusBreakdown,
  });
}

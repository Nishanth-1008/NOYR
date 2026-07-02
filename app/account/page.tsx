'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase-browser';
import { Order } from '@/types';
import { LogOut, Package, RefreshCw, ShoppingBag } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  referral_code: string | null;
}

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadAccountData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (prof) setProfile(prof as Profile);

      const { data: ords } = await supabase
        .from('orders')
        .select('*, order_items(*), payments(*)')
        .order('created_at', { ascending: false });

      if (ords) {
        const normalized = ords.map((row: any) => ({
          id: row.id,
          customer_name: row.customer_name,
          phone: row.phone,
          email: row.email,
          address: row.address,
          city: row.city,
          pincode: row.pincode,
          total: Number(row.total),
          status: row.status,
          payment_status: row.payment_status,
          items: (row.order_items ?? []).map((i: any) => ({
            id: i.id,
            order_id: i.order_id,
            product_id: i.product_id,
            product_title: i.product_title,
            variant_id: i.variant_id,
            size: i.size,
            quantity: i.quantity,
            unit_price: Number(i.unit_price),
          })),
          payment: row.payments?.[0]
            ? {
                id: row.payments[0].id,
                order_id: row.payments[0].order_id,
                payment_method: row.payments[0].payment_method,
                transaction_id: row.payments[0].transaction_id,
                screenshot_url: row.payments[0].screenshot_url ?? undefined,
                verified: row.payments[0].verified,
              }
            : undefined,
          created_at: row.created_at,
          notes: row.notes ?? undefined,
          tracking_id: row.tracking_id ?? undefined,
        }));
        setOrders(normalized);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (user) {
      loadAccountData();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
      payment_received: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
      processing: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
      shipped: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5',
      delivered: 'text-green-400 border-green-400/30 bg-green-400/5',
      cancelled: 'text-red-400 border-red-400/30 bg-red-400/5',
    };
    return colors[status] ?? 'text-white/40 border-white/10';
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-24 text-white">
      <div className="max-w-[1100px] mx-auto px-8 md:px-16 py-16">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/8 pb-10 mb-12">
          <div className="flex items-center gap-5">
            {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
              <img
                src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                alt="Avatar"
                className="w-16 h-16 rounded-full border border-white/10"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                <span className="text-xl font-bold text-white/45">{(profile?.full_name || user?.user_metadata?.full_name || 'U').slice(0, 1)}</span>
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-black tracking-wide">
                {profile?.full_name || user?.user_metadata?.full_name || 'NOYR USER'}
              </h1>
              <p className="text-xs text-white/35 font-mono mt-1">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadAccountData}
              className="flex items-center gap-2 border border-white/10 hover:border-white/30 px-4 py-2.5 text-[10px] tracking-[0.2em] text-white/40 hover:text-white transition-all font-semibold"
            >
              <RefreshCw size={11} className={loadingData ? 'animate-spin' : ''} /> REFRESH
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 border border-red-500/15 hover:border-red-500/30 px-4 py-2.5 text-[10px] tracking-[0.2em] text-red-400/60 hover:text-red-400 transition-all font-semibold"
            >
              <LogOut size={11} /> SIGN OUT
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs tracking-[0.4em] text-white/30 font-semibold mb-6 flex items-center gap-2">
              <ShoppingBag size={13} /> ORDER HISTORY ({orders.length})
            </h2>

            {loadingData ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-zinc-950 border border-white/5 p-6 animate-pulse h-36" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-white/8 p-16 text-center">
                <p className="text-white/20 text-sm tracking-widest mb-4">NO ORDERS YET</p>
                <a href="/collections" className="text-xs text-white underline tracking-widest font-semibold">
                  SHOP NEW COLLECTION
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-zinc-950 border border-white/5 hover:border-white/10 transition-colors p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] tracking-widest text-white/35 font-mono">ORDER ID</p>
                        <p className="text-sm font-semibold text-white/80 font-mono mt-0.5">{order.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] tracking-widest text-white/35">TOTAL</p>
                        <p className="text-sm font-semibold text-white mt-0.5">{formatPrice(order.total)}</p>
                      </div>
                    </div>

                    <div className="border-t border-b border-white/5 py-3 my-3 space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-xs">
                          <span className="text-white/50">{item.product_title} (Size {item.size}) × {item.quantity}</span>
                          <span className="text-white/35">{formatPrice(item.unit_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <span className={`text-[9px] tracking-[0.2em] font-semibold border px-2 py-0.5 ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-[10px] text-white/25">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {order.tracking_id && (
                      <div className="mt-4 pt-3 border-t border-white/5 text-[10px] tracking-widest text-cyan-400">
                        TRACKING ID: <span className="font-mono text-white ml-1">{order.tracking_id}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xs tracking-[0.4em] text-white/30 font-semibold mb-6 flex items-center gap-2">
              <Package size={13} /> MEMBERSHIP INFO
            </h2>

            <div className="bg-zinc-950 border border-white/5 p-6 space-y-4">
              <div>
                <p className="text-[9px] tracking-[0.3em] text-white/25">LOYALTY STATUS</p>
                <p className="text-sm font-semibold mt-1">MEMBER</p>
              </div>
              <div className="border-t border-white/5 pt-4">
                <p className="text-[9px] tracking-[0.3em] text-white/25">BENEFITS</p>
                <ul className="text-[11px] text-white/40 space-y-1.5 mt-2">
                  <li className="flex gap-2"><span className="text-[#cc0000]">✦</span> Verified purchase history tracking</li>
                  <li className="flex gap-2"><span className="text-[#cc0000]">✦</span> Easy order status tracking</li>
                  <li className="flex gap-2"><span className="text-[#cc0000]">✦</span> Point conversion to discounts</li>
                </ul>
              </div>
              <div className="border-t border-white/5 pt-4">
                <a
                  href="/rewards"
                  className="w-full block text-center bg-white text-black py-2.5 text-[10px] tracking-[0.2em] font-semibold hover:bg-white/90 transition-colors"
                >
                  ACCESS REWARDS PANEL
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

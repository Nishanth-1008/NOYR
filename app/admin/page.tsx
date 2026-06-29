'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, Truck, Package, XCircle,
  RefreshCw, Search, LogOut, ChevronDown, ExternalLink,
  BarChart3, TrendingUp, Star, Bell, Layers, Database,
  Plus, Trash2, Save, Edit2, Eye, EyeOff, ChevronRight,
  AlertTriangle, Tag,
} from 'lucide-react';
import { Order, Product, Collection, Variant } from '@/types';
import { getLocalOrders, updateLocalOrder } from '@/lib/orders';
import {
  getLocalProducts, createLocalProduct, updateLocalProduct, deleteLocalProduct,
  getLocalCollections, createLocalCollection, updateLocalCollection, deleteLocalCollection,
  addVariantToProduct, updateVariant, deleteVariant,
} from '@/lib/catalog';

/* ─── types ─────────────────────────────────────────────────────── */

interface AnalyticsData {
  summary: {
    total_orders: number; verified_orders: number; total_revenue: number;
    avg_order_value: number; pending_payment: number; restock_requests: number;
    avg_rating: number | null; total_reviews: number;
  };
  revenue_by_day: { date: string; revenue: number }[];
  top_products: { title: string; quantity: number; revenue: number }[];
  status_breakdown: Record<string, number>;
}

type TabKey = 'orders' | 'products' | 'collections' | 'stock' | 'analytics' | 'coupons' | 'audit';
type StatusFilter = Order['status'] | 'all';
type PayFilter = Order['payment_status'] | 'all';

/* ─── constants ──────────────────────────────────────────────────── */

const ORDER_STATUSES: Order['status'][] = ['pending','payment_received','processing','shipped','delivered','cancelled'];
const PAY_STATUSES: Order['payment_status'][] = ['pending','submitted','verified','failed'];
const CATEGORIES = ['tops','hoodies','bottoms','outerwear','accessories'];
const SIZES = ['XS','S','M','L','XL','XXL'];

const STATUS_ICON: Record<Order['status'], React.ReactNode> = {
  pending: <Clock size={11} />, payment_received: <CheckCircle2 size={11} />,
  processing: <Package size={11} />, shipped: <Truck size={11} />,
  delivered: <CheckCircle2 size={11} />, cancelled: <XCircle size={11} />,
};
const STATUS_COLOR: Record<Order['status'], string> = {
  pending: 'text-yellow-400 border-yellow-400/40', payment_received: 'text-blue-400 border-blue-400/40',
  processing: 'text-purple-400 border-purple-400/40', shipped: 'text-cyan-400 border-cyan-400/40',
  delivered: 'text-green-400 border-green-400/40', cancelled: 'text-red-400 border-red-400/40',
};
const PAY_COLOR: Record<Order['payment_status'], string> = {
  pending: 'text-white/30 border-white/15', submitted: 'text-yellow-400 border-yellow-400/40',
  verified: 'text-green-400 border-green-400/40', failed: 'text-red-400 border-red-400/40',
};

/* ─── shared UI ──────────────────────────────────────────────────── */

const Input = ({ label, value, onChange, placeholder = '', type = 'text', className = '' }: {
  label: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string; className?: string;
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[10px] tracking-[0.3em] text-white/30">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-black border border-white/10 focus:border-white/30 text-white text-sm px-3 py-2.5 outline-none transition-colors placeholder:text-white/15"
    />
  </div>
);

const Textarea = ({ label, value, onChange, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] tracking-[0.3em] text-white/30">{label}</label>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className="bg-black border border-white/10 focus:border-white/30 text-white text-sm px-3 py-2.5 outline-none transition-colors placeholder:text-white/15 resize-none"
    />
  </div>
);

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 transition-colors ${checked ? 'bg-white' : 'bg-white/10'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-black transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
    <span className="text-xs text-white/50">{label}</span>
  </div>
);

const Btn = ({ children, onClick, variant = 'ghost', disabled = false, className = '' }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: 'primary' | 'danger' | 'ghost'; disabled?: boolean; className?: string;
}) => {
  const base = 'flex items-center gap-1.5 px-3 py-2 text-[11px] tracking-[0.15em] font-medium transition-colors disabled:opacity-30';
  const styles = {
    primary: 'bg-white text-black hover:bg-white/90',
    danger: 'border border-red-400/30 text-red-400 hover:bg-red-400/10',
    ghost: 'border border-white/10 text-white/50 hover:text-white hover:border-white/30',
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};

/* ─── sub-panels ─────────────────────────────────────────────────── */

function ProductForm({
  product, collections, onSave, onDelete, onClose,
}: {
  product: Product | null;
  collections: Collection[];
  onSave: (p: Product) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const isNew = !product?.id;
  const [form, setForm] = useState<Partial<Product>>({
    title: '', slug: '', description: '', story: '', price: 0,
    category: 'hoodies', collection_id: '', active: true, limited: false,
    drop_date: '', images: [], details: [],
    ...product,
  });
  const [imagesText, setImagesText] = useState((product?.images ?? []).join('\n'));
  const [detailsText, setDetailsText] = useState((product?.details ?? []).join('\n'));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof Product) => (v: string | boolean | number) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.price) return;
    setSaving(true);
    const payload: Partial<Product> = {
      ...form,
      images: imagesText.split('\n').map(s => s.trim()).filter(Boolean),
      details: detailsText.split('\n').map(s => s.trim()).filter(Boolean),
    };
    let result: Product | null;
    if (isNew) {
      result = createLocalProduct(payload as Omit<Product, 'id' | 'variants'>);
    } else {
      result = updateLocalProduct(product!.id, payload);
    }
    if (result) {
      // fire-and-forget API sync
      const method = isNew ? 'POST' : 'PATCH';
      const url = isNew ? '/api/catalog/products' : `/api/catalog/products/${result.id}`;
      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'noyr2025' },
        body: JSON.stringify(result),
      }).catch(() => {});
      onSave(result);
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-[0.4em] text-white/25">{isNew ? 'NEW PRODUCT' : 'EDIT PRODUCT'}</p>
        <div className="flex gap-2">
          {!isNew && !confirmDelete && (
            <Btn variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 size={11} /> DELETE</Btn>
          )}
          {confirmDelete && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Confirm?</span>
              <Btn variant="danger" onClick={() => { onDelete(product!.id); setConfirmDelete(false); }}>YES, DELETE</Btn>
              <Btn onClick={() => setConfirmDelete(false)}>CANCEL</Btn>
            </div>
          )}
          <Btn variant="primary" onClick={handleSave} disabled={saving}>
            <Save size={11} /> {saving ? 'SAVING…' : 'SAVE'}
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="TITLE" value={form.title ?? ''} onChange={v => { set('title')(v); set('slug')(v.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} className="col-span-2" />
        <Input label="SLUG" value={form.slug ?? ''} onChange={set('slug')} />
        <Input label="PRICE (₹)" value={form.price ?? ''} onChange={v => set('price')(Number(v))} type="number" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] tracking-[0.3em] text-white/30">CATEGORY</label>
          <select
            value={form.category ?? 'hoodies'}
            onChange={e => set('category')(e.target.value)}
            className="bg-black border border-white/10 focus:border-white/30 text-white text-sm px-3 py-2.5 outline-none"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] tracking-[0.3em] text-white/30">COLLECTION</label>
          <select
            value={form.collection_id ?? ''}
            onChange={e => set('collection_id')(e.target.value)}
            className="bg-black border border-white/10 focus:border-white/30 text-white text-sm px-3 py-2.5 outline-none"
          >
            <option value="">— None —</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </div>

      <Textarea label="DESCRIPTION" value={form.description ?? ''} onChange={set('description')} rows={3} />
      <Textarea label="STORY (displayed on product page)" value={form.story ?? ''} onChange={set('story')} rows={2} />

      <div className="flex flex-col gap-1">
        <label className="text-[10px] tracking-[0.3em] text-white/30">IMAGE URLS (one per line)</label>
        <textarea
          value={imagesText}
          onChange={e => setImagesText(e.target.value)}
          rows={3}
          placeholder="/images/hoodie-1.jpg&#10;https://cdn.example.com/photo.jpg"
          className="bg-black border border-white/10 focus:border-white/30 text-white text-xs px-3 py-2.5 outline-none resize-none font-mono placeholder:text-white/15 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] tracking-[0.3em] text-white/30">FABRIC DETAILS (one per line)</label>
        <textarea
          value={detailsText}
          onChange={e => setDetailsText(e.target.value)}
          rows={4}
          placeholder="450gsm heavyweight cotton fleece&#10;Oversized dropped-shoulder fit"
          className="bg-black border border-white/10 focus:border-white/30 text-white text-xs px-3 py-2.5 outline-none resize-none placeholder:text-white/15 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="DROP DATE (ISO)" value={form.drop_date ?? ''} onChange={set('drop_date')} placeholder="2026-08-01T12:00:00.000Z" />
      </div>

      <div className="flex gap-6 pt-2 border-t border-white/8">
        <Toggle label="Active (visible on storefront)" checked={form.active ?? true} onChange={set('active')} />
        <Toggle label="Limited drop" checked={form.limited ?? false} onChange={set('limited')} />
      </div>
    </div>
  );
}

/* ─── CollectionForm ─────────────────────────────────────────────── */

function CollectionForm({
  collection, products, onSave, onDelete,
}: {
  collection: Collection | null;
  products: Product[];
  onSave: (c: Collection) => void;
  onDelete: (id: string) => void;
}) {
  const isNew = !collection?.id;
  const [form, setForm] = useState<Partial<Collection>>({
    title: '', slug: '', hero_text: '', banner_image: '', description: '',
    ...collection,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof Collection) => (v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const linkedProducts = products.filter(p => p.collection_id === collection?.id);

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    let result: Collection | null;
    if (isNew) {
      result = createLocalCollection(form);
    } else {
      result = updateLocalCollection(collection!.id, form);
    }
    if (result) {
      const method = isNew ? 'POST' : 'PATCH';
      const url = isNew ? '/api/catalog/collections' : `/api/catalog/collections/${result.id}`;
      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'noyr2025' },
        body: JSON.stringify(result),
      }).catch(() => {});
      onSave(result);
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-[0.4em] text-white/25">{isNew ? 'NEW COLLECTION' : 'EDIT COLLECTION'}</p>
        <div className="flex gap-2">
          {!isNew && !confirmDelete && (
            <Btn variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 size={11} /> DELETE</Btn>
          )}
          {confirmDelete && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Confirm?</span>
              <Btn variant="danger" onClick={() => { onDelete(collection!.id); setConfirmDelete(false); }}>YES</Btn>
              <Btn onClick={() => setConfirmDelete(false)}>CANCEL</Btn>
            </div>
          )}
          <Btn variant="primary" onClick={handleSave} disabled={saving}>
            <Save size={11} /> {saving ? 'SAVING…' : 'SAVE'}
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="TITLE" value={form.title ?? ''} onChange={v => { set('title')(v); set('slug')(v.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} className="col-span-2" />
        <Input label="SLUG" value={form.slug ?? ''} onChange={set('slug')} className="col-span-2" />
      </div>
      <Input label="HERO TEXT (large headline on collection page)" value={form.hero_text ?? ''} onChange={set('hero_text')} />
      <Input label="BANNER IMAGE URL" value={form.banner_image ?? ''} onChange={set('banner_image')} placeholder="/images/collection-void.jpg" />
      <Textarea label="DESCRIPTION" value={form.description ?? ''} onChange={set('description')} rows={4} />

      {/* URL preview */}
      <div className="bg-white/3 border border-white/8 px-4 py-3 text-xs text-white/30 font-mono">
        /collections/{form.slug || 'slug-preview'}
      </div>

      {/* Linked products */}
      {!isNew && (
        <div className="border-t border-white/8 pt-4">
          <p className="text-[10px] tracking-[0.3em] text-white/25 mb-3">LINKED PRODUCTS ({linkedProducts.length})</p>
          {linkedProducts.length === 0 ? (
            <p className="text-white/20 text-xs">No products assigned to this collection.</p>
          ) : (
            <div className="space-y-1">
              {linkedProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-white/60">{p.title}</span>
                  <span className={`text-[10px] tracking-widest ${p.active ? 'text-green-400/60' : 'text-white/20'}`}>
                    {p.active ? 'ACTIVE' : 'HIDDEN'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── StockTab ───────────────────────────────────────────────────── */

function StockTab({ products, onRefresh, adminKey }: { products: Product[]; onRefresh: () => void; adminKey: string }) {
  const [filterProductId, setFilterProductId] = useState('all');
  const [showOOS, setShowOOS] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [notifying, setNotifying] = useState<string | null>(null);
  const [editStocks, setEditStocks] = useState<Record<string, string>>({});

  type VariantRow = { product: Product; variant: Variant };

  const rows: VariantRow[] = products
    .filter(p => filterProductId === 'all' || p.id === filterProductId)
    .flatMap(p => p.variants.map(v => ({ product: p, variant: v })))
    .filter(r => !showOOS || r.variant.stock === 0);

  const getStock = (vid: string, fallback: number) =>
    editStocks[vid] !== undefined ? editStocks[vid] : String(fallback);

  const saveVariant = async (productId: string, variantId: string, stockStr: string, notifyRestock = false) => {
    const stock = Number(stockStr);
    setSaving(variantId);
    updateVariant(productId, variantId, { stock });
    fetch('/api/catalog/variants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ variant_id: variantId, product_id: productId, stock, notify_restock: notifyRestock }),
    }).catch(() => {});
    if (notifyRestock) { setNotifying(variantId); setTimeout(() => setNotifying(null), 2000); }
    setEditStocks(s => { const n = { ...s }; delete n[variantId]; return n; });
    onRefresh();
    setSaving(null);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={filterProductId}
          onChange={e => setFilterProductId(e.target.value)}
          className="bg-[#0a0a0a] border border-white/8 text-white/60 text-xs px-3 py-2 outline-none focus:border-white/25"
        >
          <option value="all">All Products</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <button
          onClick={() => setShowOOS(v => !v)}
          className={`flex items-center gap-2 text-xs tracking-widest px-3 py-2 border transition-colors ${showOOS ? 'border-red-400/40 text-red-400' : 'border-white/10 text-white/40 hover:text-white'}`}
        >
          <AlertTriangle size={11} /> OOS ONLY
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/8">
              {['PRODUCT','SKU','SIZE','COLOR','STOCK','PRICE',''].map(h => (
                <th key={h} className="text-left py-3 px-3 text-[10px] tracking-[0.3em] text-white/25 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-white/20 text-xs tracking-widest">NO VARIANTS FOUND</td></tr>
            ) : rows.map(({ product, variant }) => {
              const oos = variant.stock === 0;
              const low = variant.stock > 0 && variant.stock <= 3;
              const stockVal = getStock(variant.id, variant.stock);
              const isDirty = editStocks[variant.id] !== undefined;
              const wasOOS = variant.stock === 0 && Number(stockVal) > 0;
              return (
                <tr
                  key={variant.id}
                  className={`border-b border-white/5 hover:bg-white/2 transition-colors ${oos ? 'opacity-50' : ''} ${low ? 'bg-yellow-400/3' : ''}`}
                >
                  <td className="py-3 px-3 text-white/70 max-w-[180px] truncate">{product.title}</td>
                  <td className="py-3 px-3 text-white/30 font-mono text-[10px]">{variant.sku}</td>
                  <td className="py-3 px-3">
                    <span className="border border-white/15 text-white/60 px-2 py-0.5 text-[10px] tracking-widest">{variant.size}</span>
                  </td>
                  <td className="py-3 px-3 text-white/40">{variant.color}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={stockVal}
                        onChange={e => setEditStocks(s => ({ ...s, [variant.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && saveVariant(product.id, variant.id, stockVal)}
                        className={`w-16 bg-black border text-white text-xs px-2 py-1.5 outline-none transition-colors text-center
                          ${isDirty ? 'border-white/40' : oos ? 'border-red-400/30 text-red-400' : low ? 'border-yellow-400/30 text-yellow-400' : 'border-white/10'}`}
                      />
                      {oos && <span className="text-[9px] text-red-400 tracking-widest">OOS</span>}
                      {low && !oos && <span className="text-[9px] text-yellow-400 tracking-widest">LOW</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-white/50">₹{variant.price.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1.5">
                      {isDirty && (
                        <button
                          onClick={() => saveVariant(product.id, variant.id, stockVal, wasOOS)}
                          disabled={saving === variant.id}
                          className="flex items-center gap-1 text-[10px] tracking-widest bg-white text-black px-2.5 py-1 hover:bg-white/90 transition-colors disabled:opacity-50"
                        >
                          {saving === variant.id ? '…' : <><Save size={10} /> SAVE</>}
                        </button>
                      )}
                      {notifying === variant.id && (
                        <span className="text-[10px] text-green-400 tracking-widest flex items-center gap-1">
                          <Bell size={10} /> NOTIFIED
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-white/20 mt-4 tracking-wider">
        Edit stock inline → press Enter or click SAVE. When restocking a zero-stock variant, restock notification emails fire automatically.
      </p>
    </div>
  );
}

/* ─── AnalyticsTab ───────────────────────────────────────────────── */

function AnalyticsTab({ adminKey, formatPrice }: { adminKey: string; formatPrice: (n: number) => string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json()).then(setAnalytics).catch(() => {}).finally(() => setLoading(false));
  }, [adminKey]);

  if (loading) return <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-[#0a0a0a] border border-white/6 p-5 animate-pulse h-24" />)}</div>;
  if (!analytics) return <p className="text-white/20 text-xs tracking-widest py-20 text-center">CONNECT SUPABASE TO VIEW ANALYTICS</p>;

  const { summary, revenue_by_day, top_products, status_breakdown } = analytics;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'TOTAL REVENUE', value: formatPrice(summary.total_revenue), icon: <TrendingUp size={13} /> },
          { label: 'TOTAL ORDERS', value: String(summary.total_orders), icon: <Package size={13} /> },
          { label: 'AVG ORDER', value: formatPrice(summary.avg_order_value), icon: <BarChart3 size={13} /> },
          { label: 'RESTOCK REQUESTS', value: String(summary.restock_requests), icon: <Bell size={13} /> },
        ].map(s => (
          <div key={s.label} className="bg-[#0a0a0a] border border-white/6 p-5">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] tracking-[0.3em] text-white/25">{s.label}</p>
              <span className="text-white/20">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {summary.avg_rating !== null && (
        <div className="bg-[#0a0a0a] border border-white/6 p-5 inline-flex items-center gap-4">
          <Star size={16} className="text-white/30" />
          <div>
            <p className="text-[10px] tracking-[0.3em] text-white/25 mb-1">AVG RATING</p>
            <p className="text-xl font-bold text-white">
              {summary.avg_rating.toFixed(1)} / 5
              <span className="text-white/30 text-sm font-normal ml-2">({summary.total_reviews} reviews)</span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-white/6 p-6">
          <p className="text-[10px] tracking-[0.3em] text-white/25 mb-5">TOP PRODUCTS</p>
          <div className="space-y-4">
            {top_products.map((p, i) => (
              <div key={p.title} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white/20 text-xs w-4">{i + 1}</span>
                  <div><p className="text-xs text-white">{p.title}</p><p className="text-[10px] text-white/30">{p.quantity} sold</p></div>
                </div>
                <p className="text-xs text-white font-medium">{formatPrice(p.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/6 p-6">
          <p className="text-[10px] tracking-[0.3em] text-white/25 mb-5">ORDER STATUS BREAKDOWN</p>
          <div className="space-y-3">
            {Object.entries(status_breakdown).map(([status, count]) => {
              const total = Object.values(status_breakdown).reduce((a: number, b: number) => a + b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40 tracking-widest">{status.replace(/_/g,' ').toUpperCase()}</span>
                    <span className="text-white">{count}</span>
                  </div>
                  <div className="h-1 bg-white/5 overflow-hidden">
                    <div className="h-full bg-white/30 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {revenue_by_day.length > 0 && (
          <div className="bg-[#0a0a0a] border border-white/6 p-6 md:col-span-2">
            <p className="text-[10px] tracking-[0.3em] text-white/25 mb-5">REVENUE — LAST 30 DAYS</p>
            <div className="flex items-end gap-1 h-24">
              {revenue_by_day.map(d => {
                const maxRev = Math.max(...revenue_by_day.map(x => x.revenue));
                const pct = maxRev > 0 ? (d.revenue / maxRev) * 100 : 0;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-white/20 hover:bg-white/40 transition-colors" style={{ height: `${Math.max(pct, 4)}%` }} title={`${d.date}: ${formatPrice(d.revenue)}`} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-white/20">{revenue_by_day[0]?.date}</span>
              <span className="text-[10px] text-white/20">{revenue_by_day[revenue_by_day.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COUPONS TAB
═══════════════════════════════════════════════════════════════════ */

const COUPON_STORAGE_KEY = 'noyr_admin_coupons';

interface Coupon {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
  expiresAt: string;
}

function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try { return JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY) ?? '[]'); } catch { return []; }
  });
  const [form, setForm] = useState({ code: '', type: 'percent' as 'percent'|'flat', value: 10, maxUses: 100, expiresAt: '' });
  const [adding, setAdding] = useState(false);

  const save = (next: Coupon[]) => {
    setCoupons(next);
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(next));
  };

  const addCoupon = () => {
    if (!form.code.trim()) return;
    const c: Coupon = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: form.value,
      maxUses: form.maxUses,
      usedCount: 0,
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: form.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString().slice(0,10),
    };
    save([c, ...coupons]);
    setForm({ code: '', type: 'percent', value: 10, maxUses: 100, expiresAt: '' });
    setAdding(false);
  };

  const toggleActive = (code: string) =>
    save(coupons.map(c => c.code === code ? { ...c, active: !c.active } : c));

  const deleteCoupon = (code: string) =>
    save(coupons.filter(c => c.code !== code));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-black text-white tracking-widest">COUPON MANAGER</h2>
        <button
          onClick={() => setAdding(v => !v)}
          className="flex items-center gap-2 border border-white/20 hover:border-white px-5 py-2 text-[11px] tracking-[0.2em] text-white/50 hover:text-white transition-all"
        >
          <Plus size={12} /> NEW COUPON
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-white/10 p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              <Input label="CODE" value={form.code} onChange={v => setForm(f => ({ ...f, code: v }))} placeholder="VOID20" />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] tracking-[0.3em] text-white/30">TYPE</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percent'|'flat' }))}
                  className="bg-black border border-white/10 focus:border-white/30 text-white text-sm px-3 py-2.5 outline-none"
                >
                  <option value="percent">Percent off</option>
                  <option value="flat">Flat off (₹)</option>
                </select>
              </div>
              <Input label={form.type === 'percent' ? 'VALUE (%)' : 'VALUE (₹)'} type="number" value={form.value} onChange={v => setForm(f => ({ ...f, value: Number(v) }))} />
              <Input label="MAX USES" type="number" value={form.maxUses} onChange={v => setForm(f => ({ ...f, maxUses: Number(v) }))} />
              <Input label="EXPIRES (YYYY-MM-DD)" value={form.expiresAt} onChange={v => setForm(f => ({ ...f, expiresAt: v }))} placeholder="2026-12-31" />
              <div className="flex items-end">
                <button onClick={addCoupon} className="w-full bg-white text-black py-2.5 text-[11px] tracking-[0.2em] font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                  <Save size={12} /> CREATE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {coupons.length === 0 ? (
        <div className="border border-white/8 p-12 text-center">
          <p className="text-white/20 text-sm tracking-widest">NO COUPONS YET</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {coupons.map(c => (
            <div key={c.code} className={`border ${c.active ? 'border-white/10' : 'border-white/5'} p-5 grid grid-cols-2 md:grid-cols-6 gap-3 items-center`}>
              <div className="md:col-span-1">
                <p className="font-mono text-base font-bold text-white tracking-wider">{c.code}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`}</p>
              </div>
              <div className="text-center hidden md:block">
                <p className="text-[9px] tracking-[0.3em] text-white/20 mb-1">USES</p>
                <p className="text-sm text-white/60">{c.usedCount}/{c.maxUses}</p>
              </div>
              <div className="text-center hidden md:block">
                <p className="text-[9px] tracking-[0.3em] text-white/20 mb-1">EXPIRES</p>
                <p className="text-sm text-white/60">{c.expiresAt.slice(0,10)}</p>
              </div>
              <div className="text-center hidden md:block">
                <p className="text-[9px] tracking-[0.3em] text-white/20 mb-1">STATUS</p>
                <span className={`text-[10px] tracking-widest ${c.active ? 'text-green-400' : 'text-white/25'}`}>
                  {c.active ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => toggleActive(c.code)}
                  className="text-[10px] tracking-[0.2em] text-white/30 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-3 py-1.5"
                >
                  {c.active ? <EyeOff size={11} /> : <Eye size={11} />}
                </button>
                <button
                  onClick={() => deleteCoupon(c.code)}
                  className="text-[10px] text-red-500/50 hover:text-red-500 transition-colors border border-red-500/15 hover:border-red-500/30 px-3 py-1.5"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AUDIT LOG TAB
═══════════════════════════════════════════════════════════════════ */

function AuditTab({ orders }: { orders: Order[] }) {
  // Build synthetic audit log from orders in localStorage + status changes
  const events = orders.flatMap(o => [
    { ts: o.created_at, action: 'ORDER CREATED', detail: `#${o.id.slice(-6).toUpperCase()} — ${o.customer_name}`, type: 'create' },
    ...(o.payment?.verified ? [{ ts: o.created_at, action: 'PAYMENT VERIFIED', detail: `#${o.id.slice(-6).toUpperCase()} — ${o.payment.transaction_id}`, type: 'payment' }] : []),
    ...(o.tracking_id ? [{ ts: o.created_at, action: 'TRACKING ADDED', detail: `#${o.id.slice(-6).toUpperCase()} — ${o.tracking_id}`, type: 'ship' }] : []),
    ...(o.status === 'delivered' ? [{ ts: o.created_at, action: 'MARKED DELIVERED', detail: `#${o.id.slice(-6).toUpperCase()}`, type: 'delivered' }] : []),
  ]).sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  const typeColor: Record<string, string> = {
    create: 'text-blue-400', payment: 'text-green-400',
    ship: 'text-cyan-400', delivered: 'text-white/50',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-black text-white tracking-widest">AUDIT LOG</h2>
        <p className="text-[10px] tracking-[0.3em] text-white/20">{events.length} EVENTS</p>
      </div>
      {events.length === 0 ? (
        <div className="border border-white/8 p-12 text-center">
          <p className="text-white/20 text-sm tracking-widest">NO EVENTS YET</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0 border border-white/8">
          {events.map((ev, i) => (
            <div key={i} className={`grid grid-cols-[160px_1fr] md:grid-cols-[200px_200px_1fr] gap-4 px-6 py-4 ${i > 0 ? 'border-t border-white/5' : ''} items-center`}>
              <p className="font-mono text-[10px] text-white/25">
                {new Date(ev.ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {new Date(ev.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className={`text-[10px] tracking-[0.25em] font-semibold ${typeColor[ev.type] ?? 'text-white/40'}`}>{ev.action}</p>
              <p className="text-[11px] text-white/35 truncate">{ev.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */

export default function AdminPage() {
  const [authed, setAuthed]       = useState(false);
  const [password, setPassword]   = useState('');
  const [authError, setAuthError] = useState('');
  const [tab, setTab]             = useState<TabKey>('orders');

  /* orders */
  const [orders, setOrders]     = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState<StatusFilter>('all');
  const [payF, setPayF]         = useState<PayFilter>('all');
  const [tracking, setTracking] = useState('');
  const [saving, setSaving]     = useState(false);

  /* products */
  const [products, setProducts]           = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct]       = useState(false);
  const [productSearch, setProductSearch] = useState('');

  /* collections */
  const [collections, setCollections]         = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [newCollection, setNewCollection]     = useState(false);

  const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'noyr2025';

  /* ── loaders ────────────────────────────────────────────────────── */
  const loadOrders      = useCallback(() => setOrders(getLocalOrders()), []);
  const loadProducts    = useCallback(() => setProducts(getLocalProducts()), []);
  const loadCollections = useCallback(() => setCollections(getLocalCollections()), []);

  useEffect(() => {
    if (!authed) return;
    loadOrders(); loadProducts(); loadCollections();
  }, [authed, loadOrders, loadProducts, loadCollections]);

  /* ── order helpers ────────────────────────────────────────────────── */
  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customer_name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    return matchSearch && (statusF === 'all' || o.status === statusF) && (payF === 'all' || o.payment_status === payF);
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.payment_status === 'submitted').length,
    verified: orders.filter(o => o.payment_status === 'verified').length,
    revenue: orders.filter(o => o.payment_status === 'verified').reduce((s, o) => s + o.total, 0),
  };

  const updateOrder = async (id: string, changes: Partial<Order>) => {
    setSaving(true);
    const updated = updateLocalOrder(id, changes);
    if (updated) {
      setOrders(getLocalOrders()); setSelected(updated);
      fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_PASS },
        body: JSON.stringify({ ...changes, tracking_id: tracking || undefined }),
      }).catch(() => {});
    }
    setSaving(false);
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const filteredProducts = products.filter(p =>
    !productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.includes(productSearch.toLowerCase())
  );

  /* ════════════════ LOGIN ════════════════ */
  if (!authed) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-80">
          <div className="text-center mb-10">
            <span className="text-[#cc0000] text-2xl">✦</span>
            <h1 className="font-display text-3xl font-black text-white tracking-[0.2em] mt-2">ADMIN</h1>
            <p className="text-white/25 text-xs tracking-widest mt-1">NOYR CONTROL PANEL</p>
          </div>
          <input
            type="password" value={password}
            onChange={e => { setPassword(e.target.value); setAuthError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') { password === ADMIN_PASS ? setAuthed(true) : setAuthError('Invalid password'); } }}
            placeholder="••••••••"
            className="w-full bg-[#0e0e0e] border border-white/10 focus:border-white/30 text-white text-sm px-4 py-3 outline-none text-center tracking-[0.3em] placeholder:text-white/15 transition-colors"
          />
          {authError && <p className="mt-2 text-xs text-red-400 text-center">{authError}</p>}
          <button
            onClick={() => password === ADMIN_PASS ? setAuthed(true) : setAuthError('Invalid password')}
            className="mt-4 w-full bg-white text-black py-3 text-xs tracking-[0.3em] font-semibold hover:bg-white/90 transition-colors"
          >ENTER</button>
        </motion.div>
      </div>
    );
  }

  /* ════════════════ DASHBOARD ════════════════ */
  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'orders', label: 'ORDERS', icon: <Package size={13} /> },
    { key: 'products', label: 'PRODUCTS', icon: <Tag size={13} /> },
    { key: 'collections', label: 'COLLECTIONS', icon: <Layers size={13} /> },
    { key: 'stock', label: 'STOCK', icon: <Database size={13} /> },
    { key: 'analytics', label: 'ANALYTICS', icon: <BarChart3 size={13} /> },
    { key: 'coupons', label: 'COUPONS', icon: <Tag size={13} /> },
    { key: 'audit', label: 'AUDIT LOG', icon: <AlertTriangle size={13} /> },
  ];

  return (
    <div className="bg-black min-h-screen pt-16">
      <div className="max-w-[1400px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[#cc0000] text-sm">✦</span>
            <h1 className="font-display text-4xl font-black text-white tracking-widest inline ml-3">ADMIN</h1>
            <p className="text-white/20 text-xs tracking-[0.3em] mt-1">NOYR CONTROL PANEL</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { loadOrders(); loadProducts(); loadCollections(); }}
              className="text-white/30 hover:text-white transition-colors p-2 border border-white/10 hover:border-white/30">
              <RefreshCw size={14} />
            </button>
            <button onClick={() => setAuthed(false)}
              className="text-white/30 hover:text-white transition-colors p-2 border border-white/10 hover:border-white/30">
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-8 border-b border-white/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-[11px] tracking-[0.2em] border-b-2 whitespace-nowrap transition-colors ${tab === t.key ? 'border-white text-white' : 'border-transparent text-white/30 hover:text-white'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ─────────────────────────────────────────── */}
        {tab === 'orders' && (<>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'TOTAL ORDERS', value: String(stats.total) },
              { label: 'PENDING VERIFY', value: String(stats.pending), accent: stats.pending > 0 },
              { label: 'VERIFIED', value: String(stats.verified) },
              { label: 'VERIFIED REVENUE', value: formatPrice(stats.revenue) },
            ].map(s => (
              <div key={s.label} className={`bg-[#0a0a0a] border p-5 ${s.accent ? 'border-yellow-400/30' : 'border-white/6'}`}>
                <p className={`text-[10px] tracking-[0.3em] mb-2 ${s.accent ? 'text-yellow-400/70' : 'text-white/25'}`}>{s.label}</p>
                <p className={`text-2xl font-bold ${s.accent ? 'text-yellow-400' : 'text-white'}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…"
                className="bg-[#0a0a0a] border border-white/8 text-white text-xs pl-8 pr-4 py-2 outline-none focus:border-white/25 placeholder:text-white/20 w-52 transition-colors" />
            </div>
            <select value={statusF} onChange={e => setStatusF(e.target.value as StatusFilter)}
              className="bg-[#0a0a0a] border border-white/8 text-white/50 text-xs px-3 py-2 outline-none focus:border-white/25">
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ').toUpperCase()}</option>)}
            </select>
            <select value={payF} onChange={e => setPayF(e.target.value as PayFilter)}
              className="bg-[#0a0a0a] border border-white/8 text-white/50 text-xs px-3 py-2 outline-none focus:border-white/25">
              <option value="all">All Payments</option>
              {PAY_STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4">
            {/* Order list */}
            <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
              {filtered.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/5 p-10 text-center">
                  <p className="text-white/20 text-xs tracking-widest">NO ORDERS FOUND</p>
                </div>
              ) : filtered.map(o => (
                <button key={o.id} onClick={() => { setSelected(o); setTracking(o.tracking_id ?? ''); }}
                  className={`w-full text-left bg-[#0a0a0a] border p-4 transition-colors ${selected?.id === o.id ? 'border-white/25 bg-white/3' : 'border-white/5 hover:border-white/10'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-mono text-xs text-white/50">{o.id}</p>
                    <span className={`text-[10px] border px-1.5 py-0.5 flex items-center gap-1 ${PAY_COLOR[o.payment_status]}`}>
                      {o.payment_status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white">{o.customer_name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-white/30">{o.email}</p>
                    <p className="text-xs font-medium text-white">{formatPrice(o.total)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] border px-1.5 py-0.5 flex items-center gap-1 ${STATUS_COLOR[o.status]}`}>
                      {STATUS_ICON[o.status]} {o.status.replace(/_/g,' ').toUpperCase()}
                    </span>
                    <span className="text-[10px] text-white/20">{new Date(o.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Order detail */}
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-[#0a0a0a] border border-white/8 p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-xs text-white/30 mb-1">{selected.id}</p>
                    <p className="font-semibold text-white text-lg">{selected.customer_name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{selected.email} · {selected.phone}</p>
                  </div>
                  <p className="text-xl font-bold text-white">{formatPrice(selected.total)}</p>
                </div>
                <div className="text-xs text-white/40 bg-white/3 px-4 py-3 leading-relaxed">
                  {selected.address}, {selected.city} — {selected.pincode}
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {selected.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-xs border-b border-white/5 pb-2">
                      <div>
                        <p className="text-white">{item.product_title}</p>
                        <p className="text-white/30 mt-0.5">Size {item.size} × {item.quantity}</p>
                      </div>
                      <p className="text-white">{formatPrice(item.unit_price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Payment */}
                {selected.payment && (
                  <div className="bg-white/3 border border-white/8 px-4 py-3 text-xs space-y-1">
                    <p className="text-white/25 tracking-widest mb-2">PAYMENT</p>
                    <p className="text-white/60">TXN: <span className="font-mono text-white">{selected.payment.transaction_id}</span></p>
                    {selected.payment.screenshot_url && (
                      <a href={selected.payment.screenshot_url} target="_blank" rel="noopener"
                        className="flex items-center gap-1 text-white/40 hover:text-white mt-1">
                        <ExternalLink size={10} /> View screenshot
                      </a>
                    )}
                  </div>
                )}

                {/* Status controls */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-white/25 mb-2">ORDER STATUS</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ORDER_STATUSES.map(s => (
                        <button key={s} onClick={() => updateOrder(selected.id, { status: s })}
                          className={`text-[10px] tracking-widest px-3 py-1.5 border transition-colors ${selected.status === s ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:text-white hover:border-white/30'}`}>
                          {s.replace(/_/g,' ').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-white/25 mb-2">PAYMENT STATUS</p>
                    <div className="flex flex-wrap gap-1.5">
                      {PAY_STATUSES.map(s => (
                        <button key={s} onClick={() => updateOrder(selected.id, { payment_status: s })}
                          className={`text-[10px] tracking-widest px-3 py-1.5 border transition-colors ${selected.payment_status === s ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:text-white hover:border-white/30'}`}>
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-white/25 mb-2">TRACKING ID</p>
                    <div className="flex gap-2">
                      <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking number"
                        className="flex-1 bg-black border border-white/10 focus:border-white/30 text-white text-xs px-3 py-2 outline-none font-mono transition-colors placeholder:text-white/15" />
                      <button onClick={() => updateOrder(selected.id, { tracking_id: tracking, status: 'shipped' })}
                        className="bg-white text-black px-4 text-xs tracking-widest font-semibold hover:bg-white/90 transition-colors">
                        SAVE
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <a href={`/api/invoice?order_id=${selected.id}&email=${encodeURIComponent(selected.email)}`}
                      target="_blank" rel="noopener"
                      className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-3 py-2 transition-colors">
                      <ExternalLink size={11} /> INVOICE
                    </a>
                  </div>
                </div>
                {saving && <p className="text-[10px] tracking-widest text-white/30 animate-pulse">SAVING…</p>}
              </motion.div>
            ) : (
              <div className="bg-[#0a0a0a] border border-white/5 p-10 text-center h-48 flex items-center justify-center">
                <p className="text-white/15 text-[11px] tracking-[0.3em]">SELECT AN ORDER</p>
              </div>
            )}
          </div>
        </>)}

        {/* ── PRODUCTS TAB ───────────────────────────────────────── */}
        {tab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
            {/* Product list */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                  <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search products…"
                    className="w-full bg-[#0a0a0a] border border-white/8 text-white text-xs pl-8 pr-4 py-2 outline-none focus:border-white/25 placeholder:text-white/20 transition-colors" />
                </div>
                <button onClick={() => { setNewProduct(true); setSelectedProduct(null); }}
                  className="flex items-center gap-1.5 bg-white text-black px-3 py-2 text-[11px] font-semibold tracking-widest hover:bg-white/90 transition-colors whitespace-nowrap">
                  <Plus size={12} /> NEW
                </button>
              </div>
              <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
                {filteredProducts.length === 0 ? (
                  <p className="text-white/20 text-xs tracking-widest text-center py-12">NO PRODUCTS</p>
                ) : filteredProducts.map(p => (
                  <button key={p.id} onClick={() => { setSelectedProduct(p); setNewProduct(false); }}
                    className={`w-full text-left bg-[#0a0a0a] border p-4 transition-colors ${selectedProduct?.id === p.id ? 'border-white/25 bg-white/3' : 'border-white/5 hover:border-white/10'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.title}</p>
                        <p className="text-[10px] text-white/30 mt-0.5 tracking-widest">{p.category.toUpperCase()} · ₹{p.price.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {p.limited && <span className="text-[9px] text-red-400 border border-red-400/30 px-1.5 py-0.5 tracking-widest">LTD</span>}
                        {p.active ? <Eye size={12} className="text-green-400/60" /> : <EyeOff size={12} className="text-white/20" />}
                      </div>
                    </div>
                    <p className="text-[10px] text-white/20 mt-1.5">{p.variants.length} variant{p.variants.length !== 1 ? 's' : ''}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Product detail / form */}
            <div className="bg-[#0a0a0a] border border-white/8 p-6 max-h-[80vh] overflow-y-auto">
              {newProduct ? (
                <ProductForm
                  product={null}
                  collections={collections}
                  onSave={p => { setProducts(getLocalProducts()); setSelectedProduct(p); setNewProduct(false); }}
                  onDelete={() => {}}
                  onClose={() => setNewProduct(false)}
                />
              ) : selectedProduct ? (
                <ProductForm
                  key={selectedProduct.id}
                  product={selectedProduct}
                  collections={collections}
                  onSave={p => { setProducts(getLocalProducts()); setSelectedProduct(p); }}
                  onDelete={id => { deleteLocalProduct(id); fetch(`/api/catalog/products/${id}`, { method: 'DELETE', headers: { 'x-admin-key': ADMIN_PASS } }).catch(() => {}); setProducts(getLocalProducts()); setSelectedProduct(null); }}
                  onClose={() => setSelectedProduct(null)}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-64">
                  <div className="text-center">
                    <p className="text-white/15 text-[11px] tracking-[0.3em] mb-4">SELECT A PRODUCT OR CREATE NEW</p>
                    <button onClick={() => setNewProduct(true)}
                      className="flex items-center gap-2 mx-auto text-xs tracking-[0.2em] text-white/30 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 transition-colors">
                      <Plus size={12} /> NEW PRODUCT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COLLECTIONS TAB ────────────────────────────────────── */}
        {tab === 'collections' && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
            {/* List */}
            <div className="flex flex-col gap-3">
              <button onClick={() => { setNewCollection(true); setSelectedCollection(null); }}
                className="flex items-center gap-1.5 bg-white text-black px-3 py-2.5 text-[11px] font-semibold tracking-widest hover:bg-white/90 transition-colors w-full justify-center">
                <Plus size={12} /> NEW COLLECTION
              </button>
              <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
                {collections.map(c => {
                  const count = products.filter(p => p.collection_id === c.id).length;
                  return (
                    <button key={c.id} onClick={() => { setSelectedCollection(c); setNewCollection(false); }}
                      className={`w-full text-left bg-[#0a0a0a] border p-4 transition-colors ${selectedCollection?.id === c.id ? 'border-white/25 bg-white/3' : 'border-white/5 hover:border-white/10'}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">{c.title}</p>
                        <span className="text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5">{count} items</span>
                      </div>
                      <p className="text-[10px] text-white/25 font-mono mt-1">/{c.slug}</p>
                      <p className="text-xs text-white/40 mt-1 truncate italic">{c.hero_text}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <div className="bg-[#0a0a0a] border border-white/8 p-6 max-h-[80vh] overflow-y-auto">
              {newCollection ? (
                <CollectionForm
                  collection={null}
                  products={products}
                  onSave={c => { setCollections(getLocalCollections()); setSelectedCollection(c); setNewCollection(false); }}
                  onDelete={() => {}}
                />
              ) : selectedCollection ? (
                <CollectionForm
                  key={selectedCollection.id}
                  collection={selectedCollection}
                  products={products}
                  onSave={c => { setCollections(getLocalCollections()); setSelectedCollection(c); }}
                  onDelete={id => {
                    deleteLocalCollection(id);
                    fetch(`/api/catalog/collections/${id}`, { method: 'DELETE', headers: { 'x-admin-key': ADMIN_PASS } }).catch(() => {});
                    setCollections(getLocalCollections());
                    setSelectedCollection(null);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-64">
                  <div className="text-center">
                    <p className="text-white/15 text-[11px] tracking-[0.3em] mb-4">SELECT A COLLECTION OR CREATE NEW</p>
                    <button onClick={() => setNewCollection(true)}
                      className="flex items-center gap-2 mx-auto text-xs tracking-[0.2em] text-white/30 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 transition-colors">
                      <Plus size={12} /> NEW COLLECTION
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STOCK TAB ──────────────────────────────────────────── */}
        {tab === 'stock' && (
          <StockTab products={products} onRefresh={loadProducts} adminKey={ADMIN_PASS} />
        )}

        {/* ── ANALYTICS TAB ──────────────────────────────────────── */}
        {tab === 'analytics' && (
          <AnalyticsTab adminKey={ADMIN_PASS} formatPrice={formatPrice} />
        )}

        {/* ── COUPONS TAB ────────────────────────────────────────── */}
        {tab === 'coupons' && <CouponsTab />}

        {/* ── AUDIT LOG TAB ──────────────────────────────────────── */}
        {tab === 'audit' && <AuditTab orders={orders} />}

      </div>
    </div>
  );
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  collection_id: string;
  active: boolean;
  variants: Variant[];
  details?: string[];
  story?: string;
  drop_date?: string; // ISO date for limited drops
  limited?: boolean;
}

export interface Variant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  hero_text: string;
  banner_image: string;
  description: string;
}

export interface CartItem {
  product: Product;
  variant: Variant;
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  total: number;
  status: 'pending' | 'payment_received' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'submitted' | 'verified' | 'failed';
  items: OrderItem[];
  payment?: Payment;
  created_at: string;
  notes?: string;
  tracking_id?: string;
  referral_code?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  variant_id: string;
  size: string;
  quantity: number;
  unit_price: number;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  transaction_id: string;
  screenshot_url?: string;
  verified: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number; // 1-5
  body: string;
  size_purchased?: string;
  verified_purchase: boolean;
  created_at: string;
}

export interface WishlistItem {
  product_id: string;
  product_slug: string;
  product_title: string;
  product_price: number;
  added_at: string;
}

export interface RestockNotification {
  id: string;
  product_id: string;
  variant_id: string;
  email: string;
  created_at: string;
  notified: boolean;
}

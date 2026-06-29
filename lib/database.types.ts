export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      collections: {
        Row: {
          id: string;
          title: string;
          slug: string;
          hero_text: string;
          banner_image: string | null;
          description: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['collections']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['collections']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          story: string | null;
          price: number;
          images: string[];
          category: string;
          collection_id: string;
          active: boolean;
          details: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          color: string;
          sku: string;
          price: number;
          stock: number;
        };
        Insert: Database['public']['Tables']['variants']['Row'];
        Update: Partial<Database['public']['Tables']['variants']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          email: string;
          phone: string;
          address: string;
          city: string;
          pincode: string;
          total: number;
          status: 'pending' | 'payment_received' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          payment_status: 'pending' | 'submitted' | 'verified' | 'failed';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_title: string;
          variant_id: string;
          size: string;
          quantity: number;
          unit_price: number;
        };
        Insert: Database['public']['Tables']['order_items']['Row'];
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          payment_method: string;
          transaction_id: string;
          screenshot_url: string | null;
          verified: boolean;
          verified_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      journal_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          body: string;
          cover_image: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['journal_posts']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['journal_posts']['Insert']>;
      };
    };
  };
}

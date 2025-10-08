import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          created_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          category_id: string | null;
          brand_id: string | null;
          image_url: string;
          images: string[];
          sizes: string[];
          colors: string[];
          stock_quantity: number;
          status: 'in_stock' | 'out_of_stock' | 'discontinued';
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          address: any;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          size: string;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_number: string;
          status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          total_amount: number;
          payment_method: 'mpesa' | 'stripe';
          payment_status: 'pending' | 'completed' | 'failed';
          payment_details: any;
          shipping_address: any;
          customer_phone: string;
          customer_email: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_image: string;
          price: number;
          quantity: number;
          size: string;
          color: string | null;
          created_at: string;
        };
      };
    };
  };
}

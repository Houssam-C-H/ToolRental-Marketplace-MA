import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)");
}

const storedSupabaseUrl = localStorage.getItem('_supabase_url');
if (storedSupabaseUrl && storedSupabaseUrl !== supabaseUrl) {
  console.warn('⚠️ Supabase URL changed! Clearing all caches...');
  localStorage.clear();
  sessionStorage.clear();
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}
localStorage.setItem('_supabase_url', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface ProductSubmission {
  id: string;
  user_id?: string;
  product_data: {
    toolName: string;
    category: string;
    brand: string;
    model: string;
    condition: string;
    description: string;
    specifications: string;
    dailyPrice: string;
    city: string;
    neighborhood: string;
    ownerName: string;
    contactPhone: string;
    contactWhatsApp: string;
    hasDelivery: boolean;
    deliveryPrice: string;
    deliveryNotes: string;
    images: string[];
    originalProductId?: string; // For modify/delete requests
  };
  status: "pending" | "approved" | "rejected";
  request_state: "add" | "modify" | "delete";
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  condition: string;
  specifications: string;
  daily_price: number;
  city: string;
  neighborhood: string;
  contact_phone: string;
  contact_whatsapp: string;
  has_delivery: boolean;
  delivery_price?: number;
  delivery_notes?: string;
  images: string[];
  owner_name: string;
  owner_user_id?: string;
  rating: number;
  reviews_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  first_image?: string;
  image_count?: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface AnonymousReview {
  id: string;
  product_id: string;
  reviewer_name?: string;
  reviewer_email?: string;
  reviewer_phone?: string;
  rating: number;
  comment?: string;
  is_verified: boolean;
  verification_token?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string;
}

export interface ReviewSummary {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    '5_star': number;
    '4_star': number;
    '3_star': number;
    '2_star': number;
    '1_star': number;
  };
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  created_at: string;
}

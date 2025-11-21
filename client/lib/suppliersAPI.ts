import { supabase } from './supabase';
import { productsAPI } from './api';

export interface Supplier {
    id: string;
    user_id: string;
    display_name: string;
    email?: string;
    phone?: string;
    profile_photo?: string;
    description?: string;
    location?: string;
    specialties?: string[];
    response_time?: string;
    is_verified: boolean;
    is_active: boolean;
    total_products: number;
    average_rating: number;
    total_reviews: number;
    product_categories?: string[];
    created_at: string;
    updated_at: string;
    last_product_update: string;
}

export interface SupplierProduct {
    id: string;
    name: string;
    description: string;
    category: string;
    brand: string;
    model: string;
    condition: string;
    daily_price: number;
    city: string;
    neighborhood: string;
    images: string[];
    owner_name: string;
    owner_user_id: string;
    rating: number;
    reviews_count: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export const suppliersAPI = {
    // Get supplier by user_id
    async getSupplierByUserId(userId: string): Promise<Supplier | null> {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error('Error fetching supplier:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getSupplierByUserId:', error);
            return null;
        }
    },

    // Get supplier products with pagination - using Supabase
    async getSupplierProducts(
        userId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ products: SupplierProduct[]; totalCount: number }> {
        try {
            console.log('Loading supplier products for user:', userId);
            // Use Supabase directly
            return await productsAPI.getSupplierProducts(userId, page, limit);
        } catch (error) {
            console.error('Error in getSupplierProducts:', error);
            return { products: [], totalCount: 0 };
        }
    },

    // Sync supplier data from products (useful for updates)
    async syncSupplierFromProducts(userId: string): Promise<boolean> {
        try {
            // Sync using Supabase RPC function (if available) or direct query
            try {
                return await productsAPI.syncSupplierData(userId);
            } catch (error) {
                // If RPC doesn't exist, just return true (sync not critical)
                console.warn('Sync RPC not available, skipping sync');
                return true;
            }
        } catch (error) {
            console.error('Error in syncSupplierFromProducts:', error);
            return false;
        }
    },

    // Update supplier profile (from Firebase data)
    async updateSupplierProfile(
        userId: string,
        updates: Partial<Pick<Supplier, 'display_name' | 'email' | 'phone' | 'profile_photo' | 'description' | 'location' | 'specialties' | 'response_time'>>
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('suppliers')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error updating supplier profile:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in updateSupplierProfile:', error);
            return false;
        }
    },

    // Get all suppliers (for admin or search)
    async getAllSuppliers(
        page: number = 1,
        limit: number = 20,
        search?: string
    ): Promise<{ suppliers: Supplier[]; totalCount: number }> {
        try {
            const offset = (page - 1) * limit;

            let query = supabase
                .from('suppliers')
                .select('*', { count: 'exact' })
                .eq('is_active', true)
                .order('total_products', { ascending: false })
                .range(offset, offset + limit - 1);

            if (search) {
                query = query.or(`display_name.ilike.%${search}%,location.ilike.%${search}%`);
            }

            const { data: suppliers, error, count } = await query;

            if (error) {
                console.error('Error fetching suppliers:', error);
                return { suppliers: [], totalCount: 0 };
            }

            return {
                suppliers: suppliers || [],
                totalCount: count || 0
            };
        } catch (error) {
            console.error('Error in getAllSuppliers:', error);
            return { suppliers: [], totalCount: 0 };
        }
    },

    // Create supplier (when user first adds a product)
    async createSupplier(userId: string, displayName: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('suppliers')
                .insert({
                    user_id: userId,
                    display_name: displayName,
                    is_verified: false,
                    is_active: true
                });

            if (error) {
                console.error('Error creating supplier:', error);
                return false;
            }

            // Sync with products
            await this.syncSupplierFromProducts(userId);
            return true;
        } catch (error) {
            console.error('Error in createSupplier:', error);
            return false;
        }
    }
};

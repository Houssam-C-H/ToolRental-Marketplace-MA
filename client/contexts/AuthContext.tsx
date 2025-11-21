import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
    id: string;
    email: string;
    display_name: string;
    phone?: string;
    profile_photo?: string;
    description?: string;
    location?: string;
    city?: string;
    specialties?: string[];
    response_time?: string;
    is_admin: boolean;
    created_at: string;
    last_login?: string;
    preferences?: {
        categories?: string[];
        priceRange?: { min: number; max: number };
        preferredCities?: string[];
    };
    rentalHistory?: {
        productId: string;
        category: string;
        rentedAt: string;
        rating?: number;
    }[];
    searchHistory?: {
        query: string;
        category?: string;
        searchedAt: string;
    }[];
    // Product-related data
    total_products?: number;
    average_rating?: number;
    total_reviews?: number;
    product_categories?: string[];
    last_product_update?: string;
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signUp: (email: string, password: string, displayName: string, phone?: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    makeAdmin: (userId: string) => Promise<void>;
    syncProductData: (userId: string) => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    async function signUp(email: string, password: string, displayName: string, phone?: string) {
        try {
            const normalizedEmail = email.trim().toLowerCase();
            const normalizedPassword = password.trim();
            
            if (!normalizedEmail || !normalizedEmail.includes('@')) {
                throw new Error('البريد الإلكتروني غير صحيح');
            }
            
            if (normalizedPassword.length < 6) {
                throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            }
            
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: normalizedEmail,
                password: normalizedPassword,
                options: {
                    data: {
                        display_name: displayName.trim(),
                        phone: phone?.trim() || null,
                    },
                    emailRedirectTo: `${window.location.origin}/dashboard`
                }
            });

            if (authError) {
                console.error('Supabase signup error:', authError);
                
                if (authError.message?.includes('User already registered') || 
                    authError.message?.includes('already registered')) {
                    throw new Error('البريد الإلكتروني مستخدم بالفعل');
                } else if (authError.message?.includes('Password')) {
                    throw new Error('كلمة المرور ضعيفة جداً');
                } else if (authError.message?.includes('Email') || 
                          authError.message?.includes('invalid')) {
                    throw new Error('البريد الإلكتروني غير صحيح. تأكد من إدخال بريد إلكتروني صالح');
                } else if (authError.message?.includes('signup_disabled')) {
                    throw new Error('التسجيل معطل حالياً. يرجى الاتصال بالدعم');
                }
                throw authError;
            }
            
            if (!authData.user) {
                throw new Error('فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى');
            }

            // Create user profile in Supabase
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    id: authData.user.id,
                    email: authData.user.email!,
                    display_name: displayName,
                    phone: phone || null,
                    is_admin: false,
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString(),
                });

            if (profileError) {
                console.error('Error creating user profile:', profileError);
                // Don't throw - user is created, profile can be created later
            }

            setCurrentUser(authData.user);
            // Load profile after creation
            await loadUserProfile(authData.user.id);
        } catch (error) {
            console.error('Error signing up:', error);
            throw error;
        }
    }

    async function signIn(email: string, password: string) {
        try {
            // Normalize email and password to avoid encoding issues
            const normalizedEmail = email.trim().toLowerCase();
            const normalizedPassword = password.trim();
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password: normalizedPassword,
            });

            if (error) {
                console.error('Supabase auth error:', error);
                
                // Provide more specific error messages
                if (error.message?.includes('Invalid login credentials') || 
                    error.message?.includes('invalid_credentials')) {
                    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
                } else if (error.message?.includes('Email not confirmed') || 
                          error.message?.includes('email_not_confirmed')) {
                    throw new Error('يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد');
                } else if (error.message?.includes('Too many requests')) {
                    throw new Error('تم حظر الحساب مؤقتاً بسبب محاولات تسجيل دخول فاشلة متعددة');
                }
                throw error;
            }
            
            if (!data.user) throw new Error('Failed to sign in');

            // Update last login
            await supabase
                .from('user_profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', data.user.id);

            setCurrentUser(data.user);
            await loadUserProfile(data.user.id);
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    }

    async function logout() {
        try {
            await supabase.auth.signOut();
            setCurrentUser(null);
            setUserProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    async function updateUserProfile(updates: Partial<UserProfile>) {
        if (!currentUser) throw new Error('No user logged in');

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', currentUser.id);

            if (error) throw error;

            // Reload profile
            await loadUserProfile(currentUser.id);
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async function resetPassword(email: string) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending password reset:', error);
            throw error;
        }
    }

    async function makeAdmin(userId: string) {
        if (!currentUser) throw new Error('No user logged in');
        if (!userProfile?.is_admin) throw new Error('Only admins can promote users');

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ is_admin: true })
                .eq('id', userId);

            if (error) throw error;
            console.log(`User ${userId} promoted to admin`);
        } catch (error) {
            console.error('Error making user admin:', error);
            throw error;
        }
    }

    // Function to sync product data from Supabase (replaces Firebase sync)
    async function syncProductData(userId: string) {
        try {
            console.log('Starting product data sync for user:', userId);
            
            // Import productsAPI here to avoid circular dependency
            const { productsAPI } = await import('../lib/api');
            
            // Get user's products
            const userProducts = await productsAPI.getUserProducts(userId);
            
            if (!userProducts || userProducts.length === 0) {
                console.log('No products found for user:', userId);
                // Update profile with empty stats
                await supabase
                    .from('user_profiles')
                    .update({
                        total_products: 0,
                        average_rating: 0,
                        total_reviews: 0,
                        product_categories: [],
                        last_product_update: new Date().toISOString()
                    })
                    .eq('id', userId);
                return;
            }
            
            // Calculate product statistics
            const totalProducts = userProducts.length;
            const averageRating = userProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / totalProducts;
            const totalReviews = userProducts.reduce((sum, p) => sum + (p.reviews_count || 0), 0);
            const productCategories = [...new Set(userProducts.map(p => p.category).filter(Boolean))];
            
            // Update user profile with product data
            await supabase
                .from('user_profiles')
                .update({
                    total_products: totalProducts,
                    average_rating: Math.round(averageRating * 10) / 10,
                    total_reviews: totalReviews,
                    product_categories: productCategories,
                    last_product_update: new Date().toISOString()
                })
                .eq('id', userId);
            
            console.log('Product data synced for user:', userId, {
                totalProducts,
                averageRating: Math.round(averageRating * 10) / 10,
                totalReviews
            });

            // Reload profile
            await loadUserProfile(userId);
        } catch (error) {
            console.error('Error syncing product data:', error);
        }
    }

    async function loadUserProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // If profile doesn't exist, create it
                if (error.code === 'PGRST116') {
                    const user = currentUser;
                    if (user) {
                        const { error: insertError } = await supabase
                            .from('user_profiles')
                            .insert({
                                id: userId,
                                email: user.email!,
                                display_name: user.user_metadata?.display_name || 'User',
                                is_admin: false,
                                created_at: new Date().toISOString(),
                                last_login: new Date().toISOString(),
                            });

                        if (!insertError) {
                            // Retry loading
                            const { data: newData } = await supabase
                                .from('user_profiles')
                                .select('*')
                                .eq('id', userId)
                                .single();
                            
                            if (newData) {
                                setUserProfile(newData as UserProfile);
                            }
                        }
                    }
                } else {
                    console.error('Error loading user profile:', error);
                }
            } else if (data) {
                setUserProfile(data as UserProfile);
            }
        } catch (error) {
            console.error('Error in loadUserProfile:', error);
        }
    }

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;

        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
            if (mounted) {
                console.warn('Auth check timeout - setting loading to false');
                setLoading(false);
            }
        }, 3000); // 3 second timeout

        // Get initial session with timeout protection
        const initAuth = async () => {
            try {
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Session check timeout')), 2000)
                );

                const { data: { session } } = await Promise.race([
                    sessionPromise,
                    timeoutPromise
                ]) as { data: { session: any } };

                if (!mounted) return;

                if (session?.user) {
                    setCurrentUser(session.user);
                    // Load profile in background, don't block
                    loadUserProfile(session.user.id).catch(console.error);
                }
            } catch (error) {
                console.error('Error getting session:', error);
                // Continue anyway - user might not be logged in
            } finally {
                if (mounted) {
                    clearTimeout(timeoutId);
                    setLoading(false);
                }
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (session?.user) {
                setCurrentUser(session.user);
                // Load profile in background
                loadUserProfile(session.user.id).catch(console.error);
            } else {
                setCurrentUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, []);

    const value: AuthContextType = {
        currentUser,
        userProfile,
        loading,
        signUp,
        signIn,
        logout,
        updateUserProfile,
        resetPassword,
        makeAdmin,
        syncProductData,
        isAdmin: userProfile?.is_admin || false,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

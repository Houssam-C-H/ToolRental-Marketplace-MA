import { supabase, ProductSubmission, Product, Review } from "./supabase";

export type { Product, ProductSubmission, Review };

// Optimized field sets for different use cases
const PRODUCT_LIST_FIELDS = "id, name, description, category, brand, model, condition, daily_price, city, neighborhood, images, owner_name, owner_user_id, rating, reviews_count, status, created_at, updated_at";
const PRODUCT_DETAIL_FIELDS = "*";
const PRODUCT_DASHBOARD_FIELDS = "id, name, category, brand, model, condition, daily_price, city, neighborhood, images, owner_name, owner_user_id, rating, reviews_count, status, created_at, updated_at, contact_phone, contact_whatsapp, has_delivery, delivery_price";

export const productSubmissionAPI = {
  async submit(
    submission: Omit<ProductSubmission, "id" | "status" | "submitted_at">,
    userId: string,
  ) {

    const { data, error } = await supabase
      .from("product_submissions")
      .insert({
        ...submission,
        user_id: userId,
        status: "pending",
        request_state: submission.request_state || "add",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async submitModifyRequest(
    productId: string,
    modifications: any,
    userId: string,
  ) {

    const { data, error } = await supabase
      .from("product_submissions")
      .insert({
        user_id: userId,
        product_data: {
          ...modifications,
          originalProductId: productId,
        },
        status: "pending",
        request_state: "modify",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async submitDeleteRequest(
    productId: string,
    reason: string,
    userId: string,
  ) {

    const { data, error } = await supabase
      .from("product_submissions")
      .insert({
        user_id: userId,
        product_data: {
          toolName: "DELETE_REQUEST",
          category: "DELETE_REQUEST",
          description: reason,
          originalProductId: productId,
        },
        status: "pending",
        request_state: "delete",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserSubmissions(userId: string) {

    const { data, error } = await supabase
      .from("product_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getSubmission(id: string) {
    const { data, error } = await supabase
      .from("product_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateSubmission(
    id: string,
    submission: Omit<ProductSubmission, "id" | "status" | "submitted_at">,
  ) {
    const { data, error } = await supabase
      .from("product_submissions")
      .update({
        product_data: submission.product_data,
        status: "pending",
        admin_notes: null,
        reviewed_at: null,
        reviewed_by: null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSubmission(id: string) {
    console.log("API: Attempting to delete submission:", id);

    const { data, error } = await supabase
      .from("product_submissions")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("API: Delete error:", error);
      throw error;
    }

    console.log("API: Delete successful, deleted rows:", data?.length || 0);
    return data;
  },
};

export const reviewsAPI = {
  async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }

    return data || [];
  },

  async addReview(
    productId: string,
    userId: string,
    userName: string,
    userEmail: string,
    rating: number,
    comment: string = "",
  ) {
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          product_id: productId,
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          rating: rating,
          comment: comment,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding review:", error);
      throw error;
    }

    return data;
  },

  async updateReview(reviewId: string, rating: number, comment: string = "") {
    const { data, error } = await supabase
      .from("reviews")
      .update({
        rating: rating,
        comment: comment,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .select()
      .single();

    if (error) {
      console.error("Error updating review:", error);
      throw error;
    }

    return data;
  },

  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },

  async getUserReview(productId: string, userId: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user review:", error);
      throw error;
    }

    return data;
  },

  async getUserReviews(userId: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
                *,
                products (
                    id,
                    name,
                    images
                )
            `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user reviews:", error);
      throw error;
    }

    return data || [];
  },
};

// Anonymous Reviews API functions
export const anonymousReviewsAPI = {
  // Enhanced rate limiting system - 24 hour cooldown per product + IP protection
  async checkRateLimit(productId: string) {
    try {
      const now = Date.now();
      const clientId = await this.getClientIP();

      // Check both 24-hour cooldown per product and IP-based limits
      const checks = await Promise.all([
        this.checkTimeBasedLimit(productId, now),
        this.checkIPBasedLimit(clientId, now)
      ]);

      // If any check fails, return the first failure
      for (const check of checks) {
        if (!check.allowed) {
          return check;
        }
      }

      return { allowed: true, message: "Rate limit check passed" };
    } catch (error) {
      console.error("Error checking rate limit:", error);
      // On error, allow the request but log it
      return { allowed: true, message: "Rate limit check failed, allowing request" };
    }
  },

  // Time-based rate limiting (24 hours between reviews per product)
  async checkTimeBasedLimit(productId: string, now: number) {
    const lastReviewTime = localStorage.getItem(`lastReview_${productId}`);
    if (lastReviewTime && (now - parseInt(lastReviewTime)) < 86400000) { // 24 hours
      const hoursLeft = Math.ceil((86400000 - (now - parseInt(lastReviewTime))) / 3600000);
      return {
        allowed: false,
        message: `يرجى الانتظار ${hoursLeft} ساعة قبل إضافة تقييم آخر لهذا المنتج`
      };
    }
    return { allowed: true };
  },

  // IP-based rate limiting (check all reviews from same IP)
  async checkIPBasedLimit(clientId: string, now: number) {
    try {
      const { data, error } = await supabase
        .from("anonymous_reviews")
        .select("created_at")
        .eq("ip_address", clientId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error checking IP rate limit:", error);
        return { allowed: true }; // Allow on error
      }

      if (data && data.length >= 2) { // Max 2 reviews total per IP
        return {
          allowed: false,
          message: "تم الوصول للحد الأقصى من التقييمات من هذا العنوان (2 تقييمات)"
        };
      }

      return { allowed: true };
    } catch (error) {
      return { allowed: true };
    }
  },

  // Get client IP address
  async getClientIP() {
    try {
      // Try to get IP from a free service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      console.warn("Could not get IP address:", error);
      return 'unknown';
    }
  },

  updateDeviceTracking(productId: string) {
    const now = Date.now();
    localStorage.setItem(`lastReview_${productId}`, now.toString());
  },
  async getProductReviews(productId: string) {
    try {
      const { data, error } = await supabase
        .from("anonymous_reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching anonymous reviews:", error);

        // Check if it's a table not found error
        if (error.message?.includes('relation "anonymous_reviews" does not exist')) {
          console.warn('Anonymous reviews table not found. Returning empty array.');
          return [];
        }

        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getProductReviews:", error);
      return []; // Return empty array on error to prevent UI breaking
    }
  },

  // Add a new anonymous review
  async addReview(
    productId: string,
    rating: number,
    comment: string = "",
    reviewerName?: string,
    reviewerEmail?: string,
    reviewerPhone?: string
  ) {
    try {
      // Enhanced rate limiting and abuse prevention
      const rateLimitResult = await this.checkRateLimit(productId);
      if (!rateLimitResult.allowed) {
        throw new Error(rateLimitResult.message);
      }

      // Get client info for spam protection
      const userAgent = navigator.userAgent;
      const ipAddress = await this.getClientIP();

      // Insert the review with IP tracking
      const { data, error } = await supabase
        .from("anonymous_reviews")
        .insert([
          {
            product_id: productId,
            reviewer_name: reviewerName || null,
            reviewer_email: reviewerEmail || null,
            reviewer_phone: reviewerPhone || null,
            rating: rating,
            comment: comment || null,
            user_agent: userAgent,
            ip_address: ipAddress,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding anonymous review:", error);

        // Check if it's a table not found error
        if (error.message?.includes('relation "anonymous_reviews" does not exist')) {
          throw new Error('Anonymous reviews table not found. Please run the database setup script first.');
        }

        // Check for missing column errors - provide helpful message
        if (error.message?.includes('column "reviews_count" of relation "products" does not exist')) {
          console.warn('Products table missing reviews_count column. Review saved but product rating not updated.');
          // Don't throw error, just log warning and continue
          return data;
        }

        // Check for permission errors
        if (error.message?.includes('permission denied')) {
          throw new Error('Permission denied. Please check your Supabase RLS policies.');
        }

        throw error;
      }

      this.updateDeviceTracking(productId);

      return data;
    } catch (error) {
      console.error("Error in addReview:", error);
      throw error;
    }
  },

  async getProductRatingSummary(productId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_product_rating_summary', { p_product_id: productId });

      if (error) {
        console.error("Error fetching rating summary:", error);

        // Check if it's a function not found error
        if (error.message?.includes('function get_product_rating_summary') ||
          error.message?.includes('relation "anonymous_reviews" does not exist')) {
          console.warn('Rating summary function or table not found. Returning default values.');
          return {
            total_reviews: 0,
            average_rating: 0,
            rating_distribution: {
              '5_star': 0,
              '4_star': 0,
              '3_star': 0,
              '2_star': 0,
              '1_star': 0
            }
          };
        }

        throw error;
      }

      return data?.[0] || {
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: {
          '5_star': 0,
          '4_star': 0,
          '3_star': 0,
          '2_star': 0,
          '1_star': 0
        }
      };
    } catch (error) {
      console.error("Error in getProductRatingSummary:", error);
      return {
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: {
          '5_star': 0,
          '4_star': 0,
          '3_star': 0,
          '2_star': 0,
          '1_star': 0
        }
      };
    }
  },

  // Verify a review (admin function)
  async verifyReview(reviewId: string) {
    const { data, error } = await supabase
      .from("anonymous_reviews")
      .update({
        is_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", reviewId)
      .select()
      .single();

    if (error) {
      console.error("Error verifying review:", error);
      throw error;
    }

    return data;
  },

  // Soft delete a review (admin function)
  async deleteReview(reviewId: string) {
    const { data, error } = await supabase
      .from("anonymous_reviews")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq("id", reviewId)
      .select()
      .single();

    if (error) {
      console.error("Error deleting review:", error);
      throw error;
    }

    return data;
  }
};

// Helper function to validate admin session before operations
async function validateAdminSession(): Promise<void> {
  const { adminSession } = await import('./adminSession');
  const isValid = await adminSession.validateSession();
  if (!isValid) {
    throw new Error('Admin session expired or invalid');
  }
}

// Admin API
export const adminAPI = {
  // Get all pending submissions
  async getPendingSubmissions(limit: number = 20) {
    await validateAdminSession();
    const { data, error } = await supabase
      .from("product_submissions")
      .select("*", { count: "exact" })
      .eq("status", "pending")
      .order("submitted_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    return data || [];
  },

  async getAllSubmissions(page: number = 1, limit: number = 50) {
    await validateAdminSession();
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error } = await supabase
      .from("product_submissions")
      .select("*")
      .order("submitted_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    return data || [];
  },

  async approveSubmission(id: string, adminNotes?: string) {
    await validateAdminSession();
    try {
      const { data: submission, error: submissionError } = await supabase
        .from("product_submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (submissionError) throw submissionError;

      const productData = {
        name: submission.product_data.toolName,
        description: submission.product_data.description,
        category: submission.product_data.category,
        brand: submission.product_data.brand,
        model: submission.product_data.model,
        condition: submission.product_data.condition,
        specifications: submission.product_data.specifications,
        daily_price: parseFloat(submission.product_data.dailyPrice),
        city: submission.product_data.city,
        neighborhood: submission.product_data.neighborhood,
        contact_phone: submission.product_data.contactPhone,
        contact_whatsapp: submission.product_data.contactWhatsApp,
        has_delivery: submission.product_data.hasDelivery,
        delivery_price: submission.product_data.deliveryPrice
          ? parseFloat(submission.product_data.deliveryPrice)
          : null,
        delivery_notes: submission.product_data.deliveryNotes,
        images: submission.product_data.images,
        owner_name: submission.product_data.ownerName,
        owner_user_id: submission.user_id ?? null,
        rating: 0,
        reviews: 0,
        status: "متاح للإيجار",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const [productResult, updateResult] = await Promise.all([
        supabase
          .from("products")
          .insert(productData)
          .select()
          .single(),

        supabase
          .from("product_submissions")
          .update({
            status: "approved",
            admin_notes: adminNotes,
            reviewed_at: new Date().toISOString(),
            reviewed_by: null,
          })
          .eq("id", id)
      ]);

      if (productResult.error) throw productResult.error;
      if (updateResult.error) throw updateResult.error;

      return productResult.data;
    } catch (error) {
      console.error("Error in approveSubmission:", error);
      throw error;
    }
  },

  async rejectSubmission(id: string, adminNotes: string) {
    await validateAdminSession();
    const { error } = await supabase
      .from("product_submissions")
      .update({
        status: "rejected",
        admin_notes: adminNotes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: null,
      })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  },

  async getAllUsers() {
    await validateAdminSession();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data || [];
  },

  async updateUserAdminStatus(userId: string, isAdmin: boolean) {
    await validateAdminSession();
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId);

    if (error) {
      console.error('Error updating admin status:', error);
      throw error;
    }
    return { success: true };
  },
};

// Products API
export const productsAPI = {
  // Get paginated approved products with optimized fields
  async getApprovedProducts(
    page: number = 1,
    limit: number = 20,
    fields: string = "*",
  ) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    console.log("Fetching products with fields:", fields, "from:", from, "to:", to);

    const { data, error, count } = await supabase
      .from("products")
      .select(fields, { count: "exact" })
      .neq("status", "hidden")
      .order("created_at", { ascending: false })
      .range(from, to);

    console.log("Products query result:", { data: data?.length, error, count });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }


    return {
      products: data || [],
      totalCount: count || 0,
      hasMore: (count || 0) > to + 1,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from("products")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update product error:", error);
      throw error;
    }

    return data;
  },

  async setProductStatus(id: string, status: string) {
    return this.updateProduct(id, { status } as Partial<Product>);
  },

  // Get all products (optimized for admin dashboard - paginated)
  async getAllApprovedProducts(page: number = 1, limit: number = 50) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("products")
      .select(PRODUCT_DASHBOARD_FIELDS, { count: "exact" })
      .neq("status", "hidden")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return {
      products: data || [],
      totalCount: count || 0,
      hasMore: (count || 0) > to + 1,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  async searchProducts(filters: {
    search?: string;
    category?: string;
    city?: string;
    neighborhood?: string;
    condition?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      category,
      city,
      neighborhood,
      condition,
      brand,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = filters;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build the base query with optimized fields
    let query = supabase
      .from("products")
      .select(PRODUCT_LIST_FIELDS + ", specifications, contact_phone, contact_whatsapp, has_delivery, delivery_price, delivery_notes", { count: "exact" });

    // Apply search filter (only search in product names)
    if (search && search.trim().length > 0) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    // Apply other filters
    if (category && category !== "الكل") {
      query = query.eq("category", category);
    }
    if (city && city !== "الكل") {
      query = query.eq("city", city);
    }
    if (neighborhood && neighborhood !== "الكل") {
      query = query.eq("neighborhood", neighborhood);
    }
    if (condition && condition !== "الكل") {
      query = query.eq("condition", condition);
    }
    if (brand && brand !== "الكل") {
      query = query.eq("brand", brand);
    }
    if (minPrice !== undefined) {
      query = query.gte("daily_price", minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte("daily_price", maxPrice);
    }

    let { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);


    if (error) {
      console.error("Supabase search error:", error);

      // Handle range error (416) - when offset is beyond available data
      if (error.message && error.message.includes("Range Not Satisfiable")) {
        console.log("Range error detected, returning empty results for page", page);
        return {
          products: [],
          totalCount: count || 0,
          hasMore: false,
          currentPage: page,
          totalPages: Math.ceil((count || 0) / limit),
        };
      }

      throw error;
    }


    return {
      products: data || [],
      totalCount: count || 0,
      hasMore: (count || 0) > to + 1,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  // Get product by ID (full details)
  async getProduct(id: string) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_DETAIL_FIELDS)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get featured products (for homepage)
  async getFeaturedProducts(limit: number = 6) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_LIST_FIELDS)
      .eq("status", "active")
      .order("rating", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    return data || [];
  },

  // Get products owned by a specific owner name. Optionally include hidden ones.
  async getProductsByOwner(ownerName: string, includeHidden: boolean = true) {
    let query = supabase
      .from("products")
      .select(PRODUCT_LIST_FIELDS)
      .eq("owner_name", ownerName)
      .order("created_at", { ascending: false });

    if (!includeHidden) {
      query = query.in("status", ["active", "متاح للإيجار"]);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase owner products error:", error);
      throw error;
    }

    return data || [];
  },

  // Get products for a user profile using heuristics (owner name or phone)
  async getProductsForProfile(
    ownerName?: string,
    phone?: string,
    includeHidden: boolean = true,
    ownerUserId?: string,
  ) {
    let query = supabase
      .from("products")
      .select(PRODUCT_LIST_FIELDS)
      .order("created_at", { ascending: false });

    if (ownerUserId) {
      query = query.eq("owner_user_id", ownerUserId);
    } else if (ownerName && phone) {
      // Match either owner name or contact phone
      query = query.or(`owner_name.eq.${ownerName},contact_phone.eq.${phone}`);
    } else if (ownerName) {
      query = query.eq("owner_name", ownerName);
    } else if (phone) {
      query = query.eq("contact_phone", phone);
    }

    if (!includeHidden) {
      query = query.in("status", ["active", "متاح للإيجار"]);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase profile products error:", error);
      throw error;
    }
    return data || [];
  },

  async deleteProduct(id: string) {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  },


  // Get products by user ID (works with owner_user_id) - OPTIMIZED
  async getUserProducts(userId: string) {
    try {
      // First try to get products by owner_user_id
      const { data: productsByUserId, error: userIdError } = await supabase
        .from("products")
        .select("id, name, category, brand, model, condition, daily_price, city, neighborhood, images, owner_name, rating, reviews, status, created_at")
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: false });

      if (!userIdError && productsByUserId && productsByUserId.length > 0) {
        return productsByUserId;
      }

      // If no products found by owner_user_id, try to get user's display name and search by owner_name
      // This is a fallback for products that don't have owner_user_id populated yet
      console.log('No products found by owner_user_id, trying fallback...');

      // For now, return empty array to avoid slow queries
      // The user can use the sync button to populate owner_user_id
      return [];

    } catch (error) {
      console.error('Error getting user products:', error);
      return [];
    }
  },

  // Get supplier products by owner_user_id - COMPOSITE KEY APPROACH
  async getSupplierProducts(ownerUserId: string, page: number = 1, limit: number = 20) {
    try {
      console.log('Loading supplier products for owner_user_id:', ownerUserId, 'page:', page);

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Query products directly by owner_user_id (from composite key)
      const { data: products, error } = await supabase
        .from("products")
        .select("id, name, category, brand, model, condition, daily_price, city, neighborhood, images, owner_name, rating, reviews_count, status, created_at, updated_at, has_delivery, delivery_price, contact_phone, contact_whatsapp")
        .eq("owner_user_id", ownerUserId)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching supplier products:', error);
        return { products: [], totalCount: 0 };
      }

      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("owner_user_id", ownerUserId)
        .eq("status", "approved");

      if (countError) {
        console.error('Error getting total count:', countError);
        return { products: products || [], totalCount: products?.length || 0 };
      }

      console.log(`Found ${products?.length || 0} products out of ${count || 0} total for owner_user_id: ${ownerUserId}`);
      return {
        products: products || [],
        totalCount: count || 0
      };

    } catch (error) {
      console.error('Error in getSupplierProducts:', error);
      return { products: [], totalCount: 0 };
    }
  },

  // Sync supplier data when products change
  async syncSupplierData(userId: string) {
    try {
      const { error } = await supabase
        .rpc('sync_supplier_from_products', { supplier_user_id: userId });

      if (error) {
        console.error('Error syncing supplier data:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in syncSupplierData:', error);
      return false;
    }
  },

  // Claim an unclaimed product (for products created before proper ownership tracking)
  async claimProduct(productId: string, userId: string) {
    const { data, error } = await supabase
      .rpc('claim_product', {
        product_id: productId,
        user_uid: userId
      });

    if (error) throw error;
    return data;
  },

  // Get unclaimed products that a user might be able to claim - OPTIMIZED
  // (based on matching owner_name or contact_phone with user profile)
  async getUnclaimedProductsForUser(userProfile: any) {
    if (!userProfile) return [];

    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, daily_price, city, neighborhood, images, owner_name, rating, reviews, created_at")
      .like("owner_user_id", "unclaimed_%")
      .or(`owner_name.eq.${userProfile.display_name},contact_phone.eq.${userProfile.phone}`)
      .order("created_at", { ascending: false })
      .limit(10); // Limit to 10 most recent

    if (error) throw error;
    return data || [];
  },

  // Get single product by ID (full details)
  async getProductById(productId: string) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_DETAIL_FIELDS)
      .eq("id", productId)
      .single();

    if (error) throw error;
    return data;
  },
};

// Admin Authentication API
export const adminAuthAPI = {
  // Login admin user with enhanced security
  login: async (email: string, password: string) => {
    // Trim and normalize inputs to avoid encoding issues
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    
    // Get client info for session tracking
    const clientIp = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => data.ip)
      .catch(() => null);
    
    const userAgent = navigator.userAgent;
    
    console.log('Admin login attempt:', { email: normalizedEmail, passwordLength: normalizedPassword.length });
    
    const { data, error } = await supabase.rpc("admin_authenticate", {
      admin_email: normalizedEmail,
      password: normalizedPassword,
      client_ip: clientIp,
      user_agent: userAgent,
    });

    if (error) {
      console.error('Admin login error:', error);
      // Handle specific error messages
      if (error.message.includes("Account temporarily locked")) {
        throw new Error(
          "الحساب مؤقتاً محظور بسبب محاولات تسجيل دخول فاشلة متعددة",
        );
      } else if (error.message.includes("Invalid credentials")) {
        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else {
        throw new Error(error.message || "حدث خطأ في تسجيل الدخول");
      }
    }

    // Store session securely
    if (data) {
      const { adminSession } = await import('./adminSession');
      await adminSession.storeSession(data);
    }

    return data;
  },

  // Update admin password with validation
  updatePassword: async (
    email: string,
    currentPassword: string,
    newPassword: string,
  ) => {
    const { error } = await supabase.rpc("admin_update_password", {
      admin_email: email,
      current_password: currentPassword,
      new_password: newPassword,
    });

    if (error) {
      // Handle specific validation errors
      if (error.message.includes("Password must be at least 8 characters")) {
        throw new Error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      } else if (
        error.message.includes("Password must contain at least one uppercase")
      ) {
        throw new Error("كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل");
      } else if (
        error.message.includes("Password must contain at least one lowercase")
      ) {
        throw new Error("كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل");
      } else if (
        error.message.includes("Password must contain at least one number")
      ) {
        throw new Error("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل");
      } else if (error.message.includes("Current password is incorrect")) {
        throw new Error("كلمة المرور الحالية غير صحيحة");
      } else {
        throw new Error("حدث خطأ في تحديث كلمة المرور");
      }
    }

    return { success: true };
  },

  validateSession: async (sessionToken?: string) => {
    const token = sessionToken || (await import('./adminSession')).adminSession.getSessionToken();
    
    if (!token) {
      throw new Error("No session token");
    }

    const { data, error } = await supabase.rpc("admin_validate_session", {
      session_token: token,
    });

    if (error) {
      // Clear invalid session
      const { adminSession } = await import('./adminSession');
      adminSession.clearSession();
      throw new Error("Session expired or invalid");
    }

    return data;
  },

  logout: async () => {
    const { adminSession } = await import('./adminSession');
    const token = adminSession.getSessionToken();
    
    if (token) {
      const { error } = await supabase.rpc("admin_logout", {
        session_token: token,
      });

      if (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear session regardless
    adminSession.clearSession();
    return { success: true };
  },

  getProfile: async (email: string) => {
    await validateAdminSession();
    const { data, error } = await supabase
      .from("admin_users")
      .select(
        "id, email, name, role, last_login, created_at, failed_login_attempts",
      )
      .eq("email", email)
      .single();

    if (error) {
      throw new Error("Failed to get admin profile");
    }

    return data;
  },

  getAuditLog: async (limit: number = 100) => {
    await validateAdminSession();
    const { data, error } = await supabase
      .from("admin_audit_log")
      .select(
        `
        id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
        created_at,
        admin_users!inner(email, name, role)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error("Failed to get audit log");
    }

    return data;
  },
};

// Categories API
export interface Category {
  id: string;
  name: string;
  name_en?: string;
  icon_name: string;
  image_url?: string;
  hero_image_url?: string;
  display_order: number;
  is_active: boolean;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const categoriesAPI = {
  // Get all active categories with product counts
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories_with_counts")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    return data || [];
  },

  // Get single category
  async getCategory(id: string): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  // Admin: Create category
  async createCategory(category: Omit<Category, "id" | "created_at" | "updated_at" | "product_count">): Promise<Category> {
    await validateAdminSession();
    const { data, error } = await supabase.rpc("admin_create_category", {
      p_name: category.name,
      p_name_en: category.name_en || null,
      p_icon_name: category.icon_name || 'Settings',
      p_image_url: category.image_url || null,
      p_hero_image_url: category.hero_image_url || null,
      p_display_order: category.display_order || 0,
      p_is_active: category.is_active ?? true
    });

    if (error) {
      throw error;
    }

    return data;
  },

  // Admin: Update category
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    await validateAdminSession();
    const { data, error } = await supabase.rpc("admin_update_category", {
      p_category_id: id,
      p_name: updates.name || null,
      p_name_en: updates.name_en !== undefined ? updates.name_en : null,
      p_icon_name: updates.icon_name || null,
      p_image_url: updates.image_url !== undefined ? updates.image_url : null,
      p_hero_image_url: updates.hero_image_url !== undefined ? updates.hero_image_url : null,
      p_display_order: updates.display_order !== undefined ? updates.display_order : null,
      p_is_active: updates.is_active !== undefined ? updates.is_active : null
    });

    if (error) {
      throw error;
    }

    return data;
  },

  // Admin: Delete category (soft delete by setting is_active to false)
  async deleteCategory(id: string): Promise<void> {
    await validateAdminSession();
    const { error } = await supabase.rpc("admin_delete_category", {
      p_category_id: id
    });

    if (error) {
      throw error;
    }
  },
};



// User Preferences Tracking System
// Tracks user behavior to improve recommendations

// Firebase removed - user preferences use localStorage only

export interface UserBehavior {
    userId: string;
    viewedProducts: string[];
    searchedCategories: string[];
    searchedCities: string[];
    priceRanges: { min: number; max: number }[];
    lastUpdated: string;
}

export interface PreferenceInsights {
    favoriteCategories: string[];
    preferredPriceRange: { min: number; max: number };
    favoriteCities: string[];
    activityLevel: 'low' | 'medium' | 'high';
}

class UserPreferencesManager {
    private readonly STORAGE_KEY = 'user_preferences';
    private readonly MAX_HISTORY = 50; // Keep last 50 interactions

    // Track product view
    trackProductView(userId: string, productId: string, category: string, city: string, price: number): void {
        try {
            const behavior = this.getUserBehavior(userId);

            // Add to viewed products (avoid duplicates)
            if (!behavior.viewedProducts.includes(productId)) {
                behavior.viewedProducts.unshift(productId);
                behavior.viewedProducts = behavior.viewedProducts.slice(0, this.MAX_HISTORY);
            }

            // Track category
            if (!behavior.searchedCategories.includes(category)) {
                behavior.searchedCategories.unshift(category);
                behavior.searchedCategories = behavior.searchedCategories.slice(0, 10);
            }

            // Track city
            if (!behavior.searchedCities.includes(city)) {
                behavior.searchedCities.unshift(city);
                behavior.searchedCities = behavior.searchedCities.slice(0, 10);
            }

            // Track price range
            behavior.priceRanges.unshift({ min: price * 0.5, max: price * 2 });
            behavior.priceRanges = behavior.priceRanges.slice(0, 20);

            behavior.lastUpdated = new Date().toISOString();

            this.saveUserBehavior(behavior);
        } catch (error) {
            console.error('Failed to track product view:', error);
        }
    }

    // Track search query
    trackSearch(userId: string, query: string, category?: string, city?: string): void {
        try {
            const behavior = this.getUserBehavior(userId);

            if (category && !behavior.searchedCategories.includes(category)) {
                behavior.searchedCategories.unshift(category);
                behavior.searchedCategories = behavior.searchedCategories.slice(0, 10);
            }

            if (city && !behavior.searchedCities.includes(city)) {
                behavior.searchedCities.unshift(city);
                behavior.searchedCities = behavior.searchedCities.slice(0, 10);
            }

            behavior.lastUpdated = new Date().toISOString();
            this.saveUserBehavior(behavior);
        } catch (error) {
            console.error('Failed to track search:', error);
        }
    }

    // Get user behavior
    getUserBehavior(userId: string): UserBehavior {
        try {
            const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to get user behavior:', error);
        }

        return {
            userId,
            viewedProducts: [],
            searchedCategories: [],
            searchedCities: [],
            priceRanges: [],
            lastUpdated: new Date().toISOString()
        };
    }

    // Save user behavior
    private saveUserBehavior(behavior: UserBehavior): void {
        try {
            localStorage.setItem(`${this.STORAGE_KEY}_${behavior.userId}`, JSON.stringify(behavior));
        } catch (error) {
            console.error('Failed to save user behavior:', error);
        }
    }

    // Get preference insights
    getPreferenceInsights(userId: string): PreferenceInsights {
        const behavior = this.getUserBehavior(userId);

        // Calculate favorite categories
        const categoryCounts: { [key: string]: number } = {};
        behavior.searchedCategories.forEach(category => {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        const favoriteCategories = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);

        // Calculate preferred price range
        let preferredPriceRange = { min: 0, max: 1000 };
        if (behavior.priceRanges.length > 0) {
            const avgMin = behavior.priceRanges.reduce((sum, range) => sum + range.min, 0) / behavior.priceRanges.length;
            const avgMax = behavior.priceRanges.reduce((sum, range) => sum + range.max, 0) / behavior.priceRanges.length;
            preferredPriceRange = { min: Math.round(avgMin), max: Math.round(avgMax) };
        }

        // Calculate activity level
        const totalInteractions = behavior.viewedProducts.length + behavior.searchedCategories.length;
        let activityLevel: 'low' | 'medium' | 'high' = 'low';
        if (totalInteractions > 20) activityLevel = 'high';
        else if (totalInteractions > 5) activityLevel = 'medium';

        return {
            favoriteCategories,
            preferredPriceRange,
            favoriteCities: behavior.searchedCities.slice(0, 3),
            activityLevel
        };
    }

    // Clear user data (for privacy)
    clearUserData(userId: string): void {
        try {
            localStorage.removeItem(`${this.STORAGE_KEY}_${userId}`);
        } catch (error) {
            console.error('Failed to clear user data:', error);
        }
    }

    // Get recommendation context
    getRecommendationContext(userId: string): {
        isNewUser: boolean;
        hasPreferences: boolean;
        activityLevel: string;
        insights: PreferenceInsights;
    } {
        const behavior = this.getUserBehavior(userId);
        const insights = this.getPreferenceInsights(userId);

        return {
            isNewUser: behavior.viewedProducts.length === 0,
            hasPreferences: behavior.searchedCategories.length > 0 || behavior.searchedCities.length > 0,
            activityLevel: insights.activityLevel,
            insights
        };
    }
}

// Export singleton instance
export const userPreferencesManager = new UserPreferencesManager();

// Convenience functions
export const trackProductView = (userId: string, productId: string, category: string, city: string, price: number) =>
    userPreferencesManager.trackProductView(userId, productId, category, city, price);

export const trackSearch = (userId: string, query: string, category?: string, city?: string) =>
    userPreferencesManager.trackSearch(userId, query, category, city);

export const getPreferenceInsights = (userId: string) =>
    userPreferencesManager.getPreferenceInsights(userId);

export const getRecommendationContext = (userId: string) =>
    userPreferencesManager.getRecommendationContext(userId);

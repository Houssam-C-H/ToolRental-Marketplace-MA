// Smart Product Recommendation Engine
// Handles different user states and provides personalized recommendations

import { productsAPI } from './api';
import { getRecommendationContext } from './userPreferences';

export interface UserProfile {
    id: string;
    displayName?: string;
    email?: string;
    city?: string;
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
}

export interface RecommendationContext {
    userProfile?: UserProfile | null;
    isLoggedIn: boolean;
    userCity?: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    season: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface ProductRecommendation {
    products: any[];
    reason: string;
    algorithm: 'trending' | 'location' | 'category' | 'price' | 'rating' | 'recent' | 'random';
}

class RecommendationEngine {
    private readonly MAX_RECENT = 8;
    private readonly MAX_SUGGESTED = 8;

    // Get time-based context
    private getTimeContext(): { timeOfDay: string; season: string } {
        const hour = new Date().getHours();
        const month = new Date().getMonth();

        let timeOfDay: string;
        if (hour >= 6 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
        else timeOfDay = 'night';

        let season: string;
        if (month >= 2 && month <= 4) season = 'spring';
        else if (month >= 5 && month <= 7) season = 'summer';
        else if (month >= 8 && month <= 10) season = 'autumn';
        else season = 'winter';

        return { timeOfDay, season };
    }

    // Get recommendations for anonymous users
    private async getAnonymousRecommendations(): Promise<ProductRecommendation> {
        try {
            console.log('👤 Generating recommendations for anonymous user...');

            // Get trending products (relaxed filtering to ensure we have products)
            const trendingResult = await productsAPI.getApprovedProducts(1, 32);

            // Recent products (all products, sorted by date)
            const recent = trendingResult.products
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, this.MAX_RECENT);

            // Suggested products (mix of rating and recent)
            const suggested = trendingResult.products
                .filter(p => p.rating >= 3.0) // Lowered from 4.5 to 3.0
                .sort((a, b) => (b.rating * 0.7 + Math.random() * 0.3) - (a.rating * 0.7 + Math.random() * 0.3))
                .slice(0, this.MAX_SUGGESTED);

            // If we don't have enough products, fill with recent ones
            if (suggested.length < this.MAX_SUGGESTED) {
                const additional = trendingResult.products
                    .filter(p => !suggested.some(s => s.id === p.id))
                    .slice(0, this.MAX_SUGGESTED - suggested.length);
                suggested.push(...additional);
            }

            return {
                products: { recent, suggested },
                reason: 'منتجات حديثة ومقيمة',
                algorithm: 'trending'
            };
        } catch (error) {
            console.error('Failed to get anonymous recommendations:', error);
            return this.getFallbackRecommendations();
        }
    }

    // Get recommendations for new users (just signed up)
    private async getNewUserRecommendations(userProfile: UserProfile): Promise<ProductRecommendation> {
        try {
            console.log('🆕 Generating recommendations for new user...');

            // Get user context from preferences
            const context = getRecommendationContext(userProfile.id);

            // Get location-based recommendations
            const locationResult = await productsAPI.searchProducts({
                city: userProfile.city || undefined,
                page: 1,
                limit: 30
            });

            // Recent products from their city
            const recent = locationResult.products
                .filter(p => !userProfile.city || p.city === userProfile.city)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, this.MAX_RECENT);

            // Mix of popular and local products
            const suggested = locationResult.products
                .filter(p => p.rating >= 4.0)
                .sort((a, b) => (b.rating * 0.7 + Math.random() * 0.3) - (a.rating * 0.7 + Math.random() * 0.3))
                .slice(0, this.MAX_SUGGESTED);

            return {
                products: { recent, suggested },
                reason: userProfile.city ? `منتجات حديثة من ${userProfile.city}` : 'منتجات حديثة ومقيمة',
                algorithm: 'location'
            };
        } catch (error) {
            console.error('Failed to get new user recommendations:', error);
            return this.getFallbackRecommendations();
        }
    }

    // Get recommendations for returning users
    private async getReturningUserRecommendations(userProfile: UserProfile): Promise<ProductRecommendation> {
        try {
            console.log('🔄 Generating recommendations for returning user...');

            // Get user context from preferences
            const context = getRecommendationContext(userProfile.id);

            // Use preference insights if available, otherwise fall back to profile analysis
            const preferredCategories = context.insights.favoriteCategories.length > 0
                ? context.insights.favoriteCategories
                : this.analyzeUserPreferences(userProfile);

            const preferredPriceRange = context.insights.preferredPriceRange.min > 0
                ? context.insights.preferredPriceRange
                : this.analyzePricePreferences(userProfile);

            // Get personalized recommendations
            const personalizedResult = await productsAPI.searchProducts({
                category: preferredCategories[0] || undefined,
                city: userProfile.city || undefined,
                page: 1,
                limit: 40
            });

            // Recent products (mix of preferred categories)
            const recent = personalizedResult.products
                .filter(p =>
                    (!userProfile.city || p.city === userProfile.city) &&
                    (!preferredPriceRange || (p.daily_price >= preferredPriceRange.min && p.daily_price <= preferredPriceRange.max))
                )
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, this.MAX_RECENT);

            // Suggested products (based on history and preferences)
            const suggested = personalizedResult.products
                .filter(p =>
                    preferredCategories.includes(p.category) &&
                    (!preferredPriceRange || (p.daily_price >= preferredPriceRange.min && p.daily_price <= preferredPriceRange.max))
                )
                .sort((a, b) => (b.rating * 0.6 + Math.random() * 0.4) - (a.rating * 0.6 + Math.random() * 0.4))
                .slice(0, this.MAX_SUGGESTED);

            return {
                products: { recent, suggested },
                reason: `منتجات مخصصة لك بناءً على تفضيلاتك`,
                algorithm: 'category'
            };
        } catch (error) {
            console.error('Failed to get returning user recommendations:', error);
            return this.getFallbackRecommendations();
        }
    }

    // Analyze user preferences from history
    private analyzeUserPreferences(userProfile: UserProfile): string[] {
        if (!userProfile.rentalHistory || userProfile.rentalHistory.length === 0) {
            return ['tools', 'equipment']; // Default preferences
        }

        const categoryCounts: { [key: string]: number } = {};
        userProfile.rentalHistory.forEach(rental => {
            categoryCounts[rental.category] = (categoryCounts[rental.category] || 0) + 1;
        });

        return Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);
    }

    // Analyze price preferences
    private analyzePricePreferences(userProfile: UserProfile): { min: number; max: number } | null {
        if (!userProfile.rentalHistory || userProfile.rentalHistory.length === 0) {
            return null;
        }

        const prices = userProfile.rentalHistory
            .map(rental => rental.rating) // Assuming we store price in rating for now
            .filter(price => price > 0);

        if (prices.length === 0) return null;

        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        return {
            min: Math.max(0, avgPrice * 0.5),
            max: avgPrice * 2
        };
    }

    // Fallback recommendations
    private async getFallbackRecommendations(): Promise<ProductRecommendation> {
        try {
            const result = await productsAPI.getApprovedProducts(1, 16);
            return {
                products: {
                    recent: result.products.slice(0, this.MAX_RECENT),
                    suggested: result.products.slice(this.MAX_RECENT, this.MAX_RECENT + this.MAX_SUGGESTED)
                },
                reason: 'منتجات حديثة',
                algorithm: 'recent'
            };
        } catch (error) {
            console.error('Fallback recommendations failed:', error);
            return {
                products: { recent: [], suggested: [] },
                reason: 'لا توجد منتجات متاحة',
                algorithm: 'random'
            };
        }
    }

    // Main recommendation function
    async getRecommendations(userProfile?: UserProfile | null): Promise<{
        recent: any[];
        suggested: any[];
        reason: string;
        algorithm: string;
    }> {
        const context = this.getTimeContext();

        try {
            let recommendation: ProductRecommendation;

            if (!userProfile) {
                // Anonymous user
                recommendation = await this.getAnonymousRecommendations();
            } else if (!userProfile.rentalHistory || userProfile.rentalHistory.length === 0) {
                // New user (no rental history)
                recommendation = await this.getNewUserRecommendations(userProfile);
            } else {
                // Returning user (has rental history)
                recommendation = await this.getReturningUserRecommendations(userProfile);
            }

            console.log(`✅ Recommendations generated using ${recommendation.algorithm} algorithm: ${recommendation.reason}`);

            return {
                recent: recommendation.products.recent,
                suggested: recommendation.products.suggested,
                reason: recommendation.reason,
                algorithm: recommendation.algorithm
            };
        } catch (error) {
            console.error('Failed to generate recommendations:', error);
            const fallback = await this.getFallbackRecommendations();
            return {
                recent: fallback.products.recent,
                suggested: fallback.products.suggested,
                reason: fallback.reason,
                algorithm: fallback.algorithm
            };
        }
    }

    // Get seasonal recommendations
    async getSeasonalRecommendations(): Promise<any[]> {
        const { season } = this.getTimeContext();

        const seasonalCategories: { [key: string]: string[] } = {
            spring: ['tools', 'equipment', 'machinery'],
            summer: ['tools', 'equipment', 'vehicles'],
            autumn: ['tools', 'machinery', 'equipment'],
            winter: ['tools', 'machinery', 'electronics']
        };

        try {
            const result = await productsAPI.searchProducts({
                category: seasonalCategories[season]?.[0],
                page: 1,
                limit: 20
            });

            return result.products
                .filter(p => seasonalCategories[season].includes(p.category))
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 8);
        } catch (error) {
            console.error('Failed to get seasonal recommendations:', error);
            return [];
        }
    }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();

// Convenience functions
export const getSmartRecommendations = (userProfile?: UserProfile | null) =>
    recommendationEngine.getRecommendations(userProfile);

export const getSeasonalRecommendations = () =>
    recommendationEngine.getSeasonalRecommendations();

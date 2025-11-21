import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search as SearchIcon, Filter, MapPin, Star, Heart, Share2, ArrowLeft } from 'lucide-react';
import { productsAPI } from '../lib/api';
import ToolCard from '../components/ToolCard';
import { SEOHead } from '../components/SEOHead';
import { generateBreadcrumbSchema } from '../lib/schemaGenerator';

interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    brand?: string;
    model?: string;
    condition: string;
    daily_price: number;
    city: string;
    neighborhood: string;
    owner_name: string;
    contact_phone?: string;
    contact_whatsapp?: string;
    has_delivery: boolean;
    delivery_price?: number;
    delivery_notes?: string;
    images: string[];
    rating: number;
    reviews_count: number;
    status: string;
    created_at: string;
}

interface SearchFilters {
    category: string;
    city: string;
    minPrice: number;
    maxPrice: number;
    sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'rating';
}

export default function Search() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [filters, setFilters] = useState<SearchFilters>({
        category: searchParams.get('category') || '',
        city: searchParams.get('city') || '',
        minPrice: parseInt(searchParams.get('minPrice') || '0') || 0,
        maxPrice: parseInt(searchParams.get('maxPrice') || '400') || 400,
        sortBy: (searchParams.get('sortBy') as any) || 'newest'
    });

    console.log('Search component rendered with query:', searchQuery);

    const categories = [
        { value: '', label: 'كل الفئات' },
        { value: 'construction', label: 'أدوات البناء' },
        { value: 'electrical', label: 'أدوات كهربائية' },
        { value: 'plumbing', label: 'أدوات السباكة' },
        { value: 'gardening', label: 'أدوات البستنة' },
        { value: 'cleaning', label: 'أدوات التنظيف' },
        { value: 'generators', label: 'مولدات ومضخات' }
    ];

    const cities = [
        { value: '', label: 'كل المدن' },
        { value: 'Rabat', label: 'الرباط' },
        { value: 'Salé', label: 'سلا' },
        { value: 'Casablanca', label: 'الدار البيضاء' },
        { value: 'Fes', label: 'فاس' },
        { value: 'Marrakech', label: 'مراكش' },
        { value: 'Agadir', label: 'أكادير' }
    ];

    // Load favorites from localStorage
    useEffect(() => {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);


    // Search products when query or filters change (with debounce)
    useEffect(() => {
        if (searchQuery.trim()) {
            const timeoutId = setTimeout(() => {
                const performSearch = async () => {
                    setLoading(true);
                    setError(null);

                    try {
                        const result = await productsAPI.searchProducts({
                            search: searchQuery,
                            category: filters.category,
                            city: filters.city,
                            minPrice: filters.minPrice,
                            maxPrice: filters.maxPrice,
                            page: 1,
                            limit: 50
                        });

                        let sortedProducts = result.products || [];

                        // Apply sorting
                        try {
                            switch (filters.sortBy) {
                                case 'newest':
                                    sortedProducts = sortedProducts.sort((a, b) =>
                                        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                                    );
                                    break;
                                case 'oldest':
                                    sortedProducts = sortedProducts.sort((a, b) =>
                                        new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
                                    );
                                    break;
                                case 'price_low':
                                    sortedProducts = sortedProducts.sort((a, b) => (a.daily_price || 0) - (b.daily_price || 0));
                                    break;
                                case 'price_high':
                                    sortedProducts = sortedProducts.sort((a, b) => (b.daily_price || 0) - (a.daily_price || 0));
                                    break;
                                case 'rating':
                                    sortedProducts = sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                                    break;
                            }
                        } catch (sortError) {
                            console.warn('Sorting error:', sortError);
                            // Continue with unsorted products
                        }

                        setProducts(sortedProducts);
                    } catch (err) {
                        setError('حدث خطأ في البحث. يرجى المحاولة مرة أخرى.');
                        console.error('Search error:', err);
                    } finally {
                        setLoading(false);
                    }
                };

                performSearch();
            }, 500); // 500ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [searchQuery, filters.category, filters.city, filters.minPrice, filters.maxPrice, filters.sortBy]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateURL();

        if (searchQuery.trim()) {
            const performSearch = async () => {
                setLoading(true);
                setError(null);

                try {
                    const result = await productsAPI.searchProducts({
                        search: searchQuery,
                        category: filters.category,
                        city: filters.city,
                        minPrice: filters.minPrice,
                        maxPrice: filters.maxPrice,
                        page: 1,
                        limit: 50
                    });

                    let sortedProducts = result.products || [];

                    // Apply sorting
                    try {
                        switch (filters.sortBy) {
                            case 'newest':
                                sortedProducts = sortedProducts.sort((a, b) =>
                                    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                                );
                                break;
                            case 'oldest':
                                sortedProducts = sortedProducts.sort((a, b) =>
                                    new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
                                );
                                break;
                            case 'price_low':
                                sortedProducts = sortedProducts.sort((a, b) => (a.daily_price || 0) - (b.daily_price || 0));
                                break;
                            case 'price_high':
                                sortedProducts = sortedProducts.sort((a, b) => (b.daily_price || 0) - (a.daily_price || 0));
                                break;
                            case 'rating':
                                sortedProducts = sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                                break;
                        }
                    } catch (sortError) {
                        console.warn('Sorting error:', sortError);
                        // Continue with unsorted products
                    }

                    setProducts(sortedProducts);
                } catch (err) {
                    setError('حدث خطأ في البحث. يرجى المحاولة مرة أخرى.');
                    console.error('Search error:', err);
                } finally {
                    setLoading(false);
                }
            };

            performSearch();
        }
    };

    const updateURL = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (filters.category) params.set('category', filters.category);
        if (filters.city) params.set('city', filters.city);
        if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
        if (filters.maxPrice < 400) params.set('maxPrice', filters.maxPrice.toString());
        if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy);

        setSearchParams(params);
    };

    const toggleFavorite = (productId: string) => {
        const newFavorites = favorites.includes(productId)
            ? favorites.filter(id => id !== productId)
            : [...favorites, productId];

        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    };

    const convertToTool = (product: Product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.daily_price,
        priceUnit: 'يوم',
        location: `${product.city}، ${product.neighborhood}`,
        category: product.category,
        condition: product.condition,
        status: product.status,
        owner: product.owner_name,
        rating: product.rating,
        reviews: product.reviews_count,
        lastSeen: product.created_at,
        image: product.images?.[0] || '/placeholder.svg',
        isFavorite: favorites.includes(product.id),
        hasDelivery: product.has_delivery,
        deliveryPrice: product.delivery_price,
        contactPhone: product.contact_phone,
        contactWhatsApp: product.contact_whatsapp
    });

    // Generate SEO data
    const searchQueryText = searchQuery || 'الأدوات';
    const seoTitle = searchQuery
      ? `نتائج البحث عن "${searchQuery}" | منصة تأجير الأدوات`
      : 'البحث عن الأدوات | منصة تأجير الأدوات';
    
    const seoDescription = searchQuery
      ? `اكتشف نتائج البحث عن "${searchQuery}". ${products.length > 0 ? `${products.length} أداة متاحة` : 'أسعار مناسبة، توصيل متاح'}. احجز الآن!`
      : 'ابحث عن الأدوات للإيجار في المغرب. أسعار مناسبة، توصيل متاح.';

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'الرئيسية', url: '/' },
      { name: 'البحث', url: '/recherche' },
    ]);

    return (
        <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
            <SEOHead
              title={seoTitle}
              description={seoDescription}
              url={location.pathname}
              type="website"
              schema={breadcrumbSchema}
            />
            {/* Clean Search Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    {/* Search Form with Back Button */}
                    <div className="flex items-center gap-4">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm whitespace-nowrap"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>العودة</span>
                        </button>

                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن الأدوات..."
                                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange text-right text-gray-900 placeholder-gray-400"
                                dir="rtl"
                            />
                            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                        {/* Filter Button */}
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            <span className="text-sm">فلتر</span>
                        </button>

                        {/* Search Button */}
                        <button
                            type="submit"
                            onClick={handleSearch}
                            className="px-6 py-3 bg-orange hover:bg-orange/90 text-white rounded-xl font-medium transition-colors"
                        >
                            بحث
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <div className="w-72 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-fit">
                            <h3 className="text-lg font-semibold mb-6 text-gray-900">الفلاتر</h3>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">الفئة</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange bg-white"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* City Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">المدينة</label>
                                <select
                                    value={filters.city}
                                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange bg-white"
                                >
                                    {cities.map(city => (
                                        <option key={city.value} value={city.value}>{city.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">نطاق السعر (درهم/يوم)</label>
                                <div className="space-y-3">
                                    <input
                                        type="number"
                                        placeholder="الحد الأدنى"
                                        value={filters.minPrice || ''}
                                        onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange"
                                    />
                                    <input
                                        type="number"
                                        placeholder="الحد الأقصى (افتراضي: 400)"
                                        value={filters.maxPrice || ''}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 400 })}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange"
                                    />
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">ترتيب حسب</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange bg-white"
                                >
                                    <option value="newest">الأحدث</option>
                                    <option value="oldest">الأقدم</option>
                                    <option value="price_low">السعر: من الأقل للأعلى</option>
                                    <option value="price_high">السعر: من الأعلى للأقل</option>
                                    <option value="rating">التقييم</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    نتائج البحث
                                    {searchQuery && (
                                        <span className="text-orange-600">: "{searchQuery}"</span>
                                    )}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {loading ? 'جاري البحث...' : `تم العثور على ${products.length} نتيجة`}
                                </p>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}

                        {/* No Results */}
                        {!loading && !error && products.length === 0 && searchQuery && (
                            <div className="text-center py-12">
                                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">لم يتم العثور على نتائج</h3>
                                <p className="text-gray-600 mb-4">
                                    لم نتمكن من العثور على أي أدوات تطابق بحثك "{searchQuery}"
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>• تأكد من صحة الإملاء</p>
                                    <p>• جرب كلمات مفتاحية مختلفة</p>
                                    <p>• استخدم كلمات عامة أكثر</p>
                                </div>
                            </div>
                        )}

                        {/* Results Grid */}
                        {!loading && !error && products.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                                {products.map((product) => (
                                    <ToolCard
                                        key={product.id}
                                        tool={convertToTool(product)}
                                        isFavorite={favorites.includes(product.id)}
                                        onToggleFavorite={toggleFavorite}
                                        viewMode="grid"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty State - No Search Query */}
                        {!searchQuery && !loading && (
                            <div className="text-center py-12">
                                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">ابدأ البحث عن الأدوات</h3>
                                <p className="text-gray-600">
                                    استخدم شريط البحث أعلاه للعثور على الأدوات التي تحتاجها
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import ToolCard from "../components/ToolCard";
import ToolCardSkeleton from "../components/ToolCardSkeleton";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FloatingComparisonBar from "../components/FloatingComparisonBar";
import { productsAPI, Product } from "../lib/api";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import VirtualGrid from "../components/VirtualGrid";
import { SEOHead } from "../components/SEOHead";
import { generateBreadcrumbSchema } from "../lib/schemaGenerator";

// Lazy load ToolCard for better performance
const LazyToolCard = lazy(() => import("../components/ToolCard"));

// Categories for filtering
const categories = [
  "الكل",
  "الأدوات الكهربائية",
  "معدات البناء",
  "معدات الحفر",
  "أدوات القطع",
  "مولدات",
  "معدات الخلط",
  "سلالم وسقالات",
  "معدات الطلاء",
  "أدوات يدوية",
  "معدات المياه",
  "معدات الهدم",
];

const locations = ["الكل", "الرباط", "سلا", "فاس", "الدار البيضاء", "طنجة"];

const neighborhoods = {
  الكل: ["الكل"],
  الرباط: [
    "الكل",
    "المدينة القديمة",
    "أكدال",
    "الرياض",
    "حسان",
    "الشرفاء",
    "الأوقاف",
    "النكادة",
  ],
  سلا: [
    "الكل",
    "المدينة",
    "طابريكت",
    "لقصيبة",
    "سلا الجديدة",
    "بطانة",
    "العامرية",
    "حي السلام",
  ],
  فاس: ["الكل", "المدينة القديمة", "فاس الجديد", "أزرو", "صفرو"],
  "الدار البيضاء": [
    "الكل",
    "المدينة القديمة",
    "المعاريف",
    "عين الشق",
    "حي الحسن",
    "حي المسيرة",
  ],
  طنجة: ["الكل", "المدينة القديمة", "طنجة المدينة", "طنجة الجديدة", "مالاباطا"],
};

const conditions = [
  "الكل",
  "جديد",
  "مستعمل - حالة ممتازة",
  "مستعمل - حالة جيدة",
];

const sortOptions = [
  { value: "newest", label: "الأحدث" },
  { value: "price-low", label: "السعر: الأقل إلى الأعلى" },
  { value: "price-high", label: "السعر: الأعلى إلى الأقل" },
  { value: "rating", label: "التقييم الأعلى" },
  { value: "reviews", label: "الأكثر تقييماً" },
];

export default function Tools() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const category = searchParams.get('category');
    // Direct mapping from Categories page
    if (category) {
      // Check if category parameter matches any of our available categories
      const availableCategories = [
        "الأدوات الكهربائية",
        "معدات البناء",
        "معدات الحفر",
        "أدوات الحفر",
        "أدوات القطع",
        "معدات القطع",
        "المعدات الثقيلة",
        "أدوات الصيانة",
        "مولدات",
        "معدات الخلط",
        "سلالم وسقالات",
        "معدات الطلاء",
        "أدوات يدوية",
        "معدات المياه",
        "معدات الهدم"
      ];

      if (availableCategories.includes(category)) {
        return category;
      }
    }
    return "الكل";
  });
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const location = searchParams.get('location');
    if (location === 'sale') return 'سلا';
    if (location === 'rabat') return 'الرباط';
    if (location === 'temara') return 'تمارة';
    return "الكل";
  });
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("الكل");
  const [selectedCondition, setSelectedCondition] = useState("الكل");
  const [selectedBrand, setSelectedBrand] = useState("الكل");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<(string | number)[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tool-favorites");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // State for products data
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isInfiniteScroll, setIsInfiniteScroll] = useState(true); // Toggle between pagination and infinite scroll
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false); // Toggle virtual scrolling for large lists

  // Instant search - no debouncing needed

  // Track if this is the initial load
  const isInitialLoad = useRef(true);

  // Simplified fetch products - caching now handled by React Query
  const fetchProducts = async (page: number = 1, resetProducts: boolean = true, scrollToTop: boolean = false) => {
    console.log(`🔄 FetchProducts: Loading page ${page}`, { resetProducts, filters, scrollToTop, isInfiniteScroll });

    try {
      if (resetProducts) {
        if (page === 1) {
          setLoading(true);
        } else {
          setPaginationLoading(true);
        }
        setProducts([]);
      } else {
        setLoadingMore(true);
      }

      // Use searchProducts API for server-side filtering
      console.log(`🌐 Making API call for page ${page}`, { filters, page, limit: 12 });
      const result = await productsAPI.searchProducts({
        ...filters,
        page: page,
        limit: 12 // Only load 12 products per page
      });

      console.log(`📊 API response for page ${page}`, {
        productsCount: result.products?.length || 0,
        totalCount: result.totalCount,
        hasMore: result.hasMore
      });

      // Ensure result.products is an array
      const newProducts = Array.isArray(result.products) ? result.products : [];

      if (resetProducts) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError("فشل في تحميل المنتجات");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setPaginationLoading(false);

      // Scroll to top if requested (for pagination)
      if (scrollToTop) {
        // Use setTimeout to ensure the DOM has updated
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    }
  };

  // Memoize filters for consistent caching
  const filters = useMemo(() => ({
    search: searchQuery || undefined,
    category: selectedCategory !== "الكل" ? selectedCategory : undefined,
    city: selectedLocation !== "الكل" ? selectedLocation : undefined,
    neighborhood: selectedNeighborhood !== "الكل" ? selectedNeighborhood : undefined,
    condition: selectedCondition !== "الكل" ? selectedCondition : undefined,
    brand: selectedBrand !== "الكل" ? selectedBrand : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
  }), [searchQuery, selectedCategory, selectedLocation, selectedNeighborhood, selectedCondition, selectedBrand, priceRange]);

  // Load more products for infinite scroll
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    console.log(`🔄 Loading more products, current page: ${currentPage}`);
    await fetchProducts(currentPage + 1, false, false);
  }, [currentPage, loadingMore, hasMore, filters]);

  // Infinite scroll hook
  const { lastElementRef } = useInfiniteScroll({
    hasMore,
    loading: loadingMore,
    onLoadMore: loadMoreProducts,
    threshold: 0.1,
    rootMargin: "100px"
  });

  // Initial load
  useEffect(() => {
    fetchProducts(1, true);
    // Scroll to top when component mounts (for navigation from other pages)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []); // Only fetch once on mount

  // Refetch when filters change (instant search)
  useEffect(() => {
    // Skip the initial mount - only run when filters actually change
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return; // Don't refetch on initial load
    }

    // Reset to first page when filters change
    setCurrentPage(1);
    fetchProducts(1, true);
  }, [searchQuery, selectedCategory, selectedLocation, selectedNeighborhood, selectedCondition, selectedBrand, priceRange]);


  const toggleFavorite = (toolId: string | number) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId];

      localStorage.setItem("tool-favorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Get available neighborhoods for selected location
  const availableNeighborhoods =
    selectedLocation === "الكل"
      ? ["الكل"]
      : neighborhoods[selectedLocation] || ["الكل"];

  // Render function for virtual grid
  const renderToolCard = useCallback((product: Product, index: number) => {
    const tool = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.daily_price,
      priceUnit: "اليوم",
      location: `${product.city} - ${product.neighborhood}`,
      category: product.category,
      condition: product.condition,
      status: product.status,
      owner: product.owner_name,
      rating: product.rating,
      reviews: product.reviews_count,
      lastSeen: product.updated_at,
      image:
        (product.images && product.images.length > 0)
          ? product.images[0]
          : (product.first_image || "/placeholder.svg"),
      isFavorite: favorites.includes(product.id),
      hasDelivery: product.has_delivery,
      deliveryPrice: product.delivery_price,
      contactPhone: product.contact_phone,
      contactWhatsApp: product.contact_whatsapp,
    };

    return (
      <Suspense fallback={<ToolCardSkeleton viewMode="grid" />}>
        <ToolCard
          tool={tool}
          isFavorite={favorites.includes(product.id)}
          onToggleFavorite={toggleFavorite}
          viewMode="grid"
        />
      </Suspense>
    );
  }, [favorites, toggleFavorite]);

  // Get available brands from products data
  const availableBrands = ["الكل", ...Array.from(new Set(
    products
      .map(product => product.brand)
      .filter(brand => brand && brand.trim() !== "")
  ))].sort((a, b) => {
    if (a === "الكل") return -1;
    if (b === "الكل") return 1;
    return a.localeCompare(b, 'ar');
  });

  // Server-side pagination - no client-side filtering needed
  const totalPages = Math.ceil(totalCount / 12);
  const currentTools = products; // Products are already filtered and paginated by server

  // Reset to first page when filters change
  const resetToFirstPage = () => {
    setCurrentPage(1);
  };


  // Generate SEO data
  const categoryFilter = selectedCategory !== "الكل" ? selectedCategory : null;
  const locationFilter = selectedLocation !== "الكل" ? selectedLocation : null;
  
  const seoTitle = categoryFilter
    ? `${categoryFilter} للإيجار في المغرب${locationFilter ? ` - ${locationFilter}` : ''} | منصة تأجير الأدوات`
    : `جميع الأدوات للإيجار في المغرب${locationFilter ? ` - ${locationFilter}` : ''} | منصة تأجير الأدوات`;
  
  const seoDescription = categoryFilter
    ? `اكتشف مجموعة واسعة من ${categoryFilter} للإيجار في المغرب${locationFilter ? ` في ${locationFilter}` : ''}. ${totalCount > 0 ? `${totalCount} أداة متاحة` : 'أسعار مناسبة، توصيل متاح'}. احجز الآن!`
    : `تصفح آلاف الأدوات للإيجار في المغرب${locationFilter ? ` في ${locationFilter}` : ''}. أسعار مناسبة، توصيل متاح. احجز الآن!`;

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'الرئيسية', url: '/' },
    { name: 'الأدوات', url: '/outils' },
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
      <Navigation
        currentPage="tools"
        showFavoritesCount={true}
        favoritesCount={favorites.length}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="text-gray-600 hover:text-orange transition-colors"
            >
              الرئيسية
            </Link>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-orange font-medium">الأدوات</span>
          </nav>
        </div>
      </div>



      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-sm border border-gray-200">
            {/* Modal Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">الفلاتر</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setSelectedNeighborhood("الكل");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Neighborhood Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحي
                </label>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 disabled:opacity-50 text-sm"
                  disabled={selectedLocation === "الكل"}
                >
                  {availableNeighborhoods.map((neighborhood) => (
                    <option key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm"
                >
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العلامة التجارية
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm"
                >
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نطاق السعر
                </label>
                <div className="bg-orange/5 border border-orange/20 rounded-lg p-2.5 mb-3">
                  <span className="text-orange font-semibold text-sm">
                    {priceRange[0]} - {priceRange[1]} درهم/اليوم
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full slider"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-gray-50 flex gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("الكل");
                  setSelectedLocation("الكل");
                  setSelectedNeighborhood("الكل");
                  setSelectedCondition("الكل");
                  setPriceRange([0, 500]);
                  setSelectedSort("newest");
                  setCurrentPage(1);
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                إعادة تعيين
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors text-sm font-medium"
              >
                تطبيق الفلاتر ({totalCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-4 md:pb-8">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop Only */}
          <aside className="w-64 xl:w-72 hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm border p-4 xl:p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 xl:mb-6">
                الفلاتر
              </h3>

              <div className="space-y-4 xl:space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفئة
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدينة
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => {
                      setSelectedLocation(e.target.value);
                      setSelectedNeighborhood("الكل");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm"
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Neighborhood Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحي
                  </label>
                  <select
                    value={selectedNeighborhood}
                    onChange={(e) => setSelectedNeighborhood(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 disabled:opacity-50 text-sm"
                    disabled={selectedLocation === "الكل"}
                  >
                    {availableNeighborhoods.map((neighborhood) => (
                      <option key={neighborhood} value={neighborhood}>
                        {neighborhood}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm"
                  >
                    {conditions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العلامة التجارية
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm"
                  >
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نطاق السعر
                  </label>
                  <div className="mb-3">
                    <span className="text-orange font-semibold text-sm">
                      {priceRange[0]} - {priceRange[1]} درهم/اليوم
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full slider"
                  />
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("الكل");
                    setSelectedLocation("الكل");
                    setSelectedNeighborhood("الكل");
                    setSelectedCondition("الكل");
                    setSelectedBrand("الكل");
                    setPriceRange([0, 500]);
                    setSelectedSort("newest");
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Left side - Count and Sort Filter */}
                <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-gray-600 text-sm">
                      <span className="font-semibold text-orange">
                        {currentTools.length}
                      </span>{" "}
                      من أصل {totalCount} أداة
                    </span>
                  </div>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Right side - Search Bar */}
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  {/* Mobile Filters Button */}
                  <div className="lg:hidden">
                    <button
                      onClick={() => setShowMobileFilters(true)}
                      className="flex items-center gap-2 bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange/90 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                      </svg>
                      <span>الفلاتر</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative flex-1 lg:flex-none lg:w-80">
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="البحث عن الأدوات..."
                      className="w-full px-10 py-2.5 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 transition-colors text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          // Clear page cache and trigger search
                          setPageCache(new Map());
                          setCurrentPage(1);
                          fetchProducts(1, true);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
                  <p className="text-gray-600">جاري تحميل المنتجات...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <p className="text-gray-800 text-lg mb-2">حدث خطأ</p>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              </div>
            )}


            {/* Tools Grid */}
            {!loading && !error && currentTools.length > 0 && (
              <>
                {useVirtualScrolling ? (
                  <VirtualGrid
                    items={currentTools}
                    itemHeight={400} // Approximate height of ToolCard
                    containerHeight={600} // Fixed container height
                    columns={4}
                    gap={20}
                    renderItem={renderToolCard}
                    className="rounded-xl"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {currentTools.map((product, index) => {
                      // Transform Product to Tool interface
                      const tool = {
                        id: product.id, // Keep as string (UUID) for routing
                        name: product.name,
                        description: product.description,
                        price: product.daily_price,
                        priceUnit: "اليوم",
                        location: `${product.city} - ${product.neighborhood}`,
                        category: product.category,
                        condition: product.condition,
                        status: product.status,
                        owner: product.owner_name,
                        ownerUserId: product.owner_user_id, // Supplier ID for routing
                        rating: product.rating,
                        reviews: product.reviews_count,
                        lastSeen: product.updated_at,
                        image:
                          (product.images && product.images.length > 0)
                            ? product.images[0]
                            : (product.first_image || "/placeholder.svg"),
                        isFavorite: favorites.includes(product.id),
                        hasDelivery: product.has_delivery,
                        deliveryPrice: product.delivery_price,
                        contactPhone: product.contact_phone,
                        contactWhatsApp: product.contact_whatsapp,
                      };

                      // Check if this is the last item for infinite scroll
                      const isLastItem = index === currentTools.length - 1;

                      return (
                        <div
                          key={product.id}
                          ref={isLastItem && isInfiniteScroll ? lastElementRef : null}
                        >
                          <Suspense fallback={<ToolCardSkeleton viewMode="grid" />}>
                            <ToolCard
                              tool={tool}
                              isFavorite={favorites.includes(product.id)}
                              onToggleFavorite={toggleFavorite}
                              viewMode="grid"
                            />
                          </Suspense>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Infinite Scroll Loading Indicator */}
            {isInfiniteScroll && loadingMore && (
              <div className="flex justify-center items-center py-8">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange"></div>
                  <span>جاري تحميل المزيد...</span>
                </div>
              </div>
            )}

            {/* Load More Button (fallback for infinite scroll) */}
            {isInfiniteScroll && hasMore && !loadingMore && !loading && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMoreProducts}
                  className="px-6 py-3 bg-orange text-white rounded-xl font-semibold hover:bg-orange/90 transition-colors"
                >
                  تحميل المزيد
                </button>
              </div>
            )}

            {/* Results Count and View Mode Toggle */}
            {!loading && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center text-gray-600">
                  عرض {currentTools.length} من أصل {totalCount} نتيجة
                </div>

                {/* View Mode Toggle */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setIsInfiniteScroll(true)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isInfiniteScroll
                        ? 'bg-white text-orange shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                      التمرير اللانهائي
                    </button>
                    <button
                      onClick={() => setIsInfiniteScroll(false)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!isInfiniteScroll
                        ? 'bg-white text-orange shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                      الصفحات
                    </button>
                  </div>

                  {/* Virtual Scrolling Toggle */}
                  {currentTools.length > 20 && (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={useVirtualScrolling}
                          onChange={(e) => setUseVirtualScrolling(e.target.checked)}
                          className="w-4 h-4 text-orange border-gray-300 rounded focus:ring-orange"
                        />
                        التمرير الافتراضي (للقوائم الكبيرة)
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && totalPages > 1 && !isInfiniteScroll && (
              <div className="flex justify-center items-center gap-4 mt-8">
                {paginationLoading && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange"></div>
                    <span>جاري التحميل...</span>
                  </div>
                )}
                <button
                  onClick={async () => {
                    try {
                      setPaginationLoading(true);
                      const newPage = Math.max(1, currentPage - 1);
                      await fetchProducts(newPage, true, true); // scrollToTop = true
                    } catch (error) {
                      console.error("Error loading previous page:", error);
                      setError("فشل في تحميل الصفحة");
                    } finally {
                      setPaginationLoading(false);
                    }
                  }}
                  disabled={currentPage === 1 || loading || paginationLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={async () => {
                        try {
                          setPaginationLoading(true);
                          await fetchProducts(page, true, true); // scrollToTop = true
                        } catch (error) {
                          console.error("Error loading page", page, ":", error);
                          setError("فشل في تحميل الصفحة");
                        } finally {
                          setPaginationLoading(false);
                        }
                      }}
                      disabled={loading || paginationLoading}
                      className={`px-3 py-2 rounded-lg ${currentPage === page
                        ? 'bg-orange text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={async () => {
                    try {
                      setPaginationLoading(true);
                      const newPage = Math.min(totalPages, currentPage + 1);
                      await fetchProducts(newPage, true, true); // scrollToTop = true
                    } catch (error) {
                      console.error("Error loading next page:", error);
                      setError("فشل في تحميل الصفحة");
                    } finally {
                      setPaginationLoading(false);
                    }
                  }}
                  disabled={currentPage === totalPages || loading || paginationLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm border p-8">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    لم يتم العثور على أدوات
                  </h3>
                  <p className="text-gray-600 mb-4">
                    لا توجد منتجات متاحة حالياً
                  </p>
                  {products.length === 0 && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("الكل");
                        setSelectedLocation("الكل");
                        setSelectedNeighborhood("الكل");
                        setSelectedCondition("الكل");
                        setSelectedBrand("الكل");
                        setPriceRange([0, 500]);
                        setCurrentPage(1);
                      }}
                      className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange/90 transition-colors"
                    >
                      إعادة تعيين الفلاتر
                    </button>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />

      {/* Floating Comparison Bar */}
      <FloatingComparisonBar />
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from "react";
import { Link, useParams, useSearchParams, useLocation } from "react-router-dom";
import ToolCard from "../components/ToolCard";
import ToolCardSkeleton from "../components/ToolCardSkeleton";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FloatingComparisonBar from "../components/FloatingComparisonBar";
import { productsAPI, categoriesAPI, Product, Category } from "../lib/api";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { OptimizedLoading, ProgressiveLoading } from "../components/ui/optimized-loading";
import { Filter, Grid, List } from "lucide-react";
import { SEOHead } from "../components/SEOHead";
import { generateBreadcrumbSchema } from "../lib/schemaGenerator";

// Lazy load ToolCard for better performance
const LazyToolCard = lazy(() => import("../components/ToolCard"));

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

export default function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : "";

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [selectedLocation, setSelectedLocation] = useState("الكل");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("الكل");
  const [selectedCondition, setSelectedCondition] = useState("الكل");
  const [selectedBrand, setSelectedBrand] = useState("الكل");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedSort, setSelectedSort] = useState("newest");

  const isInitialLoad = useRef(true);

  // Load category info
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const categories = await categoriesAPI.getCategories();
        const foundCategory = categories.find(cat => cat.name === decodedCategoryName);
        if (foundCategory) {
          setCategory(foundCategory);
        }
      } catch (error) {
        console.error("Error loading category:", error);
      }
    };
    if (decodedCategoryName) {
      loadCategory();
    }
  }, [decodedCategoryName]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("tool-favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (page: number = 1, scrollToTop: boolean = false, showPaginationLoader: boolean = false) => {
    if (showPaginationLoader) {
      setPaginationLoading(true);
    } else if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const filters: any = {
        category: decodedCategoryName,
        search: searchQuery || undefined,
        city: selectedLocation !== "الكل" ? selectedLocation : undefined,
        neighborhood: selectedNeighborhood !== "الكل" ? selectedNeighborhood : undefined,
        condition: selectedCondition !== "الكل" ? selectedCondition : undefined,
        brand: selectedBrand !== "الكل" ? selectedBrand : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
      };

      const result = await productsAPI.searchProducts(filters, page, 12);

      if (page === 1) {
        setProducts(result.products);
      } else {
        setProducts(prev => [...prev, ...result.products]);
      }

      setTotalCount(result.totalCount);
      setCurrentPage(page);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setPaginationLoading(false);

      if (scrollToTop) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [decodedCategoryName, searchQuery, selectedLocation, selectedNeighborhood, selectedCondition, selectedBrand, priceRange]);

  // Memoize filters for consistent caching
  const filters = useMemo(() => ({
    search: searchQuery || undefined,
    category: decodedCategoryName,
    city: selectedLocation !== "الكل" ? selectedLocation : undefined,
    neighborhood: selectedNeighborhood !== "الكل" ? selectedNeighborhood : undefined,
    condition: selectedCondition !== "الكل" ? selectedCondition : undefined,
    brand: selectedBrand !== "الكل" ? selectedBrand : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
  }), [decodedCategoryName, searchQuery, selectedLocation, selectedNeighborhood, selectedCondition, selectedBrand, priceRange]);

  // Load more products for infinite scroll
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    await fetchProducts(currentPage + 1, false, false);
  }, [currentPage, loadingMore, hasMore, filters, fetchProducts]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    setCurrentPage(1);
    fetchProducts(1, true);
  }, [searchQuery, selectedLocation, selectedNeighborhood, selectedCondition, selectedBrand, priceRange]);

  const toggleFavorite = (toolId: string | number) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(String(toolId))
        ? prev.filter((id) => id !== String(toolId))
        : [...prev, String(toolId)];

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
      isFavorite: favorites.includes(String(product.id)),
      hasDelivery: product.has_delivery,
      deliveryPrice: product.delivery_price,
      contactPhone: product.contact_phone,
      contactWhatsApp: product.contact_whatsapp,
    };

    return (
      <Suspense fallback={<ToolCardSkeleton viewMode="grid" />}>
        <ToolCard
          tool={tool}
          isFavorite={favorites.includes(String(product.id))}
          onToggleFavorite={toggleFavorite}
          viewMode="grid"
        />
      </Suspense>
    );
  }, [favorites]);

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

  const totalPages = Math.ceil(totalCount / 12);
  const currentTools = products;

  // Generate SEO data
  const seoTitle = category
    ? `${category.name} للإيجار في المغرب | تصفح ${category.name} | منصة تأجير الأدوات`
    : 'تصفح الفئات | منصة تأجير الأدوات';
  
  const seoDescription = category
    ? `اكتشف مجموعة واسعة من ${category.name} للإيجار في المغرب. ${totalCount > 0 ? `${totalCount} أداة متاحة` : 'أسعار مناسبة، توصيل متاح'}. احجز الآن!`
    : 'اكتشف مجموعة واسعة من الأدوات للإيجار في المغرب';

  const categoryImage = category?.hero_image_url || category?.image_url;

  // Generate breadcrumb schema
  const breadcrumbSchema = category ? generateBreadcrumbSchema([
    { name: 'الرئيسية', url: '/' },
    { name: 'الفئات', url: '/categories' },
    { name: category.name, url: `/categorie/${encodeURIComponent(category.name)}` },
  ]) : null;

  return (
    <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
      {category && (
        <SEOHead
          title={seoTitle}
          description={seoDescription}
          image={categoryImage}
          url={location.pathname}
          type="website"
          schema={breadcrumbSchema || undefined}
        />
      )}
      <Navigation
        currentPage="category"
        showFavoritesCount={true}
        favoritesCount={favorites.length}
      />

      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        {category?.hero_image_url ? (
          <>
            <img
              src={category.hero_image_url}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-l from-orange-600 via-orange-500 to-orange-400">
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>
        )}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="text-white w-full max-w-4xl text-right">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-arabic drop-shadow-lg">
              {category?.name || decodedCategoryName}
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-6 font-arabic drop-shadow-md">
              اكتشف {totalCount > 0 ? `${totalCount} أداة` : 'جميع الأدوات'} في هذه الفئة
            </p>
          </div>
        </div>
      </section>

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
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
            <Link
              to="/outils"
              className="text-gray-600 hover:text-orange transition-colors"
            >
              الأدوات
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-orange font-medium">{decodedCategoryName}</span>
          </nav>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-sm border border-gray-200">
            <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 font-arabic">الفلاتر</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">المدينة</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setSelectedNeighborhood("الكل");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-arabic"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              {/* Neighborhood Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">الحي</label>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 disabled:opacity-50 text-sm font-arabic"
                  disabled={selectedLocation === "الكل"}
                >
                  {availableNeighborhoods.map((neighborhood) => (
                    <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                  ))}
                </select>
              </div>
              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">الحالة</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-arabic"
                >
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">العلامة التجارية</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-arabic"
                >
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">نطاق السعر</label>
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
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full slider"
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLocation("الكل");
                  setSelectedNeighborhood("الكل");
                  setSelectedCondition("الكل");
                  setSelectedBrand("الكل");
                  setPriceRange([0, 500]);
                  setCurrentPage(1);
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-arabic"
              >
                إعادة تعيين
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors text-sm font-medium font-arabic"
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4 xl:mb-6 font-arabic">الفلاتر</h3>
              <div className="space-y-4 xl:space-y-6">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">المدينة</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => {
                      setSelectedLocation(e.target.value);
                      setSelectedNeighborhood("الكل");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-arabic"
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                {/* Neighborhood Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">الحي</label>
                  <select
                    value={selectedNeighborhood}
                    onChange={(e) => setSelectedNeighborhood(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 disabled:opacity-50 text-sm font-arabic"
                    disabled={selectedLocation === "الكل"}
                  >
                    {availableNeighborhoods.map((neighborhood) => (
                      <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                    ))}
                  </select>
                </div>
                {/* Condition Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">الحالة</label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-arabic"
                  >
                    {conditions.map((condition) => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">العلامة التجارية</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-arabic"
                  >
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">نطاق السعر</label>
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
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full slider"
                  />
                </div>
                {/* Reset Button */}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLocation("الكل");
                    setSelectedNeighborhood("الكل");
                    setSelectedCondition("الكل");
                    setSelectedBrand("الكل");
                    setPriceRange([0, 500]);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-arabic"
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
                <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-gray-600 text-sm font-arabic">
                      <span className="font-semibold text-orange">{currentTools.length}</span> من{" "}
                      <span className="font-semibold">{totalCount}</span> أداة
                    </span>
                  </div>
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-arabic"
                  >
                    <Filter className="w-4 h-4" />
                    فلاتر
                  </button>
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-right outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-arabic"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "grid" ? "bg-orange text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "list" ? "bg-orange text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <ProgressiveLoading
              isLoading={loading}
              fallback={<OptimizedLoading count={12} type="grid" />}
              minLoadingTime={300}
            >
              {currentTools.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <p className="text-gray-500 text-lg font-arabic">لا توجد منتجات في هذه الفئة</p>
                </div>
              ) : (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
                  : "grid grid-cols-1 gap-4 lg:gap-6"
                }>
                  {currentTools.map((product, index) => {
                    const isLastItem = index === currentTools.length - 1;
                    return (
                      <div
                        key={product.id}
                        ref={isLastItem ? lastElementRef : null}
                      >
                        {renderToolCard(product, index)}
                      </div>
                    );
                  })}
                  {loadingMore && (
                    <div className="col-span-full flex justify-center items-center py-8">
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange"></div>
                        <span>جاري تحميل المزيد...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ProgressiveLoading>

            {/* Pagination Loading */}
            {paginationLoading && (
              <div className="mt-6 flex justify-center">
                <OptimizedLoading count={4} type="grid" />
              </div>
            )}
          </main>
        </div>
      </div>

      <FloatingComparisonBar />
      <Footer />
    </div>
  );
}


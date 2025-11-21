import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import ToolCard from "../components/ToolCard";
import { productsAPI, categoriesAPI, Category } from "../lib/api";
// Firebase dependencies removed - using Supabase directly
import { getSmartRecommendations, UserProfile } from "../lib/recommendationEngine";
import { OptimizedLoading, ProgressiveLoading } from "../components/ui/optimized-loading";
// FirebaseProductCard removed - using ToolCard
import { useAuth } from "../contexts/AuthContext";
import { SEOHead } from "../components/SEOHead";
import { generateWebSiteSchema, generateOrganizationSchema, combineSchemas } from "../lib/schemaGenerator";
import {
    Heart,
    Star,
    MapPin,
    Calendar,
    Check,
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Hammer,
    Wrench,
    Drill,
    Construction,
    Truck,
    HardHat,
    ChevronDown,
    Plus,
    Phone,
    Mail,
    Users,
    Search,
    Settings,
    Zap,
    Target,
    Shield,
    Gauge,
    Sprout,
    Building2,
    Briefcase,
    Scissors
} from "lucide-react";

export default function Index() {
    const location = useLocation();
    const { currentUser, userProfile } = useAuth();
    const [recentProducts, setRecentProducts] = useState([]);
    const [suggestedProducts, setSuggestedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openFAQ, setOpenFAQ] = useState(null);
    const [recommendationReason, setRecommendationReason] = useState('');
    const [recommendationAlgorithm, setRecommendationAlgorithm] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [categories, setCategories] = useState<Array<{ name: string; icon: any; image_url?: string; count: string }>>([]);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    // Icon mapping function
    const getIconComponent = (iconName: string) => {
        const iconMap: { [key: string]: any } = {
            'Zap': Zap,
            'HardHat': HardHat,
            'Drill': Drill,
            'Construction': Construction,
            'Truck': Truck,
            'Settings': Settings,
            'Wrench': Wrench,
            'Hammer': Hammer,
        };
        return iconMap[iconName] || Settings; // Default to Settings if icon not found
    };

    const loadCategories = async () => {
        try {
            const categoriesData = await categoriesAPI.getCategories();
            const categoriesWithIcons = categoriesData.map((cat: Category) => ({
                name: cat.name,
                icon: getIconComponent(cat.icon_name),
                image_url: cat.image_url,
                count: cat.product_count ? `${cat.product_count}+` : "0+"
            }));
            setCategories(categoriesWithIcons);
        } catch (error) {
            console.error("Error loading categories:", error);
            // Fallback to hardcoded categories if API fails
            setCategories([
                { name: "الأدوات الكهربائية", icon: Zap, image_url: undefined, count: "120+" },
                { name: "معدات البناء", icon: HardHat, image_url: undefined, count: "89+" },
                { name: "أدوات الحفر", icon: Drill, image_url: undefined, count: "67+" },
                { name: "معدات القطع", icon: Construction, image_url: undefined, count: "45+" },
                { name: "المعدات الثقيلة", icon: Truck, image_url: undefined, count: "23+" },
                { name: "أدوات الصيانة", icon: Settings, image_url: undefined, count: "78+" }
            ]);
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);

            // Create user profile for recommendations
            const userProfileForRecommendations: UserProfile | null = userProfile ? {
                id: currentUser?.id || '',
                displayName: userProfile?.display_name,
                email: userProfile?.email,
                city: userProfile?.city,
                preferences: {
                    categories: userProfile?.preferences?.categories,
                    priceRange: userProfile?.preferences?.priceRange,
                    preferredCities: userProfile?.preferences?.preferredCities
                },
                rentalHistory: userProfile?.rentalHistory || [],
                searchHistory: userProfile?.searchHistory || []
            } : null;

            // Use direct Supabase API (reliable)
            console.log('📦 Loading products from Supabase...');

            // Final fallback to Supabase with caching (using optimized default fields)
            const result = await productsAPI.getApprovedProducts(1, 32);

            console.log('📦 Main page received products:', {
                count: result.products.length,
                totalCount: result.totalCount
            });

            // Get recent products (first 8, ensure at least 4)
            let recent = result.products.slice(0, 8);
            if (recent.length < 4) {
                // If we don't have enough recent products, fill with any products
                recent = result.products.slice(0, Math.max(4, recent.length));
            }
            setRecentProducts(recent);

            // Get suggested products (next 8, ensure at least 4)
            let suggested = result.products.slice(8, 16);
            if (suggested.length < 4) {
                // If we don't have enough suggested products, fill with remaining products
                const remaining = result.products.slice(8);
                suggested = remaining.slice(0, Math.max(4, suggested.length));
            }
            setSuggestedProducts(suggested);

            setRecommendationReason('منتجات حديثة');
            setRecommendationAlgorithm('recent');
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback to empty arrays
            setRecentProducts([]);
            setSuggestedProducts([]);
            setRecommendationReason('لا توجد منتجات متاحة');
            setRecommendationAlgorithm('random');
        } finally {
            setLoading(false);
        }
    };

    // Hero carousel slides data
    const heroSlides = [
        {
            title: "تأجير",
            subtitle: "وجهتك الأولى لتأجير أدوات البناء والبريكولاج",
            description: "أي أداة تحتاجها لمشروعك، قريبة ولا مكلفة. موجودة عندنا ومتوفرة الآن فقط سيتطلب منك مكالمة واحدة. جرب الآن واشوف الفرق عن الطرق التقليدية",
            primaryButton: { text: "تصفح الأدوات", link: "/outils", color: "bg-orange hover:bg-orange/90" },
            secondaryButton: { text: "أضف أداتك", link: "/ajouter-equipement", color: "bg-sky-500 hover:bg-sky-600" },
            gradient: "from-gray-800 via-gray-700 to-gray-900"
        },
        {
            title: "أدوات البناء",
            subtitle: "كل ما تحتاجه لمشروعك في مكان واحد",
            description: "من المثقاب الكهربائي إلى الرافعة الثقيلة، نوفر لك آلاف الأدوات والمعدات بأسعار منافسة وخدمة ممتازة",
            primaryButton: { text: "استكشف الفئات", link: "/categories", color: "bg-teal hover:bg-teal/90" },
            secondaryButton: { text: "كيف يعمل", link: "#how-it-works", color: "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20" },
            gradient: "from-blue-900 via-blue-800 to-indigo-900"
        },
        {
            title: "كسب المال",
            subtitle: "أضف أداتك وابدأ في كسب دخل إضافي",
            description: "لديك أدوات لا تستخدمها؟ أضفها على منصتنا واجعلها مصدر دخل. آلاف الباحثين يبحثون عن أدواتك كل يوم",
            primaryButton: { text: "أضف أداتك الآن", link: "/ajouter-equipement", color: "bg-green-500 hover:bg-green-600" },
            secondaryButton: { text: "تعرف على المزيد", link: "/a-propos", color: "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20" },
            gradient: "from-emerald-900 via-teal-800 to-cyan-900"
        }
    ];

    // Auto-play carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 6000); // Change slide every 6 seconds

        return () => clearInterval(interval);
    }, [heroSlides.length]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };



    const faqData = [
        {
            question: "ما هي شروط تأجير الأدوات؟",
            answer: "تحتاج إلى هوية صالحة وضمان مالي حسب قيمة الأداة. يتم الاتفاق على مدة الإيجار وطريقة الدفع مسبقاً."
        },
        {
            question: "كيف يتم الدفع؟",
            answer: "يتم الدفع مباشرة للمالك نقداً أو تحويل بنكي حسب الاتفاق. ننصح بتوثيق عملية الدفع بإيصال."
        },
        {
            question: "ماذا لو تعطلت الأداة؟",
            answer: "في حالة التعطل غير المقصود، يتم التواصل مع المالك فوراً لتقييم الوضع وتحديد المسؤولية."
        },
        {
            question: "هل يمكن إلغاء الحجز؟",
            answer: "يمكن إلغاء الحجز حسب شروط المالك. ننصح بقراءة شروط الإلغاء قبل تأكيد الحجز."
        },
        {
            question: "كيف أضيف أداتي للمنصة؟",
            answer: "يمكنك إضافة أداتك بسهولة من خلال النقر على 'أضف أداتك' وملء النموذج المطلوب."
        }
    ];

    const partners = [
        "TC Tech", "TC Tech", "TC Tech", "TC Tech", "TC Tech", "TC Tech", "TC Tech"
    ];

    const transformProductToTool = (product) => ({
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
        image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg",
        isFavorite: false,
        hasDelivery: product.has_delivery,
        deliveryPrice: product.delivery_price,
        contactPhone: product.contact_phone,
        contactWhatsApp: product.contact_whatsapp,
    });

    // Generate SEO schemas
    const websiteSchema = generateWebSiteSchema();
    const organizationSchema = generateOrganizationSchema();
    const combinedSchema = combineSchemas(websiteSchema, organizationSchema);

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <SEOHead
                title="تأجير أدوات البناء في المغرب | منصة تأجير الأدوات"
                description="منصة رائدة في تأجير أدوات البناء والبريكولاج بالمغرب. اكتشف مجموعة واسعة من الأدوات للإيجار بأسعار مناسبة. آلاف الأدوات المتاحة الآن!"
                url={location.pathname}
                type="website"
                schema={combinedSchema}
            />
            {/* Navigation */}
            <Navigation currentPage="home" />

            {/* Hero Carousel Section */}
            <section className="py-8 md:py-12" dir="rtl">
                <div className="container mx-auto px-4">
                    {/* Hero Container - Two-column RTL flex */}
                    <div 
                        className="flex flex-col lg:flex-row items-stretch rounded-3xl overflow-hidden"
                        style={{
                            backgroundColor: '#000000',
                            border: '3px solid #00A3FF',
                            minHeight: '500px'
                        }}
                    >
                        {/* Right Column - Text & CTAs */}
                        <div className="w-full lg:w-1/2 flex flex-col justify-center text-right p-8 md:p-10 lg:p-12">
                            {/* Headline */}
                            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold leading-[1.3] text-white font-arabic mb-4">
                                <span style={{ color: '#FF6A00' }}>تأجير</span>
                                <span className="text-white"> – وجهتك الأولى لتأجير أدوات البناء والبريڭولاج …</span>
                            </h1>

                            {/* Description Paragraph */}
                            <p className="text-base md:text-lg text-right font-arabic mb-6 md:mb-8" style={{ color: '#D0D0D0', marginTop: '16px' }}>
                                أي أداة تحتاجها لمشروعك، كبيرة ولا صغيرة، موجودة عندنا جاهزة للكراء. ساهل. سريع ومضمون. عندك بلا تيه، باش تخدم مشروعك بلا ما تضيع وقت.
                            </p>

                            {/* CTA Buttons Container - Side by side (RTL) */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                {/* Primary CTA - Browse Tools */}
                                <Link
                                    to="/outils"
                                    className="px-6 py-3.5 rounded-xl font-bold text-white transition-all duration-200 hover:opacity-90 font-arabic text-center whitespace-nowrap inline-flex items-center gap-2"
                                    style={{ backgroundColor: '#FF6A00' }}
                                >
                                    <Search className="w-4 h-4" />
                                    تصفح الأدوات
                                </Link>

                                {/* Secondary CTA - Add Tools */}
                                <Link
                                    to="/ajouter-equipement"
                                    className="px-6 py-3.5 rounded-xl font-bold text-white transition-all duration-200 hover:opacity-90 font-arabic text-center whitespace-nowrap inline-flex items-center gap-2"
                                    style={{ backgroundColor: '#00C39A' }}
                                >
                                    أضف أدواتك <Plus className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Left Column - Image (Full wrap) */}
                        <div className="w-full lg:w-1/2 relative h-[300px] md:h-[400px] lg:h-auto">
                            <img
                                src="/hero-image.jpg"
                                alt="موقع بناء - عمال على السقالات"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            
                            {/* Black fade gradient on the right side merging with background */}
                            <div 
                                className="absolute inset-0 pointer-events-none z-10"
                                style={{
                                    background: 'linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.7) 60%, rgba(0, 0, 0, 1) 100%)'
                                }}
                            />
                            
                            {/* Carousel Pagination Dots - Under image (left) */}
                            <div className="absolute bottom-4 right-1/2 translate-x-1/2 lg:right-4 lg:translate-x-0 flex gap-2 z-20">
                                {heroSlides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`transition-all duration-300 rounded-full ${
                                            index === currentSlide
                                                ? 'w-3 h-3'
                                                : 'w-2.5 h-2.5'
                                        }`}
                                        style={{
                                            backgroundColor: index === currentSlide ? '#FF6A00' : 'rgba(255, 255, 255, 0.33)'
                                        }}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white" id="categories">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 font-arabic text-center">
                            الفئات المفضلة
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-arabic text-center">
                            اكتشف الأدوات والمعدات اللي كتحتاجها لمشاريعك فالبي والبن
                        </p>
                    </div>
                    {/* Horizontal list of six category cards - single line */}
                    <div className="flex flex-nowrap justify-between items-center gap-4 md:gap-6 overflow-x-auto pb-2">
                        {/* Category 1: المولدات والمضخات - Pump/Motor icon */}
                        <Link
                            to="/categorie/المولدات والمضخات"
                            className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-orange-200 flex flex-col items-center justify-center flex-1 min-w-[140px] max-w-[200px] min-h-[180px]"
                        >
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl mb-4 group-hover:from-orange-200 group-hover:to-orange-100 transition-all duration-300 shadow-md group-hover:shadow-lg p-2">
                                <img src="/المولدات والمضخات.png" alt="المولدات والمضخات" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2 text-base md:text-lg font-arabic group-hover:text-orange-500 transition-colors min-h-[3rem] flex items-center justify-center text-center leading-tight">المولدات والمضخات</h3>
                        </Link>

                        {/* Category 2: معدات البستنة - Lawnmower icon */}
                        <Link
                            to="/categorie/معدات البستنة"
                            className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-orange-200 flex flex-col items-center justify-center flex-1 min-w-[140px] max-w-[200px] min-h-[180px]"
                        >
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl mb-4 group-hover:from-green-200 group-hover:to-green-100 transition-all duration-300 shadow-md group-hover:shadow-lg p-2">
                                <img src="/معدات الجرديناج.png" alt="معدات البستنة" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2 text-base md:text-lg font-arabic group-hover:text-orange-500 transition-colors min-h-[3rem] flex items-center justify-center text-center leading-tight">معدات البستنة</h3>
                        </Link>

                        {/* Category 3: معدات البناء الكبيرة - Crane icon */}
                        <Link
                            to="/categorie/معدات البناء الكبيرة"
                            className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-orange-200 flex flex-col items-center justify-center flex-1 min-w-[140px] max-w-[200px] min-h-[180px]"
                        >
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl mb-4 group-hover:from-blue-200 group-hover:to-blue-100 transition-all duration-300 shadow-md group-hover:shadow-lg p-2">
                                <img src="/معدات البناء الكبيرة.png" alt="معدات البناء الكبيرة" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2 text-base md:text-lg font-arabic group-hover:text-orange-500 transition-colors min-h-[3rem] flex items-center justify-center text-center leading-tight">معدات البناء الكبيرة</h3>
                        </Link>

                        {/* Category 4: أدوات (البريكولاج) - Toolbox icon */}
                        <Link
                            to="/categorie/أدوات البريكولاج"
                            className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-orange-200 flex flex-col items-center justify-center flex-1 min-w-[140px] max-w-[200px] min-h-[180px]"
                        >
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl mb-4 group-hover:from-purple-200 group-hover:to-purple-100 transition-all duration-300 shadow-md group-hover:shadow-lg p-2">
                                <img src="/أدوات  (البريكولاج).png" alt="أدوات (البريكولاج)" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2 text-base md:text-lg font-arabic group-hover:text-orange-500 transition-colors min-h-[3rem] flex items-center justify-center text-center leading-tight">أدوات (البريكولاج)</h3>
                        </Link>

                        {/* Category 5: أدوات القص والتقطيع - Circular saw icon */}
                        <Link
                            to="/categorie/أدوات القص والتقطيع"
                            className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-orange-200 flex flex-col items-center justify-center flex-1 min-w-[140px] max-w-[200px] min-h-[180px]"
                        >
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl mb-4 group-hover:from-red-200 group-hover:to-red-100 transition-all duration-300 shadow-md group-hover:shadow-lg p-2">
                                <img src="/أدوات القصّ والتقطيع.png" alt="أدوات القص والتقطيع" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2 text-base md:text-lg font-arabic group-hover:text-orange-500 transition-colors min-h-[3rem] flex items-center justify-center text-center leading-tight">أدوات القص والتقطيع</h3>
                        </Link>

                        {/* Category 6: أدوات الحفر والتنقيب - Excavator/Drill icon */}
                        <Link
                            to="/categorie/أدوات الحفر والتنقيب"
                            className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-orange-200 flex flex-col items-center justify-center flex-1 min-w-[140px] max-w-[200px] min-h-[180px]"
                        >
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl mb-4 group-hover:from-yellow-200 group-hover:to-yellow-100 transition-all duration-300 shadow-md group-hover:shadow-lg p-2">
                                <img src="/أدوات الحفر والتنقيب.png" alt="أدوات الحفر والتنقيب" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2 text-base md:text-lg font-arabic group-hover:text-orange-500 transition-colors min-h-[3rem] flex items-center justify-center text-center leading-tight">أدوات الحفر والتنقيب</h3>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Recently Added Products */}
            <section className="py-16 md:py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-16 gap-4">
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 md:mb-4 font-arabic">
                                الأدوات المضافة حديثاً
                            </h2>
                        </div>
                        <Link
                            to="/tools"
                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
                            style={{ backgroundColor: '#FF6A18' }}
                        >
                            عرض جميع الأدوات
                        </Link>
                    </div>

                    <ProgressiveLoading
                        isLoading={loading}
                        fallback={<OptimizedLoading count={4} type="grid" />}
                        minLoadingTime={300}
                    >
                        {/* Horizontal scrollable carousel */}
                        <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {recentProducts.slice(0, 4).map((product) => (
                                <div key={product.id} className="relative flex-shrink-0 w-[280px] md:w-[300px] lg:w-[320px]">
                                    {/* NEW Badge */}
                                    <div className="absolute top-3 right-3 z-10 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                                        جديد
                                    </div>
                                    <ToolCard
                                        tool={transformProductToTool(product)}
                                        isFavorite={false}
                                        onToggleFavorite={() => { }}
                                        viewMode="grid"
                                    />
                                </div>
                            ))}
                        </div>
                    </ProgressiveLoading>
                </div>
            </section>

            {/* Suggested Tools */}
            <section className="py-16 md:py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-16 gap-4">
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 md:mb-4 font-arabic">
                                الأدوات المقترحة
                            </h2>
                        </div>
                        <Link
                            to="/tools"
                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
                            style={{ backgroundColor: '#FF6A18' }}
                        >
                            عرض جميع الأدوات
                        </Link>
                    </div>

                    <ProgressiveLoading
                        isLoading={loading}
                        fallback={<OptimizedLoading count={4} type="grid" />}
                        minLoadingTime={300}
                    >
                        {/* Horizontal scrollable carousel */}
                        <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {suggestedProducts.slice(0, 4).map((product) => (
                                <div key={product.id} className="relative flex-shrink-0 w-[280px] md:w-[300px] lg:w-[320px]">
                                    <ToolCard
                                        tool={transformProductToTool(product)}
                                        isFavorite={false}
                                        onToggleFavorite={() => { }}
                                        viewMode="grid"
                                    />
                                </div>
                            ))}
                        </div>
                    </ProgressiveLoading>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50" id="how-it-works">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 font-arabic text-center">
                            كيف تعمل منصتنا
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-arabic text-center">
                            خطوات بسيطة للحصول على الأدوات المناسبة لمشروعك في سلا ومنطقة الرباط
                        </p>
                    </div>

                    {/* Four-step horizontal workflow (RTL: 1 -> 2 -> 3 -> 4 from right to left) */}
                    <div className="max-w-6xl mx-auto" dir="rtl">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {/* Step 1: استكشف المنصة (Rightmost in RTL) */}
                            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 relative">
                                <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">1</span>
                                </div>
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 mt-8">
                                    <Search className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 font-arabic text-center">
                                    استكشف المنصة
                                </h3>
                                <p className="text-gray-600 text-sm md:text-base leading-relaxed font-arabic text-center">
                                    تصفح مئات الأدوات المتاحة في سلا أولا ثم في الرباط وابحث بسهولة.
                                </p>
                            </div>

                            {/* Step 2: اختر الأداة المثالية */}
                            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 relative">
                                <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">2</span>
                                </div>
                                <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 mt-8">
                                    <Target className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 font-arabic text-center">
                                    اختر الأداة المثالية
                                </h3>
                                <p className="text-gray-600 text-sm md:text-base leading-relaxed font-arabic text-center">
                                    قارن بين الأدوات المتوفرة في منطقتك واختر الأنسب لمشروعك وميزانيتك.
                                </p>
                            </div>

                            {/* Step 3: تواصل مع المالك */}
                            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 relative">
                                <div className="absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#ea580c', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' }}>
                                    <span className="text-white font-bold text-lg">3</span>
                                </div>
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 mt-8">
                                    <Phone className="w-8 h-8 text-orange-600" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 font-arabic text-center">
                                    تواصل مع المالك
                                </h3>
                                <p className="text-gray-600 text-sm md:text-base leading-relaxed font-arabic text-center">
                                    تواصل مباشرة مع مالك الأداة لتأكيد التفاصيل وتحديد موعد الاستلام.
                                </p>
                            </div>

                            {/* Step 4: ابدأ مشروعك (Leftmost in RTL) */}
                            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 relative">
                                <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">4</span>
                                </div>
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 mt-8">
                                    <Check className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 font-arabic text-center">
                                    ابدأ مشروعك
                                </h3>
                                <p className="text-gray-600 text-sm md:text-base leading-relaxed font-arabic text-center">
                                    احصل على الأدوات المطلوبة وابدأ العمل في مشروعك بثقة وأمان.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Proposition Banners */}
            <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white" dir="rtl">
                <div className="container mx-auto px-4">
                    {/* Two-column layout: side-by-side on large screens, stacked on mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
                        {/* Banner 1 - Renting/Buying (Left Side in RTL) */}
                        <div className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 min-h-[280px] md:min-h-[320px]">
                            {/* Brand Orange gradient background */}
                            <div 
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(135deg, #1a0f00 0%, #2d1a00 25%, #3d2500 50%, #2d1a00 75%, #1a0f00 100%)',
                                }}
                            ></div>
                            
                            {/* Animated orange glow effects - smaller and more compact */}
                            <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 opacity-50 rounded-full blur-3xl group-hover:opacity-60 transition-opacity duration-500 animate-pulse" style={{ background: 'linear-gradient(135deg, #FF6A18 0%, #FF8533 50%, #FF6A00 100%)' }}></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-400 to-orange-500 opacity-40 rounded-full blur-2xl group-hover:opacity-50 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #FF8533 0%, #FF6A18 100%)' }}></div>
                            <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-gradient-to-br from-orange-300 to-orange-400 opacity-30 rounded-full blur-xl group-hover:opacity-40 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #FFA366 0%, #FF8533 100%)' }}></div>
                            
                            {/* Decorative grid pattern overlay */}
                            <div className="absolute inset-0 opacity-[0.04]">
                                <div 
                                    className="absolute inset-0" 
                                    style={{
                                        backgroundImage: 'linear-gradient(rgba(255,106,24,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,106,24,0.15) 1px, transparent 1px)',
                                        backgroundSize: '25px 25px'
                                    }}
                                ></div>
                            </div>
                            
                            {/* Compact Metric Badge - Top Right Corner */}
                            <div className="absolute top-3 right-3 z-20 bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md rounded-lg px-3 py-1.5 border border-orange-300/40 shadow-md hover:scale-105 transition-transform duration-300">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#FF6A18' }}></div>
                                    <p className="text-white text-xs font-bold font-arabic drop-shadow-md">
                                        أكثر من 500 أداة
                                    </p>
                                </div>
                            </div>
                            
                            {/* Text Content - compact spacing */}
                            <div className="relative z-10 flex flex-col justify-between h-full p-5 md:p-6 lg:p-7">
                                <div className="flex-1 flex flex-col justify-center items-end text-right">
                                    {/* Primary Headline - more compact */}
                                    <h3 className="text-2xl md:text-3xl lg:text-3xl font-extrabold text-white mb-2 md:mb-3 font-arabic leading-[1.3] drop-shadow-2xl text-right w-full tracking-tight">
                                        وفر حتى 70% من ميزانية مشروعك!
                                    </h3>
                                    
                                    {/* Secondary Text - more compact */}
                                    <p className="text-orange-50 md:text-white text-sm md:text-base leading-relaxed font-arabic mb-4 md:mb-5 drop-shadow-lg text-right w-full font-medium" style={{ textAlign: 'right', direction: 'rtl' }}>
                                        استأجر أدوات احترافية بالساعة أو اليوم. احصل عليها جاهزة للموقع.
                                    </p>
                                </div>
                                
                                {/* Compact CTA Button - Brand Orange */}
                                <Link
                                    to="/tools"
                                    className="group/btn inline-flex items-center justify-center gap-2 text-white px-6 md:px-7 py-2.5 md:py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg font-arabic w-full md:w-auto self-end text-base relative overflow-hidden"
                                    style={{ 
                                        backgroundColor: '#FF6A18',
                                        boxShadow: '0 10px 15px -3px rgba(255, 106, 24, 0.3), 0 4px 6px -2px rgba(255, 106, 24, 0.2)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FF8533';
                                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(255, 106, 24, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FF6A18';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(255, 106, 24, 0.3), 0 4px 6px -2px rgba(255, 106, 24, 0.2)';
                                    }}
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></span>
                                    <Search className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10">ابدأ البحث الآن</span>
                                </Link>
                            </div>
                        </div>

                        {/* Banner 2 - Monetization/Selling (Right Side in RTL) */}
                        <div className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 min-h-[280px] md:min-h-[320px]">
                            {/* Brand Teal gradient background */}
                            <div 
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(135deg, #003d30 0%, #005a4a 25%, #007763 50%, #005a4a 75%, #003d30 100%)',
                                }}
                            ></div>
                            
                            {/* Animated teal glow effects - smaller and more compact */}
                            <div className="absolute top-0 left-0 w-56 h-56 bg-gradient-to-br from-teal-400/50 to-teal-500/50 rounded-full blur-3xl group-hover:opacity-60 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #00C39A 0%, #00E6B8 50%, #00A68A 100%)' }}></div>
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-teal-300/40 to-teal-400/40 rounded-full blur-2xl group-hover:opacity-50 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #00E6B8 0%, #00C39A 100%)' }}></div>
                            <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-br from-teal-200/30 to-teal-300/30 rounded-full blur-xl group-hover:opacity-40 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #4DD4B8 0%, #00E6B8 100%)' }}></div>
                            
                            {/* Enhanced pattern overlay */}
                            <div className="absolute inset-0 opacity-[0.06]">
                                <div 
                                    className="absolute inset-0" 
                                    style={{
                                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,195,154,0.25) 1.5px, transparent 0)',
                                        backgroundSize: '30px 30px'
                                    }}
                                ></div>
                            </div>
                            
                            {/* Compact Trust Badge - Top Right Corner */}
                            <div className="absolute top-3 right-3 z-20 bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md rounded-lg px-3 py-1.5 border border-teal-300/40 shadow-md hover:scale-105 transition-transform duration-300">
                                <div className="flex items-center gap-1.5">
                                    <div className="p-1 bg-white/20 rounded">
                                        <Shield className="w-3 h-3 text-white drop-shadow-md" />
                                    </div>
                                    <p className="text-white text-xs font-bold font-arabic drop-shadow-md">
                                        نظام حماية
                                    </p>
                                </div>
                            </div>
                            
                            {/* Text Content - compact spacing */}
                            <div className="relative z-10 flex flex-col justify-between h-full p-5 md:p-6 lg:p-7">
                                <div className="flex-1 flex flex-col justify-center items-end text-right">
                                    {/* Primary Headline - more compact */}
                                    <h3 className="text-2xl md:text-3xl lg:text-3xl font-extrabold text-white mb-2 md:mb-3 font-arabic leading-[1.3] drop-shadow-2xl text-right w-full tracking-tight">
                                        حوّل أدواتك المدخرة إلى دخل شهري إضافي
                                    </h3>
                                    
                                    {/* Secondary Text - more compact */}
                                    <p className="text-teal-50 md:text-white text-sm md:text-base leading-relaxed font-arabic mb-4 md:mb-5 drop-shadow-lg text-right w-full font-medium" style={{ textAlign: 'right', direction: 'rtl' }}>
                                        اضمن مدخولاً ثابتاً من معداتك غير المستعملة. نظام آمن وموثوق.
                                    </p>
                                </div>
                                
                                {/* Compact CTA Button - Brand Orange */}
                                <Link
                                    to="/ajouter-equipement"
                                    className="group/btn inline-flex items-center justify-center gap-2 text-white px-6 md:px-7 py-2.5 md:py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg font-arabic w-full md:w-auto self-end text-base relative overflow-hidden"
                                    style={{ 
                                        backgroundColor: '#FF6A18',
                                        boxShadow: '0 10px 15px -3px rgba(255, 106, 24, 0.3), 0 4px 6px -2px rgba(255, 106, 24, 0.2)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FF8533';
                                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(255, 106, 24, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FF6A18';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(255, 106, 24, 0.3), 0 4px 6px -2px rgba(255, 106, 24, 0.2)';
                                    }}
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></span>
                                    <Plus className="w-4 h-4 relative z-10" />
                                    <span className="relative z-10">ابدأ الكسب الآن</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="py-12 md:py-16 bg-white border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-gray-800 mb-8 md:mb-12 font-arabic">
                        شركاؤنا
                    </h2>
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12 opacity-50">
                        {partners.map((partner, index) => (
                            <div key={index} className="text-lg md:text-xl font-bold text-gray-400 hover:text-gray-600 transition-colors font-arabic">
                                {partner}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 font-arabic text-center">
                            أسئلة شائعة
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-arabic text-center">
                            إجابات على الأسئلة الأكثر شيوعاً
                        </p>
                    </div>
                    <div className="max-w-4xl mx-auto space-y-4">
                        {faqData.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                                    className="w-full px-6 py-5 text-right flex items-center justify-between hover:bg-gray-50 transition-colors gap-4"
                                >
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${openFAQ === index ? 'rotate-180' : ''
                                            }`}
                                    />
                                    <span className="font-bold text-gray-800 text-base md:text-lg font-arabic text-right flex-1">
                                        {faq.question}
                                    </span>
                                </button>
                                {openFAQ === index && (
                                    <div className="px-6 pb-5 text-gray-600 leading-relaxed text-right font-arabic text-base animate-slide-down">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}

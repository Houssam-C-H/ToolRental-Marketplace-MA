import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import ToolCard from "../components/ToolCard";
import UnifiedReviewSystem from "../components/UnifiedReviewSystem";
import CostCalculator from "../components/CostCalculator";
import FloatingComparisonBar from "../components/FloatingComparisonBar";
import ContactInfo from "../components/HiddenContactInfo";
import { productsAPI, Product } from "../lib/api";
import { SEOHead } from "../components/SEOHead";
import { generateProductSchema, generateBreadcrumbSchema, generateFAQSchema, combineSchemas } from "../lib/schemaGenerator";

// Product data structure that matches AddEquipment form fields
interface ProductDetail {
  id: string | number;
  // Basic tool information (from AddEquipment form)
  toolName: string;
  category: string;
  brand: string;
  model: string;
  condition: string;
  description: string;
  specifications: string;
  dailyPrice: number;
  priceUnit: string;

  // Location information (from AddEquipment form)
  city: string;
  neighborhood: string;

  // Contact information (from AddEquipment form)
  contactPhone: string;
  contactWhatsApp: string;

  // Additional platform data
  images: string[];
  owner: string;
  ownerUserId?: string; // Supplier ID for routing
  rating: number;
  reviews: number;
  lastSeen: string;
  status: string;
}

// Mock product data that matches AddEquipment form structure
const mockProductData: ProductDetail = {
  id: 1,
  // Basic tool information (exactly as filled in AddEquipment form)
  toolName: "مثقاب كهربائي بوش",
  category: "معدات الحفر",
  brand: "بوش",
  model: "GSB 21-2 RCT",
  condition: "مستعمل - حالة ممتازة",
  description:
    "مثقاب كهربائي قوي ومناسب لجميع أنواع الحفر في الخشب والمعادن والخرسانة. يتميز بسهولة الاستخدام والدقة في العمل. مثالي للمقاولين وأصحاب المشاريع الصغيرة.",
  specifications:
    "القوة: 850 واط، الوزن: 2.4 كجم، الأبعاد: 32 × 8 × 26 سم، الفولتية: 220-240 فولت، السرعة: 0-1200 دورة/دقيقة، عمق الحفر في الخشب: 30 مم، عمق الحفر في المعدن: 13 مم، عمق الحفر في الخرسانة: 20 مم",
  dailyPrice: 100,
  priceUnit: "اليوم",

  // Location information (exactly as filled in AddEquipment form)
  city: "الرباط",
  neighborhood: "المدينة القديمة",

  // Contact information (exactly as filled in AddEquipment form)
  contactPhone: "+212 661 234 567",
  contactWhatsApp: "+212 661 234 567",

  // Additional platform data
  images: [
    "https://api.builder.io/api/v1/image/assets/TEMP/6b567352cd6290cf151bdb707f4089668212d300?width=400",
    "https://api.builder.io/api/v1/image/assets/TEMP/8f801032aeb3bf5392e41f9f39bb16158cd4febf?width=400",
    "https://api.builder.io/api/v1/image/assets/TEMP/2893ad07c734518a4f6dbcfbc870a1bd75b433ae?width=400",
  ],
  owner: "مجاهد النجار",
  rating: 4.8,
  reviews: 1000,
  lastSeen: "ساعتان",
  status: "للايجار",
};

export default function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [productForSchema, setProductForSchema] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [favorites, setFavorites] = useState<(string | number)[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tool-favorites");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          const productData = await productsAPI.getProduct(id);
          // Keep Product for schema generation
          setProductForSchema(productData);
          // Transform Product to ProductDetail interface
          const transformedProduct: ProductDetail = {
            id: productData.id, // Use the UUID directly
            toolName: productData.name,
            category: productData.category,
            brand: productData.brand,
            model: productData.model,
            condition: productData.condition,
            description: productData.description,
            specifications: productData.specifications,
            dailyPrice: productData.daily_price,
            priceUnit: "اليوم",
            city: productData.city,
            neighborhood: productData.neighborhood,
            contactPhone: productData.contact_phone,
            contactWhatsApp: productData.contact_whatsapp,
            images: productData.images,
            owner: productData.owner_name,
            ownerUserId: productData.owner_user_id, // Supplier ID for routing
            rating: productData.rating,
            reviews: productData.reviews_count,
            lastSeen: productData.updated_at,
            status: productData.status,
          };
          setProduct(transformedProduct);
        } catch (error) {
          console.error("Error fetching product:", error);
          // Fallback to mock data if API fails
          setProduct({ ...mockProductData, id: parseInt(id) });
        }
      }
    };

    fetchProduct();
  }, [id]);

  const toggleFavorite = (productId: string | number) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      localStorage.setItem("tool-favorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.toolName,
      text: `تحقق من هذه الأداة: ${product?.toolName}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("تم نسخ الرابط");
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل تفاصيل الأداة...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const suggestedTools = [
    {
      id: 2,
      name: "منشار كهربائي ديوالت",
      description: "قطع دقيق للخشب والمعادن الرقيقة",
      price: 80,
      priceUnit: "اليوم",
      location: "سلا، طابريكت",
      category: "أدوات القطع",
      condition: "جديد",
      status: "للايجار",
      owner: "أحمد الحسني",
      rating: 4.9,
      reviews: 850,
      lastSeen: "ساعة واحدة",
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/8f801032aeb3bf5392e41f9f39bb16158cd4febf?width=244",
      isFavorite: false,
    },
    {
      id: 3,
      name: "مولد كهربائي هوندا",
      description: "طاقة موثوقة للمواقع البعيدة، 5000 واط",
      price: 200,
      priceUnit: "اليوم",
      location: "الرباط، أكدال",
      category: "مولدات",
      condition: "مستعمل",
      status: "للايجار",
      owner: "يوسف التازي",
      rating: 4.7,
      reviews: 720,
      lastSeen: "3 ساعات",
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/2893ad07c734518a4f6dbcfbc870a1bd75b433ae?width=244",
      isFavorite: false,
    },
  ];

  // Generate SEO data
  const seoTitle = product 
    ? `${product.toolName} للإيجار في ${product.city} - ${product.dailyPrice} درهم/يوم | منصة تأجير الأدوات`
    : 'تفاصيل الأداة | منصة تأجير الأدوات';
  
  const seoDescription = product
    ? `استأجر ${product.toolName} في ${product.city}. ${product.dailyPrice} درهم/يوم. ${product.condition}، توصيل متاح. احجز الآن!`
    : 'اكتشف تفاصيل الأداة وأسعار الإيجار';

  const productImage = product?.images && product.images.length > 0 
    ? product.images[0] 
    : undefined;

  // Generate FAQ data for product
  const productFAQs = product ? [
    {
      question: `كيف يمكنني استئجار ${product.toolName}؟`,
      answer: `يمكنك التواصل مباشرة مع المالك ${product.owner} عبر الهاتف ${product.contactPhone || 'أو الواتساب'} للاتفاق على تفاصيل الإيجار والمدة والسعر.`
    },
    {
      question: `ما هو سعر إيجار ${product.toolName}؟`,
      answer: `سعر الإيجار هو ${product.dailyPrice} درهم في اليوم. يمكن الاتفاق على أسعار خاصة للإيجار طويل الأمد.`
    },
    {
      question: `هل يمكن التوصيل؟`,
      answer: product.hasDelivery 
        ? `نعم، التوصيل متاح مقابل ${product.deliveryPrice || 'رسوم إضافية'}. يمكن الاتفاق على تفاصيل التوصيل مع المالك.`
        : `التوصيل غير متاح حالياً. يجب استلام الأداة من موقع المالك في ${product.city} - ${product.neighborhood}.`
    },
    {
      question: `ما هي حالة ${product.toolName}؟`,
      answer: `حالة الأداة: ${product.condition}. ${product.specifications ? `المواصفات: ${product.specifications}` : ''}`
    },
    {
      question: `كيف يمكنني التواصل مع المالك؟`,
      answer: `يمكنك التواصل مع ${product.owner} عبر الهاتف: ${product.contactPhone || 'غير متوفر'} أو الواتساب: ${product.contactWhatsApp || 'غير متوفر'}.`
    }
  ] : [];

  // Generate schemas
  const productSchema = productForSchema ? generateProductSchema(productForSchema) : null;
  const breadcrumbSchema = product ? generateBreadcrumbSchema([
    { name: 'الرئيسية', url: '/' },
    { name: 'الأدوات', url: '/outils' },
    { name: product.toolName, url: `/outil/${product.id}` },
  ]) : null;
  const faqSchema = productFAQs.length > 0 ? generateFAQSchema(productFAQs) : null;

  // Combine all schemas (product, breadcrumb, FAQ)
  const schemasToCombine = [productSchema, breadcrumbSchema, faqSchema].filter(Boolean);
  const combinedSchema = schemasToCombine.length > 0 
    ? combineSchemas(...schemasToCombine)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
      {product && (
        <SEOHead
          title={seoTitle}
          description={seoDescription}
          image={productImage}
          url={location.pathname}
          type="product"
          schema={combinedSchema || undefined}
        />
      )}
      <Navigation />

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
            <Link
              to="/outils"
              className="text-gray-600 hover:text-orange transition-colors"
            >
              الأدوات
            </Link>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-orange font-medium">{product.toolName}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image Section - Right Side */}
            <div className="lg:w-1/3 p-6">
              <div className="space-y-4">
                {/* Main Image - Square */}
                <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={product.toolName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImageIndex === index
                          ? "border-orange"
                          : "border-gray-200"
                          }`}
                      >
                        <img
                          src={image}
                          alt={`${product.toolName} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`flex-1 p-3 rounded-lg border transition-colors ${favorites.includes(product.id)
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <svg
                      className="w-5 h-5 mx-auto"
                      fill={
                        favorites.includes(product.id) ? "currentColor" : "none"
                      }
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 p-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Details Section - Left Side */}
            <div className="lg:w-2/3 p-6 lg:border-r border-gray-200">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                    {product.toolName}
                  </h1>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-orange/10 text-orange px-3 py-1 rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${product.status === "للايجار"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {product.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 fill-current text-yellow-400"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span>{product.rating}</span>
                      <span>({product.reviews} تقييم)</span>
                    </div>
                    <span>•</span>
                    <span>نشط قبل {product.lastSeen}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-orange/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-orange">
                        {product.dailyPrice} درهم
                      </div>
                      <div className="text-sm text-gray-600">
                        السعر لكل {product.priceUnit}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="bg-orange text-white px-6 py-3 rounded-lg hover:bg-orange/90 transition-colors font-medium"
                    >
                      اتصل للإيجار
                    </button>
                  </div>
                </div>

                {/* Cost Calculator */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    حاسبة التكلفة
                  </h3>
                  <CostCalculator
                    tool={{
                      id: product.id,
                      name: product.toolName,
                      description: product.description,
                      price: product.dailyPrice,
                      priceUnit: product.priceUnit,
                      location: `${product.city}, ${product.neighborhood}`,
                      category: product.category,
                      condition: product.condition,
                      status: product.status,
                      owner: product.owner,
                      rating: product.rating,
                      reviews: product.reviews,
                      lastSeen: product.lastSeen,
                      image: product.images[0],
                      isFavorite: false,
                      hasDelivery: true,
                      deliveryPrice: 30,
                    }}
                  />
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      معلومات أساسية
                    </h3>
                    {product.brand && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">العلامة التجارية:</span>
                        <span className="font-medium">{product.brand}</span>
                      </div>
                    )}
                    {product.model && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">الموديل:</span>
                        <span className="font-medium">{product.model}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحالة:</span>
                      <span className="font-medium">{product.condition}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 mb-3">الموقع</h3>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المدينة:</span>
                      <span className="font-medium">{product.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحي:</span>
                      <span className="font-medium">
                        {product.neighborhood}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المالك:</span>
                      <Link
                        to={product.ownerUserId ? `/fournisseur/${product.ownerUserId}` : `/profil/${encodeURIComponent(product.owner)}`}
                        className="font-medium text-orange hover:text-orange/80 transition-colors"
                        title={`عرض جميع أدوات ${product.owner}`}
                      >
                        {product.owner}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">الوصف</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Specifications */}
                {product.specifications && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">
                      المواصفات التقنية
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 leading-relaxed">
                        {product.specifications}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    معلومات التواصل
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ContactInfo
                      phoneNumber={product.contactPhone}
                      type="phone"
                      label="الهاتف"
                      icon={
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                      }
                    />
                    {product.contactWhatsApp && (
                      <ContactInfo
                        phoneNumber={product.contactWhatsApp}
                        type="whatsapp"
                        label="واتساب"
                        icon={
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                          </svg>
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Review System */}
        <div className="mt-8">
          <UnifiedReviewSystem
            productId={product.id.toString()}
            productName={product.toolName}
          />
        </div>

        {/* Suggested Tools */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            أدوات مشابهة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {suggestedTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={favorites.includes(tool.id)}
                onToggleFavorite={toggleFavorite}
                viewMode="grid"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">التواصل مع المالك</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">{product.toolName}</h4>
                <p className="text-orange font-bold">
                  {product.dailyPrice} درهم/{product.priceUnit}
                </p>
              </div>

              <div className="space-y-3">
                <div className="border border-green-200 rounded-lg overflow-hidden">
                  <ContactInfo
                    phoneNumber={product.contactPhone}
                    type="phone"
                    label="اتصال مباشر"
                    icon={
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                    }
                  />
                </div>

                {product.contactWhatsApp && (
                  <div className="border border-green-200 rounded-lg overflow-hidden">
                    <ContactInfo
                      phoneNumber={product.contactWhatsApp}
                      type="whatsapp"
                      label="رسالة واتساب"
                      icon={
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                        </svg>
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Floating Comparison Bar */}
      <FloatingComparisonBar />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import FloatingComparisonBar from '../components/FloatingComparisonBar';
import { productsAPI, Product } from '../lib/api';
import { suppliersAPI, Supplier, SupplierProduct } from '../lib/suppliersAPI';
// Firebase dependencies removed - using Supabase directly
import { decodeCompositeKey, CompositeKey } from '../lib/compositeKeyUtils';
import { SEOHead } from '../components/SEOHead';
import { generateLocalBusinessSchema, generateBreadcrumbSchema, combineSchemas } from '../lib/schemaGenerator';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Package,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Award,
  Clock
} from 'lucide-react';
import { toast } from '../hooks/use-toast';

interface SupplierProfile {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  description?: string;
  location?: string;
  joinDate: string;
  isVerified: boolean;
  totalProducts: number;
  averageRating: number;
  totalReviews: number;
  responseTime?: string;
  specialties?: string[];
}

// Function to get user profile from Supabase
async function getUserProfile(userId: string) {
  try {
    const { supabase } = await import('../lib/supabase');
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export default function SupplierProfile() {
  const { compositeKey } = useParams<{ compositeKey: string }>();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [decodedKey, setDecodedKey] = useState<CompositeKey | null>(null);
  const [favorites, setFavorites] = useState<(string | number)[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tool-favorites");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const itemsPerPage = 8;

  useEffect(() => {
    if (compositeKey) {
      try {
        // Decode the composite key to get both Firebase ID and owner_user_id
        const decoded = decodeCompositeKey(compositeKey);
        setDecodedKey(decoded);
        console.log('Decoded composite key:', decoded);
        
        // Load data using the decoded keys
        loadSupplierProfile(decoded);
        loadSupplierProducts(decoded);
      } catch (error) {
        console.error('Error decoding composite key:', error);
        setError('معرف المزود غير صحيح');
      }
    }
  }, [compositeKey]);

  const loadSupplierProfile = async (key: CompositeKey) => {
    try {
      setLoading(true);

      console.log('Loading supplier profile for Firebase ID:', key.firebaseId);
      console.log('Owner User ID:', key.ownerUserId);

      // Get supplier data from the suppliers table using Firebase ID
      const supplier = await suppliersAPI.getSupplierByUserId(key.firebaseId);

      if (!supplier) {
        setError(`لم يتم العثور على مزود بهذا المعرف: ${key.firebaseId}`);
        return;
      }

      console.log('Supplier found:', supplier);

      // Get user profile data from Supabase
      let userProfile = null;
      try {
        userProfile = await getUserProfile(key.firebaseId);
      } catch (error) {
        console.log('Could not fetch user profile, using supplier data only');
      }

      // Create profile from supplier data (much more efficient!)
      const profile: SupplierProfile = {
        id: key.firebaseId, // Use user ID for display
        displayName: userProfile?.display_name || supplier.display_name || "مزود غير معروف",
        email: userProfile?.email || supplier.email || "",
        phone: userProfile?.phone || supplier.phone || "",
        profilePhoto: userProfile?.profile_photo || supplier.profile_photo || "",
        description: userProfile?.description || supplier.description || "مزود أدوات ومعدات احترافية",
        location: userProfile?.location || supplier.location || "",
        joinDate: userProfile?.created_at || supplier.created_at,
        isVerified: supplier.is_verified,
        // Use cached data from suppliers table (super fast!)
        totalProducts: supplier.total_products,
        averageRating: supplier.average_rating,
        totalReviews: supplier.total_reviews,
        responseTime: supplier.response_time || "أقل من ساعة",
        specialties: supplier.specialties || supplier.product_categories || ["معدات البناء", "أدوات الحفر"]
      };

      setSupplierProfile(profile);
    } catch (error) {
      console.error('Error loading supplier profile:', error);
      setError('فشل في تحميل الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierProducts = async (key: CompositeKey, page: number = 1) => {
    try {
      setProductsLoading(true);
      console.log('Loading supplier products for owner_user_id:', key.ownerUserId, 'page:', page);

      // Use the owner_user_id from the composite key to get products
      const result = await productsAPI.getSupplierProducts(key.ownerUserId, page, itemsPerPage);
      console.log('Supplier products result:', result);

      const supplierProducts = result.products;
      console.log('Products found:', supplierProducts.length);

      setProducts(supplierProducts);
      setTotalPages(Math.ceil(result.totalCount / itemsPerPage));
      setCurrentPage(page);

    } catch (error) {
      console.error('Error loading supplier products:', error);
      setError('فشل في تحميل منتجات المزود');
      setProducts([]);
      setTotalPages(0);
    } finally {
      setProductsLoading(false);
    }
  };

  const toggleFavorite = (toolId: string | number) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId];

      localStorage.setItem("tool-favorites", JSON.stringify(newFavorites));

      if (!prev.includes(toolId)) {
        toast({
          title: "تمت الإضافة إلى المفضلة",
          description: "تم إضافة المنتج إلى قائمة المفضلة",
        });
      } else {
        toast({
          title: "تم الحذف من المفضلة",
          description: "تم حذف المنتج من قائمة المفضلة",
        });
      }

      return newFavorites;
    });
  };

  const handlePageChange = (page: number) => {
    if (decodedKey) {
      loadSupplierProducts(decodedKey, page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `ملف ${supplierProfile?.displayName} الشخصي`,
        text: `تعرف على منتجات ${supplierProfile?.displayName} على منصتنا`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط الملف الشخصي إلى الحافظة",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  if (error || !supplierProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-800 text-lg mb-2">حدث خطأ</p>
          <p className="text-gray-600 mb-4">{error || 'المزود غير موجود'}</p>
          <Link
            to="/outils"
            className="inline-block px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors"
          >
            العودة للأدوات
          </Link>
        </div>
      </div>
    );
  }

  // Generate SEO data
  const seoTitle = supplierProfile
    ? `ملف ${supplierProfile.displayName} الشخصي - ${supplierProfile.totalProducts} أداة متاحة | منصة تأجير الأدوات`
    : 'ملف المزود | منصة تأجير الأدوات';
  
  const seoDescription = supplierProfile
    ? `استعرض ${supplierProfile.totalProducts} أداة من ${supplierProfile.displayName}. ${supplierProfile.averageRating > 0 ? `تقييم ${supplierProfile.averageRating}/5` : ''} ${supplierProfile.location ? `في ${supplierProfile.location}` : ''}. احجز الآن!`
    : 'استعرض أدوات المزود';

  // Generate schemas
  const localBusinessSchema = supplierProfile ? generateLocalBusinessSchema({
    id: supplierProfile.id,
    name: supplierProfile.displayName,
    city: supplierProfile.location?.split(',')[0] || 'Rabat',
    address: supplierProfile.location,
    phone: supplierProfile.phone,
  }) : null;

  const breadcrumbSchema = supplierProfile ? generateBreadcrumbSchema([
    { name: 'الرئيسية', url: '/' },
    { name: 'الأدوات', url: '/outils' },
    { name: supplierProfile.displayName, url: location.pathname },
  ]) : null;

  const combinedSchema = localBusinessSchema && breadcrumbSchema
    ? combineSchemas(localBusinessSchema, breadcrumbSchema)
    : localBusinessSchema || breadcrumbSchema;

  return (
    <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
      {supplierProfile && (
        <SEOHead
          title={seoTitle}
          description={seoDescription}
          image={supplierProfile.profilePhoto}
          url={location.pathname}
          type="website"
          schema={combinedSchema || undefined}
        />
      )}
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
            <span className="text-orange font-medium">
              {supplierProfile.displayName}
            </span>
          </nav>
        </div>
      </div>

      {/* Supplier Profile Header */}
      <div className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              <div className="relative">
                <img
                  src={supplierProfile.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                  alt={supplierProfile.displayName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {supplierProfile.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2">
                    <Award className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="text-center lg:text-right flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {supplierProfile.displayName}
                </h1>
                {supplierProfile.isVerified && (
                  <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                    <Award className="w-4 h-4" />
                    مزود معتمد
                  </div>
                )}
                <p className="text-gray-600 mb-4">{supplierProfile.description}</p>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-gray-600">
                  {supplierProfile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{supplierProfile.location}</span>
                    </div>
                  )}
                  {supplierProfile.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{supplierProfile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>عضو منذ {new Date(supplierProfile.joinDate).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <Package className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{supplierProfile.totalProducts}</div>
                <div className="text-sm text-gray-600">منتج</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{supplierProfile.averageRating}</div>
                <div className="text-sm text-gray-600">تقييم</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <MessageCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{supplierProfile.totalReviews}</div>
                <div className="text-sm text-gray-600">مراجعة</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{supplierProfile.responseTime}</div>
                <div className="text-sm text-gray-600">وقت الاستجابة</div>
              </div>
            </div>

            {/* Specialties and Actions */}
            <div className="space-y-6">
              {/* Specialties */}
              {supplierProfile.specialties && supplierProfile.specialties.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 text-right">التخصصات</h3>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {supplierProfile.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  تواصل مع المزود
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            منتجات {supplierProfile.displayName}
          </h2>
          <span className="text-gray-600">
            {supplierProfile.totalProducts} منتج
          </span>
        </div>

        {productsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل المنتجات...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">لا توجد منتجات متاحة</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={product.images?.[0] || product.first_image || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${favorites.includes(product.id)
                          ? 'text-red-500 fill-current'
                          : 'text-gray-400'
                          }`}
                      />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating || 0)
                              ? 'fill-current'
                              : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({product.reviews_count || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">
                        {product.daily_price} درهم/اليوم
                      </span>
                      <Link
                        to={`/outil/${product.id}`}
                        className="flex items-center gap-1 text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">عرض</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  السابق
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                        ? 'bg-orange text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
      <FloatingComparisonBar />
    </div>
  );
}

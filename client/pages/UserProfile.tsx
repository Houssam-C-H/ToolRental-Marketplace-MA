import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  MapPin,
  Clock,
  Package,
  Star,
  Phone,
  MessageCircle,
  Edit,
  Save,
  X,
  Award,
  Share2,
  Camera,
  Plus
} from "lucide-react";
import ToolCard from "../components/ToolCard";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FloatingComparisonBar from "../components/FloatingComparisonBar";
import { productsAPI, Product } from "../lib/api";
import { supabase } from "../lib/supabase";
import { toast } from "../hooks/use-toast";
import { uploadProfileImage } from "../lib/imageUpload";

interface SupplierProfile {
  id: string;
  display_name: string;
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

export default function UserProfile() {
  const { ownerName } = useParams<{ ownerName: string }>();
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
    description: '',
    location: '',
    specialties: [] as string[],
    responseTime: ''
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const [favorites, setFavorites] = useState<(string | number)[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tool-favorites");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Check if current user is viewing their own profile
  const isOwnProfile = currentUser && (
    currentUser.email?.split('@')[0] === decodeURIComponent(ownerName || '') ||
    userProfile?.display_name === decodeURIComponent(ownerName || '')
  );

  useEffect(() => {
    if (ownerName) {
      loadSupplierProfile();
      fetchUserProducts();
    }
  }, [ownerName]);

  const loadSupplierProfile = async () => {
    try {
      setLoading(true);
      const decodedOwnerName = decodeURIComponent(ownerName || "");

      // In a real app, you'd fetch from an API endpoint
      // For now, we'll create a profile based on the owner name
      const mockProfile: SupplierProfile = {
        id: decodedOwnerName,
        displayName: decodedOwnerName,
        email: isOwnProfile ? (currentUser?.email || '') : 'مخفي',
        phone: isOwnProfile ? (userProfile?.phone || '') : 'مخفي',
        profilePhoto: isOwnProfile ? (userProfile?.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face") : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        description: isOwnProfile ? (userProfile?.description || '') : 'مزود أدوات ومعدات احترافية',
        location: isOwnProfile ? (userProfile?.location || '') : 'المغرب',
        joinDate: "2023-01-15",
        isVerified: isOwnProfile ? (userProfile?.is_admin || false) : true,
        totalProducts: 0, // Will be updated after fetching products
        averageRating: 4.8,
        totalReviews: 127,
        responseTime: "أقل من ساعة",
        specialties: isOwnProfile ? (userProfile?.specialties || []) : ["الأدوات الكهربائية", "معدات البناء"]
      };

      setSupplierProfile(mockProfile);

      // Initialize form data for editing
      if (isOwnProfile) {
        setFormData({
          displayName: userProfile?.displayName || '',
          phone: userProfile?.phone || '',
          description: userProfile?.description || '',
          location: userProfile?.location || '',
          specialties: userProfile?.specialties || [],
          responseTime: "أقل من ساعة"
        });
      }
    } catch (error) {
      console.error('Error loading supplier profile:', error);
      setError('فشل في تحميل الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProducts = async () => {
    try {
      setError(null);
      const result = await productsAPI.getApprovedProducts(1, 1000); // Get all products
      const allProducts = result.products || []; // Extract the products array
      // Filter products by owner name
      const decodedOwnerName = decodeURIComponent(ownerName || "");
      const userFilteredProducts = allProducts.filter(
        (product) => product.owner_name === decodedOwnerName
      );
      setUserProducts(userFilteredProducts);

      // Update total products count
      if (supplierProfile) {
        setSupplierProfile(prev => prev ? { ...prev, totalProducts: userFilteredProducts.length } : null);
      }
    } catch (err) {
      setError("فشل في تحميل منتجات المستخدم");
      console.error("Error fetching user products:", err);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecialtyAdd = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const handleSpecialtyRemove = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setEditLoading(true);
      await updateUserProfile({
        displayName: formData.displayName,
        phone: formData.phone,
        description: formData.description,
        location: formData.location,
        specialties: formData.specialties
      });

      // Update supplier profile
      setSupplierProfile(prev => prev ? {
        ...prev,
        displayName: formData.displayName,
        phone: formData.phone,
        description: formData.description,
        location: formData.location,
        specialties: formData.specialties
      } : null);

      toast({
        title: "تم التحديث بنجاح",
        description: "تم حفظ معلومات الملف الشخصي",
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطأ في التحديث",
        description: "فشل في حفظ التغييرات",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        phone: userProfile.phone || '',
        description: userProfile.description || '',
        location: userProfile.location || '',
        specialties: userProfile.specialties || [],
        responseTime: "أقل من ساعة"
      });
    }
    setIsEditing(false);
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ في نوع الملف",
        description: "يرجى اختيار ملف صورة صالح",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "يرجى اختيار صورة أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    try {
      setImageUploading(true);

      // Use the new image upload function
      const result = await uploadProfileImage(file, currentUser?.uid || 'anonymous');

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update user profile with new image URL
      await updateUserProfile({
        profilePhoto: result.url
      });

      // Update supplier profile state
      setSupplierProfile(prev => prev ? {
        ...prev,
        profilePhoto: result.url
      } : null);

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تم تحديث صورة الملف الشخصي",
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ في رفع الصورة",
        description: "فشل في رفع الصورة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Calculate user stats
  const totalProducts = userProducts.length;
  const averageRating = userProducts.length > 0
    ? userProducts.reduce((sum, product) => sum + product.rating, 0) / userProducts.length
    : 0;
  const totalReviews = userProducts.reduce((sum, product) => sum + product.reviews_count, 0);
  const cities = [...new Set(userProducts.map(product => product.city))];

  // Get latest product for "last seen" info
  const latestProduct = userProducts.length > 0
    ? userProducts.reduce((latest, current) =>
      new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest
    )
    : null;

  // Calculate pagination
  const totalPages = Math.ceil(userProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = userProducts.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
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

  return (
    <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
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
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Photo and Basic Info */}
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
                {isOwnProfile && (
                  <label className={`absolute -bottom-2 -left-2 bg-orange text-white rounded-full p-2 hover:bg-orange/90 transition-colors cursor-pointer ${imageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {imageUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={imageUploading}
                    />
                  </label>
                )}
              </div>

              <div className="text-center lg:text-right">
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
                  {supplierProfile.phone && supplierProfile.phone !== 'مخفي' && (
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

            {/* Stats and Actions */}
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

              {/* Specialties */}
              {supplierProfile.specialties && supplierProfile.specialties.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">التخصصات</h3>
                  <div className="flex flex-wrap gap-2">
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
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
                {!isOwnProfile && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    تواصل مع المزود
                  </button>
                )}
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    {isEditing ? 'إلغاء' : 'تعديل الملف'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && isOwnProfile && (
        <div className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">تعديل الملف الشخصي</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                    placeholder="أدخل رقم هاتفك"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموقع
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                    placeholder="أدخل موقعك"
                  />
                </div>

                {/* Response Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وقت الاستجابة
                  </label>
                  <input
                    type="text"
                    name="responseTime"
                    value={formData.responseTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                    placeholder="مثال: أقل من ساعة"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                    placeholder="اكتب وصفاً عن نفسك وخدماتك"
                  />
                </div>

                {/* Specialties */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التخصصات
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        {specialty}
                        <button
                          type="button"
                          onClick={() => handleSpecialtyRemove(specialty)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSpecialtyAdd()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                      placeholder="أضف تخصصاً جديداً"
                    />
                    <button
                      type="button"
                      onClick={handleSpecialtyAdd}
                      className="px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة
                    </button>
                  </div>
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t">
                <button
                  onClick={handleSave}
                  disabled={editLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {editLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-dark-blue mb-2">
            منتجات {supplierProfile.displayName}
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              جميع المنتجات المتاحة للإيجار ({supplierProfile.totalProducts} {supplierProfile.totalProducts === 1 ? "منتج" : "منتجات"})
            </p>
            {totalPages > 1 && (
              <span className="text-gray-500 text-sm">
                الصفحة {currentPage} من {totalPages}
              </span>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {currentProducts.map((product) => {
              // Transform Product to Tool interface
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
                image: product.images && product.images.length > 0
                  ? product.images[0]
                  : "/placeholder.svg",
                isFavorite: favorites.includes(product.id),
                hasDelivery: product.has_delivery,
                deliveryPrice: product.delivery_price,
                contactPhone: product.contact_phone,
                contactWhatsApp: product.contact_whatsapp,
              };

              return (
                <ToolCard
                  key={product.id}
                  tool={tool}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={toggleFavorite}
                  viewMode="grid"
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                لا توجد أدوات متاحة
              </h3>
              <p className="text-gray-600 mb-4">
                لم يقم {decodeURIComponent(ownerName || "")} بإضافة أي أدوات بعد
              </p>
              <Link
                to="/outils"
                className="inline-block bg-orange text-white px-6 py-2 rounded-lg hover:bg-orange/90 transition-colors"
              >
                تصفح جميع الأدوات
              </Link>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                السابق
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const showPage = page === 1 || page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  if (!showPage) {
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 py-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === page
                        ? "bg-orange text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <FloatingComparisonBar />
    </div>
  );
}

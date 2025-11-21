import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  productSubmissionAPI,
  productsAPI,
  ProductSubmission,
  Product,
} from "../../lib/api";
import { suppliersAPI } from "../../lib/suppliersAPI";
import {
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Package,
  TrendingUp,
  Users,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  X,
  Camera,
  Clock,
  Plus,
  LogOut,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "../../hooks/use-toast";
import { LoadingButton, LoadingOverlay, LoadingCard } from "../ui/loading-spinner";
import { uploadProfileImage } from "../../lib/imageUpload";

type TabType = "overview" | "submissions" | "products";

export default function UserDashboard() {
  const { currentUser, userProfile, updateUserProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [unclaimedProducts, setUnclaimedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<
    ProductSubmission | Product | null
  >(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyProduct, setModifyProduct] = useState<any | null>(null);
  const [modifySubmitting, setModifySubmitting] = useState(false);
  const [deletingSubmission, setDeletingSubmission] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [claimingProduct, setClaimingProduct] = useState<string | null>(null);
  const [togglingVisibility, setTogglingVisibility] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    display_name: '',
    phone: '',
    description: '',
    location: '',
    specialties: [] as string[],
    response_time: ''
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [modifyForm, setModifyForm] = useState({
    toolName: "",
    category: "",
    brand: "",
    model: "",
    condition: "",
    description: "",
    specifications: "",
    dailyPrice: "",
    city: "",
    neighborhood: "",
    ownerName: "",
    contactPhone: "",
    contactWhatsApp: "",
    hasDelivery: false as boolean,
    deliveryPrice: "",
    deliveryNotes: "",
    images: [] as string[],
  });

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (userProfile) {
      setProfileFormData({
        display_name: userProfile.display_name || '',
        phone: userProfile.phone || '',
        description: userProfile.description || '',
        location: userProfile.location || '',
        specialties: userProfile.specialties || [],
        response_time: userProfile.response_time || ''
      });
    }
  }, [userProfile]);

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Load all data in parallel for faster initial load
      const [userSubmissionsResult, userProductsResult, claimableProductsResult] = await Promise.allSettled([
        productSubmissionAPI.getUserSubmissions(currentUser.id),
        productsAPI.getUserProducts(currentUser.id),
        userProfile ? productsAPI.getUnclaimedProductsForUser(userProfile) : Promise.resolve([])
      ]);

      // Set submissions immediately
      if (userSubmissionsResult.status === 'fulfilled') {
        setSubmissions(userSubmissionsResult.value);
      } else {
        console.warn("Could not load submissions:", userSubmissionsResult.reason);
        setSubmissions([]);
      }

      // Set products immediately
      if (userProductsResult.status === 'fulfilled') {
        setProducts(userProductsResult.value as any);
      } else {
        console.warn("Could not load products:", userProductsResult.reason);
        setProducts([]);
      }

      // Set claimable products
      if (claimableProductsResult.status === 'fulfilled') {
        setUnclaimedProducts(claimableProductsResult.value as any);
      } else {
        console.warn("Could not load claimable products:", claimableProductsResult.reason);
        setUnclaimedProducts([]);
      }

    } catch (error) {
      console.error("Error loading user data:", error);
      setSubmissions([]);
      setProducts([]);
      setUnclaimedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (product: any) => {
    const currentStatus = product.status;
    const newStatus = currentStatus === "hidden" ? "active" : "hidden";
    try {
      setTogglingVisibility(product.id);
      await productsAPI.setProductStatus(product.id, newStatus);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? ({ ...(p as any), status: newStatus } as any)
            : p,
        ),
      );
    } catch (e) {
      console.error("Failed to toggle visibility", e);
      toast({
        title: "خطأ في تغيير الحالة",
        description: "تعذر تغيير حالة الظهور",
        variant: "destructive",
      });
    } finally {
      setTogglingVisibility(null);
    }
  };

  const openModifyModal = (product: any) => {
    setModifyProduct(product);
    setModifyForm({
      toolName: product.name || "",
      category: product.category || "",
      brand: product.brand || "",
      model: product.model || "",
      condition: product.condition || "جديد", // Default to جديد
      description: product.description || "",
      specifications: product.specifications || "",
      dailyPrice: String(product.daily_price ?? product.dailyPrice ?? ""),
      city: product.city || "",
      neighborhood: product.neighborhood || "",
      ownerName: product.owner_name || userProfile?.display_name || "",
      contactPhone: product.contact_phone || "",
      contactWhatsApp: product.contact_whatsapp || "",
      hasDelivery: !!product.has_delivery,
      deliveryPrice:
        product.delivery_price != null ? String(product.delivery_price) : "",
      deliveryNotes: product.delivery_notes || "",
      images: product.images || [],
    });
    setShowModifyModal(true);
  };

  const submitModifyRequest = async () => {
    if (!currentUser || !modifyProduct) return;
    try {
      setModifySubmitting(true);
      await productSubmissionAPI.submitModifyRequest(
        modifyProduct.id,
        modifyForm,
        currentUser.id,
      );
      setShowModifyModal(false);
      toast({
        title: "تم إرسال الطلب",
        description: "تم إرسال طلب التعديل إلى الإدارة",
        variant: "default",
      });
      // Reload data to show the new request
      loadUserData();
    } catch (e) {
      console.error("Failed to submit modification request", e);
      toast({
        title: "خطأ في الإرسال",
        description: "تعذر إرسال طلب التعديل",
        variant: "destructive",
      });
    } finally {
      setModifySubmitting(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!currentUser) return;

    const result = await Swal.fire({
      title: "تأكيد الحذف",
      text: "هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      customClass: {
        popup: "swal2-popup-arabic",
        title: "swal2-title-arabic",
        htmlContainer: "swal2-html-container-arabic",
        confirmButton: "swal2-confirm-arabic",
        cancelButton: "swal2-cancel-arabic"
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingSubmission(id);

      // 1. IMMEDIATE UI UPDATE (Optimistic)
      setSubmissions(prev => prev.filter(s => s.id !== id));

      // 2. Show immediate success feedback
      toast({
        title: "تم الحذف",
        description: "تم حذف الطلب بنجاح",
        variant: "default",
      });

      // 3. Queue operation in Firebase (instant, non-blocking)
      // Queue deletion (Firebase removed - using direct API call)
      await productSubmissionAPI.deleteSubmission(id);

      // 4. Invalidate cache
      // Cache invalidation (Firebase removed - using React Query invalidation)

    } catch (error) {
      console.error("Error queuing deletion:", error);

      // Revert UI update on error
      loadUserData();

      toast({
        title: "خطأ في الحذف",
        description: "تعذر حذف الطلب، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setDeletingSubmission(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!currentUser) return;

    const result = await Swal.fire({
      title: "تأكيد الحذف",
      text: "هل أنت متأكد من حذف هذا المنتج؟ سيتم إرسال طلب حذف إلى الإدارة.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      customClass: {
        popup: "swal2-popup-arabic",
        title: "swal2-title-arabic",
        htmlContainer: "swal2-html-container-arabic",
        confirmButton: "swal2-confirm-arabic",
        cancelButton: "swal2-cancel-arabic"
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingProduct(id);

      // Submit delete request instead of directly deleting
      await productSubmissionAPI.submitDeleteRequest(
        id,
        "طلب حذف المنتج من المستخدم",
        currentUser.id,
      );

      // Success toast
      toast({
        title: "تم إرسال الطلب",
        description: "تم إرسال طلب الحذف إلى الإدارة",
        variant: "default",
      });

      // Reload data to show the new request
      loadUserData();
    } catch (error) {
      console.error("Error submitting delete request:", error);

      // Error toast
      toast({
        title: "خطأ في الإرسال",
        description: "تعذر إرسال طلب الحذف",
        variant: "destructive",
      });
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleClaimProduct = async (productId: string) => {
    if (!currentUser) return;

    try {
      setClaimingProduct(productId);
      const success = await productsAPI.claimProduct(productId, currentUser.id);
      if (success) {
        // Move product from unclaimed to owned
        const claimedProduct = unclaimedProducts.find(p => p.id === productId);
        if (claimedProduct) {
          setProducts(prev => [claimedProduct, ...prev]);
          setUnclaimedProducts(prev => prev.filter(p => p.id !== productId));
          toast({
            title: "تم التأكيد",
            description: "تم تأكيد ملكية المنتج بنجاح",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "خطأ في التأكيد",
          description: "تعذر تأكيد ملكية المنتج",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error claiming product:", error);
      toast({
        title: "خطأ في التأكيد",
        description: "تعذر تأكيد ملكية المنتج",
        variant: "destructive",
      });
    } finally {
      setClaimingProduct(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "في انتظار المراجعة";
      case "approved":
        return "تمت الموافقة";
      case "rejected":
        return "مرفوض";
      default:
        return "غير معروف";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecialtyAdd = () => {
    if (newSpecialty.trim() && !profileFormData.specialties.includes(newSpecialty.trim())) {
      setProfileFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const handleSpecialtyRemove = (specialty: string) => {
    setProfileFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ في نوع الملف",
        description: "يرجى اختيار ملف صورة صالح",
        variant: "destructive",
      });
      return;
    }

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
      const result = await uploadProfileImage(file, currentUser?.id || 'anonymous');

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      await updateUserProfile({
        profile_photo: result.url
      });

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

  const handleProfileSave = async () => {
    if (!currentUser) return;

    try {
      setProfileLoading(true);
      await updateUserProfile({
        display_name: profileFormData.display_name,
        phone: profileFormData.phone,
        description: profileFormData.description,
        location: profileFormData.location,
        specialties: profileFormData.specialties,
        response_time: profileFormData.response_time
      });

      toast({
        title: "تم التحديث بنجاح",
        description: "تم حفظ معلومات الملف الشخصي",
      });

      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطأ في التحديث",
        description: "فشل في حفظ التغييرات",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileCancel = () => {
    if (userProfile) {
      setProfileFormData({
        display_name: userProfile.display_name || '',
        phone: userProfile.phone || '',
        description: userProfile.description || '',
        location: userProfile.location || '',
        specialties: userProfile.specialties || [],
        response_time: userProfile.response_time || ''
      });
    }
    setIsEditingProfile(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-blue mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12"
              />
              <h1 className="text-2xl font-bold text-dark-blue">لوحة التحكم</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                مرحباً، {userProfile?.display_name || currentUser?.email?.split('@')[0] || 'مستخدم'}
              </span>
              <Link
                to="/"
                className="text-dark-blue hover:text-orange transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                <span>العودة للرئيسية</span>
              </Link>
              <button
                onClick={async () => {
                  const result = await Swal.fire({
                    title: "تأكيد تسجيل الخروج",
                    text: "هل أنت متأكد من تسجيل الخروج؟",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonColor: "#ef4444",
                    cancelButtonColor: "#6b7280",
                    confirmButtonText: "نعم، سجل الخروج",
                    cancelButtonText: "إلغاء",
                    reverseButtons: true,
                    customClass: {
                      popup: "swal2-popup-arabic",
                      title: "swal2-title-arabic",
                      htmlContainer: "swal2-html-container-arabic",
                      confirmButton: "swal2-confirm-arabic",
                      cancelButton: "swal2-cancel-arabic"
                    }
                  });

                  if (result.isConfirmed) {
                    try {
                      await logout();
                      window.location.href = "/";
                    } catch (error) {
                      console.error("Error logging out:", error);
                      toast({
                        title: "خطأ",
                        description: "تعذر تسجيل الخروج، يرجى المحاولة مرة أخرى",
                        variant: "destructive",
                      });
                    }
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex gap-8" dir="rtl">
            {[
              { id: "overview", label: "نظرة عامة", icon: TrendingUp },
              { id: "submissions", label: "الطلبات", icon: Package },
              { id: "products", label: "المنتجات", icon: Package },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-orange text-orange font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "submissions" ? (
          <div>
            {/* Submissions content will be here */}
          </div>
        ) : activeTab === "products" ? (
          <div>
            {/* Products content will be here */}
          </div>
        ) : (
          <div>
        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={userProfile?.profile_photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <label className={`absolute -bottom-1 -right-1 bg-orange text-white rounded-full p-2 hover:bg-orange/90 transition-colors cursor-pointer ${imageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">الملف الشخصي</h2>
                <p className="text-gray-600 text-sm">{userProfile?.display_name || currentUser?.email?.split('@')[0] || 'مستخدم'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (isEditingProfile) {
                  handleProfileCancel();
                } else {
                  setIsEditingProfile(true);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors"
            >
              {isEditingProfile ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {isEditingProfile ? 'إلغاء' : 'تعديل'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                <p className="text-sm font-medium text-gray-800">{userProfile?.email || currentUser?.email || 'غير محدد'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">رقم الهاتف</p>
                {isEditingProfile ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileFormData.phone}
                    onChange={handleProfileInputChange}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                    placeholder="أدخل رقم هاتفك"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800">{userProfile?.phone || 'غير محدد'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">الموقع</p>
                {isEditingProfile ? (
                  <input
                    type="text"
                    name="location"
                    value={profileFormData.location}
                    onChange={handleProfileInputChange}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                    placeholder="أدخل موقعك"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800">{userProfile?.location || 'غير محدد'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">وقت الاستجابة</p>
                {isEditingProfile ? (
                  <input
                    type="text"
                    name="response_time"
                    value={profileFormData.response_time}
                    onChange={handleProfileInputChange}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                    placeholder="مثال: أقل من ساعة"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800">{userProfile?.response_time || 'غير محدد'}</p>
                )}
              </div>
            </div>
          </div>

          {isEditingProfile && (
            <div className="mt-6 pt-6 border-t">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  name="display_name"
                  value={profileFormData.display_name}
                  onChange={handleProfileInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                <textarea
                  name="description"
                  value={profileFormData.description}
                  onChange={handleProfileInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                  placeholder="اكتب وصفاً عن نفسك وخدماتك"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">التخصصات</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profileFormData.specialties.map((specialty, index) => (
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
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={handleProfileSave}
                  disabled={profileLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {profileLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
                <button
                  onClick={handleProfileCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-dark-blue">
                  {submissions.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-orange" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">في انتظار المراجعة</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {submissions.filter((s) => s.status === "pending").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">المنتجات المعتمدة</p>
                <p className="text-3xl font-bold text-green-600">
                  {
                    products.filter((p: any) =>
                      ["active", "متاح للإيجار"].includes((p as any).status),
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-dark-blue mb-4">
            إجراءات سريعة
          </h2>
          <div className="flex gap-4">
            <Link
              to="/ajouter-equipement"
              className="bg-teal text-dark-blue px-6 py-3 rounded-lg font-medium hover:bg-teal/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة أداة جديدة
            </Link>
            <Link
              to="/my-submissions"
              className="bg-orange text-white px-6 py-3 rounded-lg font-medium hover:bg-orange/90 transition-colors flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              عرض جميع الطلبات
            </Link>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-blue">آخر الطلبات</h2>
              <Link
                to="/my-submissions"
                className="text-teal hover:text-teal/80 text-sm font-medium"
              >
                عرض الكل
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    المنتج
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.slice(0, 5).map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {submission.product_data.toolName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {submission.product_data.category}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}
                      >
                        {getStatusIcon(submission.status)}
                        {getStatusText(submission.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(submission.submitted_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(submission);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {submission.status === "rejected" && (
                          <Link
                            to="/ajouter-equipement"
                            state={{ rejectedSubmission: submission }}
                            className="p-2 text-orange-400 hover:text-orange-600 transition-colors"
                            title="إعادة التقديم"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        <LoadingButton
                          loading={deletingSubmission === submission.id}
                          onClick={() => handleDeleteSubmission(submission.id)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors bg-transparent hover:bg-red-50"
                          size="sm"
                          variant="danger"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </LoadingButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {submissions.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد طلبات لعرضها</p>
              <Link
                to="/ajouter-equipement"
                className="text-teal hover:text-teal/80 font-medium mt-2 inline-block"
              >
                أضف أداة جديدة
              </Link>
            </div>
          )}
        </div>

        {/* Published Products */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-blue">
                المنتجات المنشورة
              </h2>
              <span className="text-sm text-gray-500">
                {products.length} منتج
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    المنتج
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    السعر
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    التقييم
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.category}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(product as any).daily_price ??
                        (product as any).dailyPrice}{" "}
                      درهم/اليوم
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {product.rating}
                        </span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-current" : "fill-gray-300"}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product.reviews_count})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(
                        (product as any).created_at ??
                        (product as any).createdAt,
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/outil/${product.id}`}
                          className="p-2 text-teal hover:text-teal/80 transition-colors"
                          title="عرض المنتج"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openModifyModal(product as any)}
                          className="p-2 text-green-400 hover:text-green-600 transition-colors"
                          title="طلب تعديل البيانات"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <LoadingButton
                          loading={deletingProduct === product.id}
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors bg-transparent hover:bg-red-50"
                          size="sm"
                          variant="danger"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </LoadingButton>
                        <LoadingButton
                          loading={togglingVisibility === product.id}
                          onClick={() => handleToggleVisibility(product as any)}
                          className="p-2 text-gray-500 hover:text-gray-700 transition-colors bg-transparent hover:bg-gray-50"
                          size="sm"
                          variant="secondary"
                          title="إخفاء/إظهار المنتج"
                        >
                          {(product as any).status === "hidden"
                            ? "إظهار"
                            : "إخفاء"}
                        </LoadingButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد منتجات منشورة</p>
              <p className="text-sm text-gray-400 mt-1">
                المنتجات المعتمدة ستظهر هنا
              </p>
            </div>
          )}
        </div>

        {/* Unclaimed Products Section */}
        {unclaimedProducts.length > 0 && (
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-yellow-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-yellow-800">
                  منتجات قابلة للمطالبة
                </h2>
                <span className="text-sm text-yellow-600">
                  {unclaimedProducts.length} منتج
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                هذه المنتجات تم إنشاؤها قبل إضافة نظام تتبع الملكية. يمكنك المطالبة بها إذا كانت ملكك.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-yellow-100">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-medium text-yellow-800">
                      المنتج
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-yellow-800">
                      السعر
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-yellow-800">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-yellow-800">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-200">
                  {unclaimedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-yellow-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {product.category}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(product as any).daily_price ??
                          (product as any).dailyPrice}{" "}
                        درهم/اليوم
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(
                          (product as any).created_at ??
                          (product as any).createdAt,
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/outil/${product.id}`}
                            className="p-2 text-teal hover:text-teal/80 transition-colors"
                            title="عرض المنتج"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <LoadingButton
                            loading={claimingProduct === product.id}
                            onClick={() => handleClaimProduct(product.id)}
                            className="p-2 text-green-400 hover:text-green-600 transition-colors bg-transparent hover:bg-green-50"
                            size="sm"
                            variant="success"
                            title="المطالبة بالمنتج"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </LoadingButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-dark-blue">
                تفاصيل{" "}
                {selectedItem.hasOwnProperty("product_data")
                  ? "الطلب"
                  : "المنتج"}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {selectedItem.hasOwnProperty("product_data") ? (
              // Submission details
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      معلومات المنتج
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">اسم الأداة:</span>
                        <span className="font-medium">
                          {
                            (selectedItem as ProductSubmission).product_data
                              .toolName
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الفئة:</span>
                        <span className="font-medium">
                          {
                            (selectedItem as ProductSubmission).product_data
                              .category
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">السعر:</span>
                        <span className="font-medium">
                          {
                            (selectedItem as ProductSubmission).product_data
                              .dailyPrice
                          }{" "}
                          درهم/اليوم
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      حالة الطلب
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">الحالة:</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor((selectedItem as ProductSubmission).status)}`}
                        >
                          {getStatusText(
                            (selectedItem as ProductSubmission).status,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ التقديم:</span>
                        <span className="font-medium">
                          {formatDate(
                            (selectedItem as ProductSubmission).submitted_at,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {(selectedItem as ProductSubmission).admin_notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      ملاحظات الإدارة:
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {(selectedItem as ProductSubmission).admin_notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Product details
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      معلومات المنتج
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">الاسم:</span>
                        <span className="font-medium">
                          {(selectedItem as Product).name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الفئة:</span>
                        <span className="font-medium">
                          {(selectedItem as Product).category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">السعر:</span>
                        <span className="font-medium">
                          {(selectedItem as any).daily_price ??
                            (selectedItem as any).dailyPrice}{" "}
                          درهم/اليوم
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      الإحصائيات
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">التقييم:</span>
                        <span className="font-medium">
                          {(selectedItem as Product).rating}/5
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">عدد التقييمات:</span>
                        <span className="font-medium">
                          {(selectedItem as Product).reviews_count}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ النشر:</span>
                        <span className="font-medium">
                          {formatDate(
                            (selectedItem as any).created_at ??
                            (selectedItem as any).createdAt,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modify Request Modal */}
      {showModifyModal && modifyProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-dark-blue">
                طلب تعديل بيانات المنتج
              </h3>
              <button
                onClick={() => setShowModifyModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">معلومات الأداة</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      اسم الأداة *
                    </label>
                    <input
                      value={modifyForm.toolName}
                      onChange={(e) =>
                        setModifyForm({ ...modifyForm, toolName: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      الفئة *
                    </label>
                    <select
                      value={modifyForm.category}
                      onChange={(e) =>
                        setModifyForm({ ...modifyForm, category: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">اختر الفئة</option>
                      <option value="tools">أدوات</option>
                      <option value="equipment">معدات</option>
                      <option value="machinery">آلات</option>
                      <option value="vehicles">مركبات</option>
                      <option value="electronics">إلكترونيات</option>
                      <option value="furniture">أثاث</option>
                      <option value="sports">رياضة</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      العلامة التجارية
                    </label>
                    <input
                      value={modifyForm.brand}
                      onChange={(e) =>
                        setModifyForm({ ...modifyForm, brand: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      الموديل
                    </label>
                    <input
                      value={modifyForm.model}
                      onChange={(e) =>
                        setModifyForm({ ...modifyForm, model: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      الحالة *
                    </label>
                    <select
                      value={modifyForm.condition}
                      onChange={(e) =>
                        setModifyForm({ ...modifyForm, condition: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">اختر الحالة</option>
                      <option value="جديد">جديد</option>
                      <option value="مستعمل - حالة ممتازة">مستعمل - حالة ممتازة</option>
                      <option value="مستعمل - حالة جيدة">مستعمل - حالة جيدة</option>
                      <option value="مستعمل - حالة متوسطة">مستعمل - حالة متوسطة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      السعر اليومي (درهم) *
                    </label>
                    <input
                      type="number"
                      value={modifyForm.dailyPrice}
                      onChange={(e) =>
                        setModifyForm({ ...modifyForm, dailyPrice: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description and Specifications */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">الوصف والمواصفات</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      الوصف *
                    </label>
                    <textarea
                      rows={4}
                      value={modifyForm.description}
                      onChange={(e) =>
                        setModifyForm({
                          ...modifyForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      المواصفات التقنية
                    </label>
                    <textarea
                      rows={3}
                      value={modifyForm.specifications}
                      onChange={(e) =>
                        setModifyForm({
                          ...modifyForm,
                          specifications: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">معلومات الموقع</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      المدينة *
                    </label>
                    <select
                      value={modifyForm.city}
                      onChange={(e) =>
                        setModifyForm({ ...modifyForm, city: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">اختر المدينة</option>
                      <option value="سلا">سلا</option>
                      <option value="الرباط">الرباط</option>
                      <option value="القنيطرة">القنيطرة</option>
                      <option value="الدار البيضاء">الدار البيضاء</option>
                      <option value="فاس">فاس</option>
                      <option value="مراكش">مراكش</option>
                      <option value="أكادير">أكادير</option>
                      <option value="طنجة">طنجة</option>
                      <option value="وجدة">وجدة</option>
                      <option value="مكناس">مكناس</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      الحي *
                    </label>
                    <input
                      value={modifyForm.neighborhood}
                      onChange={(e) =>
                        setModifyForm({ ...modifyForm, neighborhood: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">معلومات الاتصال</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      اسم المالك *
                    </label>
                    <input
                      value={modifyForm.ownerName}
                      onChange={(e) =>
                        setModifyForm({ ...modifyForm, ownerName: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      value={modifyForm.contactPhone}
                      onChange={(e) =>
                        setModifyForm({ ...modifyForm, contactPhone: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      واتساب
                    </label>
                    <input
                      type="tel"
                      value={modifyForm.contactWhatsApp}
                      onChange={(e) =>
                        setModifyForm({ ...modifyForm, contactWhatsApp: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">معلومات التوصيل</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      هل يوجد توصيل؟
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hasDelivery"
                          checked={!modifyForm.hasDelivery}
                          onChange={() =>
                            setModifyForm((prev) => ({
                              ...prev,
                              hasDelivery: false,
                            }))
                          }
                          className="mr-2"
                        />
                        لا يوجد توصيل
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hasDelivery"
                          checked={modifyForm.hasDelivery}
                          onChange={() =>
                            setModifyForm((prev) => ({
                              ...prev,
                              hasDelivery: true,
                            }))
                          }
                          className="mr-2"
                        />
                        يوجد توصيل
                      </label>
                    </div>
                  </div>

                  {modifyForm.hasDelivery && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          سعر التوصيل (درهم)
                        </label>
                        <input
                          type="number"
                          value={modifyForm.deliveryPrice}
                          onChange={(e) =>
                            setModifyForm({ ...modifyForm, deliveryPrice: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          ملاحظات التوصيل
                        </label>
                        <input
                          type="text"
                          value={modifyForm.deliveryNotes}
                          onChange={(e) =>
                            setModifyForm({ ...modifyForm, deliveryNotes: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModifyModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={submitModifyRequest}
                disabled={modifySubmitting}
                className="px-4 py-2 bg-teal text-dark-blue rounded-lg hover:bg-teal/90 disabled:opacity-50"
              >
                {modifySubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

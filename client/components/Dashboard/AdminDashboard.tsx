import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  adminAPI,
  adminAuthAPI,
  productsAPI,
  productSubmissionAPI,
  categoriesAPI,
  ProductSubmission,
  Product,
  Category,
} from "../../lib/api";
import {
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  TrendingUp,
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  LogOut,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "../../hooks/use-toast";
import { LoadingButton, LoadingOverlay, LoadingCard } from "../ui/loading-spinner";
import ProductComparison from "../ui/product-comparison";
import { uploadCategoryImage } from "../../lib/categoryImageUpload";

export default function AdminDashboard() {
  const { userProfile, logout } = useAuth();
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "submissions" | "products" | "users" | "categories"
  >("overview");
  const [selectedSubmission, setSelectedSubmission] =
    useState<ProductSubmission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);
  const [deletingSubmission, setDeletingSubmission] = useState<string | null>(null);
  const [approvingSubmission, setApprovingSubmission] = useState<string | null>(null);
  const [rejectingSubmission, setRejectingSubmission] = useState<string | null>(null);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const loadEssentialData = useCallback(async () => {
    try {
      setLoading(true);
      const recentSubmissions = await adminAPI.getPendingSubmissions(20);
      setSubmissions(recentSubmissions || []);
      console.log("Loaded pending submissions:", recentSubmissions?.length || 0);

      const usersResult = await adminAPI.getAllUsers(1, 50);
      // Handle paginated response
      if (usersResult.users) {
        setUsers(usersResult.users);
      } else {
        setUsers(Array.isArray(usersResult) ? usersResult : []);
      }
    } catch (error) {
      console.error("Error loading essential data:", error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: error instanceof Error ? error.message : "تعذر تحميل البيانات الأساسية",
        variant: "destructive",
      });
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []); // Memoize to prevent recreation

  const loadOriginalProduct = async (submission: ProductSubmission) => {
    if (submission.request_state === 'modify' && submission.product_data.originalProductId) {
      try {
        const product = await productsAPI.getProductById(submission.product_data.originalProductId);
        setOriginalProduct(product);
      } catch (error) {
        console.error("Error loading original product:", error);
        setOriginalProduct(null);
      }
    } else {
      setOriginalProduct(null);
    }
  };

  const loadSubmissions = useCallback(async (page: number = 1) => {
    try {
      const result = await adminAPI.getAllSubmissions(page, 50);
      // Handle paginated response
      if (result.submissions) {
        setSubmissions(result.submissions);
      } else {
        // Backward compatibility
        setSubmissions(Array.isArray(result) ? result : []);
      }
      console.log("Loaded submissions:", Array.isArray(result) ? result.length : result.submissions?.length || 0);
      // Removed the users.length check - users are loaded separately in loadEssentialData
    } catch (error) {
      console.error("Error loading submissions:", error);
      toast({
        title: "خطأ في تحميل الطلبات",
        description: error instanceof Error ? error.message : "تعذر تحميل الطلبات",
        variant: "destructive",
      });
      setSubmissions([]);
    }
  }, []);

  const loadProducts = useCallback(async (page: number = 1) => {
    try {
      setProductsLoading(true);
      const result = await productsAPI.getAllApprovedProducts(page, 50);
      // Handle paginated response
      if (result.products) {
        setProducts(result.products as Product[]);
      } else {
        // Backward compatibility
        setProducts(Array.isArray(result) ? (result as Product[]) : []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async (page: number = 1) => {
    try {
      const result = await adminAPI.getAllUsers(page, 50);
      // Handle paginated response
      if (result.users) {
        setUsers(result.users);
      } else {
        // Backward compatibility
        setUsers(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await categoriesAPI.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "خطأ في تحميل الفئات",
        description: "تعذر تحميل قائمة الفئات",
        variant: "destructive",
      });
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const handleCreateCategory = async (categoryData: Omit<Category, "id" | "created_at" | "updated_at" | "product_count">) => {
    try {
      await categoriesAPI.createCategory(categoryData);
      await loadCategories();
      setShowCategoryModal(false);
      setEditingCategory(null);
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الفئة بنجاح",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast({
        title: "خطأ",
        description: error.message || "تعذر إنشاء الفئة",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await categoriesAPI.updateCategory(id, updates);
      await loadCategories();
      setShowCategoryModal(false);
      setEditingCategory(null);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث الفئة بنجاح",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast({
        title: "خطأ",
        description: error.message || "تعذر تحديث الفئة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const result = await Swal.fire({
      title: "حذف الفئة",
      text: "هل أنت متأكد من حذف هذه الفئة؟ سيتم إخفاؤها من الصفحة الرئيسية.",
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

    if (result.isConfirmed) {
      try {
        await categoriesAPI.deleteCategory(id);
        await loadCategories();
        toast({
          title: "تم بنجاح",
          description: "تم حذف الفئة بنجاح",
          variant: "default",
        });
      } catch (error: any) {
        console.error("Error deleting category:", error);
        toast({
          title: "خطأ",
          description: error.message || "تعذر حذف الفئة",
          variant: "destructive",
        });
      }
    }
  };

  const loadAdminData = async () => {
    await loadEssentialData();
    // Lazy load tab data only when tab is active
    if (activeTab === "submissions") {
      await loadSubmissions(1);
    } else if (activeTab === "products") {
      await loadProducts(1);
    } else if (activeTab === "users") {
      await loadUsers(1);
    }
  };

  const handleApproveSubmission = async (submission: ProductSubmission) => {
    const result = await Swal.fire({
      title: "تأكيد الموافقة",
      text: `هل أنت متأكد من الموافقة على طلب "${submission.product_data.toolName}"؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "نعم، وافق",
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
      setApprovingSubmission(submission.id);

      setSubmissions(prev => prev.filter(s => s.id !== submission.id));

      toast({
        title: "جاري المعالجة...",
        description: `تمت الموافقة على طلب "${submission.product_data.toolName}"`,
        variant: "default",
      });

      await adminAPI.approveSubmission(submission.id, undefined);

      await loadEssentialData();

      toast({
        title: "تمت الموافقة بنجاح",
        description: `تمت الموافقة على طلب "${submission.product_data.toolName}"`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error approving submission:", error);

      // Revert optimistic update on error
      setSubmissions(prev => [...prev, submission]);

      // Error toast
      toast({
        title: "خطأ في الموافقة",
        description: "تعذر الموافقة على الطلب",
        variant: "destructive",
      });
    } finally {
      setApprovingSubmission(null);
    }
  };

  const handleRejectSubmission = async (submission: ProductSubmission) => {
    const { value: reason } = await Swal.fire({
      title: "رفض الطلب",
      text: `هل أنت متأكد من رفض طلب "${submission.product_data.toolName}"؟`,
      input: "textarea",
      inputLabel: "سبب الرفض (اختياري)",
      inputPlaceholder: "أدخل سبب الرفض...",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "نعم، ارفض",
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

    if (!reason && reason !== "") {
      return;
    }

    try {
      setRejectingSubmission(submission.id);

      // Optimistic update - remove from UI immediately
      setSubmissions(prev => prev.filter(s => s.id !== submission.id));

      // Show immediate success feedback
      toast({
        title: "جاري المعالجة...",
        description: `تم رفض طلب "${submission.product_data.toolName}"`,
        variant: "default",
      });

      // Perform rejection in background
      await adminAPI.rejectSubmission(submission.id, reason || "تم رفض الطلب");

      // Invalidate only relevant caches
      // Only reload essential data, not everything
      await loadEssentialData();

      // Update success toast
      toast({
        title: "تم الرفض بنجاح",
        description: `تم رفض طلب "${submission.product_data.toolName}"`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error rejecting submission:", error);

      // Revert optimistic update on error
      setSubmissions(prev => [...prev, submission]);

      // Error toast
      toast({
        title: "خطأ في الرفض",
        description: "تعذر رفض الطلب",
        variant: "destructive",
      });
    } finally {
      setRejectingSubmission(null);
    }
  };

  // Cleanup handled requests (remove approved/rejected submissions)
  const handleCleanupHandledRequests = async () => {
    const handledSubmissions = submissions.filter(
      s => s.status === "approved" || s.status === "rejected"
    );

    if (handledSubmissions.length === 0) {
      toast({
        title: "لا توجد طلبات معالجة",
        description: "جميع الطلبات في انتظار المراجعة",
        variant: "default",
      });
      return;
    }

    const result = await Swal.fire({
      title: "تنظيف الطلبات المعالجة",
      html: `هل أنت متأكد من حذف <strong>${handledSubmissions.length}</strong> طلب معالج؟<br><br>لا يمكن التراجع عن هذا الإجراء.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `نعم، احذف ${handledSubmissions.length} طلب`,
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
      setCleaningUp(true);

      // Delete them one by one
      for (let i = 0; i < handledSubmissions.length; i++) {
        const submission = handledSubmissions[i];
        await productSubmissionAPI.deleteSubmission(submission.id);
      }

      // Reload data
      await loadAdminData();

      // Success toast
      toast({
        title: "تم التنظيف بنجاح",
        description: `تم حذف ${handledSubmissions.length} طلب معالج`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error cleaning up handled requests:", error);

      // Error toast
      toast({
        title: "خطأ في التنظيف",
        description: "تعذر حذف الطلبات المعالجة",
        variant: "destructive",
      });
    } finally {
      setCleaningUp(false);
    }
  };

  // Get count of handled requests
  const handledRequestsCount = submissions.filter(
    s => s.status === "approved" || s.status === "rejected"
  ).length;

  const handleDeleteSubmission = async (id: string) => {
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
      setSubmissions(prev => {
        const filtered = prev.filter(s => s.id !== id);
        return filtered;
      });

      // 2. Show immediate success feedback
      toast({
        title: "تم الحذف",
        description: "تم حذف الطلب بنجاح",
        variant: "default",
      });

      // 3. Queue operation in Firebase (instant, non-blocking)
      // Firebase operations removed - using direct API call
      await productSubmissionAPI.deleteSubmission(id);
    } catch (error) {
      console.error("Error queuing deletion:", error);

      // Revert UI update on error
      loadAdminData();

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
    try {
      await productsAPI.deleteProduct(id);
      await loadAdminData();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleToggleAdminStatus = async (
    userId: string,
    currentStatus: boolean,
  ) => {
    try {
      await adminAPI.updateUserAdminStatus(userId, !currentStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_admin: !currentStatus } : u,
        ),
      );
    } catch (error) {
      console.error("Error updating admin status:", error);
    }
  };

  const handleViewSubmissionDetails = async (submission: ProductSubmission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);

    // Load original product for modify requests
    if (submission.request_state === 'modify') {
      await loadOriginalProduct(submission);
    } else {
      setOriginalProduct(null);
    }
  };

  // UseEffect hooks after all function definitions
  useEffect(() => {
    let isMounted = true;
    
    // Only load essential data on initial load
    const loadData = async () => {
      if (isMounted) {
        await loadEssentialData();
      }
    };
    
    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Load data based on active tab
  useEffect(() => {
    // Only load if not in overview tab (overview uses loadEssentialData)
    if (activeTab === "submissions") {
      loadSubmissions(1);
    } else if (activeTab === "products") {
      loadProducts(1);
    } else if (activeTab === "users") {
      loadUsers(1);
    } else if (activeTab === "categories") {
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // Only depend on activeTab, not the load functions

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

  // Request state helper functions
  const getRequestStateText = (requestState: string) => {
    switch (requestState) {
      case "add":
        return "إضافة منتج";
      case "modify":
        return "تعديل منتج";
      case "delete":
        return "حذف منتج";
      default:
        return "غير معروف";
    }
  };

  const getRequestStateIcon = (requestState: string) => {
    switch (requestState) {
      case "add":
        return <Package className="w-4 h-4" />;
      case "modify":
        return <Settings className="w-4 h-4" />;
      case "delete":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getRequestStateColor = (requestState: string) => {
    switch (requestState) {
      case "add":
        return "bg-teal/10 text-teal border-teal/30";
      case "modify":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "delete":
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
    });
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

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const approvedSubmissions = submissions.filter(
    (s) => s.status === "approved",
  );
  const rejectedSubmissions = submissions.filter(
    (s) => s.status === "rejected",
  );

  return (
    <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="cursor-pointer hover:opacity-80 transition-opacity">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-12"
                />
              </Link>
              <h1 className="text-2xl font-bold text-dark-blue">
                لوحة الإدارة
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">
                مرحباً، {userProfile?.display_name || "المدير"}
              </span>
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
                      // Use admin logout for admin dashboard
                      await adminAuthAPI.logout();
                      // Also call regular logout to clear user session
                      await logout();
                      window.location.href = "/admin-login";
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
              { id: "users", label: "المستخدمين", icon: Users },
              { id: "categories", label: "الفئات", icon: FolderTree },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                      {pendingSubmissions.length}
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
                    <p className="text-gray-600 text-sm">المنتجات المنشورة</p>
                    <p className="text-3xl font-bold text-green-600">
                      {products.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">إجمالي المستخدمين</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {users.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-dark-blue">
                  النشاط الأخير
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          طلب جديد: {submission.product_data.toolName}
                        </p>
                        <p className="text-sm text-gray-500">
                          من{" "}
                          {users.find((u) => u.id === submission.user_id)
                            ?.display_name || "مستخدم"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}
                      >
                        {getStatusText(submission.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(submission.submitted_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "submissions" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-dark-blue">جميع الطلبات</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadSubmissions(1)}
                    className="px-3 py-1 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors text-sm"
                    title="تحديث الطلبات"
                  >
                    تحديث
                  </button>
                  {handledRequestsCount > 0 && (
                    <button
                      onClick={handleCleanupHandledRequests}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      title={`حذف ${handledRequestsCount} طلب معالج`}
                    >
                      تنظيف الطلبات المعالجة ({handledRequestsCount})
                    </button>
                  )}
                </div>
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
                      المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      نوع الطلب
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
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">لا توجد طلبات</p>
                          <p className="text-gray-400 text-sm mt-2">
                            لم يتم العثور على أي طلبات في النظام
                          </p>
                          <button
                            onClick={() => loadSubmissions(1)}
                            className="mt-4 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors"
                          >
                            تحديث
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    submissions.map((submission) => (
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
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {users.find((u) => u.uid === submission.user_id)
                          ?.display_name || "غير معروف"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRequestStateColor(submission.request_state)}`}
                        >
                          {getRequestStateIcon(submission.request_state)}
                          {getRequestStateText(submission.request_state)}
                        </span>
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
                            onClick={() =>
                              handleViewSubmissionDetails(submission)
                            }
                            className="p-2 text-teal hover:text-teal/80 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          {submission.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApproveSubmission(submission)
                                }
                                disabled={approvingSubmission === submission.id}
                                className={`p-2 transition-colors ${approvingSubmission === submission.id
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-green-400 hover:text-green-600"
                                  }`}
                                title={approvingSubmission === submission.id ? "جاري المعالجة..." : "موافقة"}
                              >
                                {approvingSubmission === submission.id ? (
                                  <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectSubmission(submission)
                                }
                                disabled={rejectingSubmission === submission.id}
                                className={`p-2 transition-colors ${rejectingSubmission === submission.id
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-red-400 hover:text-red-600"
                                  }`}
                                title={rejectingSubmission === submission.id ? "جاري المعالجة..." : "رفض"}
                              >
                                {rejectingSubmission === submission.id ? (
                                  <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteSubmission(submission.id)
                            }
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                            title="حذف"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-dark-blue">
                جميع المنتجات
              </h2>
            </div>

            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
                  <p className="text-gray-600">جاري تحميل المنتجات...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                        المنتج
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                        المالك
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
                          {product.owner_name || "غير معروف"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.daily_price} درهم/اليوم
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
                          {formatDate(product.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/outil/${product.id}`}
                              className="p-2 text-teal hover:text-teal/80 transition-colors"
                              title="عرض المنتج"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-400 hover:text-red-600 transition-colors"
                              title="حذف"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "categories" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-blue font-arabic">
                إدارة الفئات
              </h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryModal(true);
                }}
                className="flex items-center gap-2 bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange/90 transition-colors font-arabic"
              >
                <Plus className="w-4 h-4" />
                إضافة فئة جديدة
              </button>
            </div>
            {categoriesLoading ? (
              <div className="p-8 text-center">
                <LoadingCard />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 font-arabic">
                        الترتيب
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 font-arabic">
                        الاسم
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 font-arabic">
                        الأيقونة
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 font-arabic">
                        عدد المنتجات
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 font-arabic">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 font-arabic">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-arabic">
                          لا توجد فئات
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {category.display_order}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 font-arabic">
                                {category.name}
                              </p>
                              {category.name_en && (
                                <p className="text-sm text-gray-500">
                                  {category.name_en}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {category.icon_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {category.product_count || 0}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                category.is_active
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}
                            >
                              {category.is_active ? "نشط" : "معطل"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingCategory(category);
                                  setShowCategoryModal(true);
                                }}
                                className="p-2 text-teal hover:text-teal/80 transition-colors"
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-dark-blue">
                جميع المستخدمين
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      البريد الإلكتروني
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      الصلاحيات
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      المنتجات
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      تاريخ التسجيل
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.display_name || 'User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user.phone || "لا يوجد رقم هاتف"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${(user.is_admin || user.isAdmin)
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                        >
                          {(user.is_admin || user.isAdmin) ? "مدير" : "مستخدم عادي"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {
                          products.filter(
                            (p) => p.owner_name === user.display_name,
                          ).length
                        }{" "}
                        منتج
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.created_at || user.createdAt || '')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleToggleAdminStatus(user.id, user.is_admin || user.isAdmin || false)
                            }
                            className={`p-2 transition-colors ${(user.is_admin || user.isAdmin)
                              ? "text-orange-400 hover:text-orange-600"
                              : "text-purple-400 hover:text-purple-600"
                              }`}
                            title={
                              (user.is_admin || user.isAdmin)
                                ? "إلغاء الصلاحيات الإدارية"
                                : "منح الصلاحيات الإدارية"
                            }
                          >
                            <Settings className="w-4 h-4" />
                          </button>
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

      {/* Submission Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            dir="rtl"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-dark-blue">
                  تفاصيل الطلب
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Request Type Header */}
              <div className="flex items-center justify-between p-4 bg-teal/10 rounded-lg border border-teal/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-teal rounded-full"></div>
                  <span className="font-medium text-teal">
                    نوع الطلب: {selectedSubmission.request_state === 'add' ? 'إضافة منتج جديد' :
                      selectedSubmission.request_state === 'modify' ? 'تعديل منتج موجود' :
                        'حذف منتج'}
                  </span>
                </div>
                <div className="text-sm text-teal">
                  {selectedSubmission.submitted_at ? new Date(selectedSubmission.submitted_at).toLocaleDateString('ar-SA') : ''}
                </div>
              </div>

              {/* Show comparison for modify requests */}
              {selectedSubmission.request_state === 'modify' && originalProduct ? (
                <ProductComparison
                  originalProduct={originalProduct}
                  modifiedData={selectedSubmission.product_data}
                />
              ) : selectedSubmission.request_state === 'modify' && !originalProduct ? (
                <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                  <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-2"></div>
                  جاري تحميل بيانات المنتج الأصلي...
                </div>
              ) : (
                /* Show regular details for add/delete requests */
                <>
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        اسم الأداة
                      </label>
                      <p className="text-lg font-semibold text-dark-blue">
                        {selectedSubmission.product_data.toolName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الفئة
                      </label>
                      <p className="text-gray-900">
                        {selectedSubmission.product_data.category}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        العلامة التجارية
                      </label>
                      <p className="text-gray-900">
                        {selectedSubmission.product_data.brand || "غير محدد"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الموديل
                      </label>
                      <p className="text-gray-900">
                        {selectedSubmission.product_data.model || "غير محدد"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحالة
                      </label>
                      <p className="text-gray-900">
                        {selectedSubmission.product_data.condition}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        السعر اليومي
                      </label>
                      <p className="text-lg font-semibold text-green-600">
                        {selectedSubmission.product_data.dailyPrice} درهم/اليوم
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الوصف
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedSubmission.product_data.description}
                    </p>
                  </div>

                  {/* Specifications */}
                  {selectedSubmission.product_data.specifications && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المواصفات التقنية
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedSubmission.product_data.specifications}
                      </p>
                    </div>
                  )}

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المدينة
                      </label>
                      <p className="text-gray-900">
                        {selectedSubmission.product_data.city}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحي
                      </label>
                      <p className="text-gray-900">
                        {selectedSubmission.product_data.neighborhood}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        اسم المالك
                      </label>
                      <p className="text-gray-900">
                        {selectedSubmission.product_data.ownerName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم الهاتف
                      </label>
                      <p className="text-gray-900">
                        {selectedSubmission.product_data.contactPhone}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        واتساب
                      </label>
                      <p className="text-gray-900">
                        {selectedSubmission.product_data.contactWhatsApp ||
                          "غير متوفر"}
                      </p>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      التوصيل
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {selectedSubmission.product_data.hasDelivery ? (
                        <div>
                          <p className="text-green-600 font-medium">متوفر</p>
                          {selectedSubmission.product_data.deliveryPrice && (
                            <p className="text-sm text-gray-600">
                              السعر: {selectedSubmission.product_data.deliveryPrice}{" "}
                              درهم
                            </p>
                          )}
                          {selectedSubmission.product_data.deliveryNotes && (
                            <p className="text-sm text-gray-600">
                              ملاحظات:{" "}
                              {selectedSubmission.product_data.deliveryNotes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-600">غير متوفر</p>
                      )}
                    </div>
                  </div>

                  {/* Images */}
                  {selectedSubmission.product_data.images &&
                    selectedSubmission.product_data.images.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          صور الأداة
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedSubmission.product_data.images.map(
                            (image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`صورة ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </>
              )}

              {/* Submission Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <label className="block font-medium">تاريخ التقديم</label>
                    <p>{formatDate(selectedSubmission.submitted_at)}</p>
                  </div>
                  <div>
                    <label className="block font-medium">الحالة</label>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}
                    >
                      {getStatusIcon(selectedSubmission.status)}
                      {getStatusText(selectedSubmission.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block font-medium">معرف المستخدم</label>
                    <p className="font-mono text-xs">
                      {selectedSubmission.user_id}
                    </p>
                  </div>
                </div>
                {selectedSubmission.admin_notes && (
                  <div className="mt-4">
                    <label className="block font-medium text-red-600 mb-1">
                      ملاحظات الإدارة
                    </label>
                    <p className="text-red-700 bg-red-50 p-3 rounded-lg">
                      {selectedSubmission.admin_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedSubmission.status === "pending" && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        handleApproveSubmission(selectedSubmission);
                        setShowDetailsModal(false);
                      }}
                      disabled={approvingSubmission === selectedSubmission.id}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${approvingSubmission === selectedSubmission.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                        }`}
                    >
                      {approvingSubmission === selectedSubmission.id ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      {approvingSubmission === selectedSubmission.id ? "جاري المعالجة..." : "موافقة"}
                    </button>
                    <button
                      onClick={() => {
                        handleRejectSubmission(selectedSubmission);
                        setShowDetailsModal(false);
                      }}
                      disabled={rejectingSubmission === selectedSubmission.id}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${rejectingSubmission === selectedSubmission.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600"
                        }`}
                    >
                      {rejectingSubmission === selectedSubmission.id ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      {rejectingSubmission === selectedSubmission.id ? "جاري المعالجة..." : "رفض"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSave={editingCategory
            ? (updates) => handleUpdateCategory(editingCategory.id, updates)
            : (categoryData) => handleCreateCategory(categoryData)
          }
        />
      )}
    </div>
  );
}

// Category Modal Component
function CategoryModal({
  category,
  onClose,
  onSave,
}: {
  category: Category | null;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    name_en: category?.name_en || "",
    icon_name: category?.icon_name || "Settings",
    image_url: category?.image_url || "",
    hero_image_url: category?.hero_image_url || "",
    display_order: category?.display_order || 0,
    is_active: category?.is_active ?? true,
  });
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(category?.image_url || null);
  const [heroPreview, setHeroPreview] = useState<string | null>(category?.hero_image_url || null);

  const availableIcons = [
    "Zap", "HardHat", "Drill", "Construction", "Truck", "Settings",
    "Wrench", "Hammer", "Package", "Tool", "Cog"
  ];

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const categoryId = category?.id || 'new';
      const result = await uploadCategoryImage(file, categoryId, 'thumbnail');
      
      if (result.success && result.url) {
        setFormData({ ...formData, image_url: result.url });
        setThumbnailPreview(result.url);
        toast({
          title: "تم رفع الصورة بنجاح",
          description: "تم رفع صورة الفئة المصغرة",
        });
      } else {
        toast({
          title: "خطأ في رفع الصورة",
          description: result.error || "فشل في رفع الصورة",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast({
        title: "خطأ في رفع الصورة",
        description: "حدث خطأ أثناء رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const categoryId = category?.id || 'new';
      const result = await uploadCategoryImage(file, categoryId, 'hero');
      
      if (result.success && result.url) {
        setFormData({ ...formData, hero_image_url: result.url });
        setHeroPreview(result.url);
        toast({
          title: "تم رفع الصورة بنجاح",
          description: "تم رفع صورة البانر للفئة",
        });
      } else {
        toast({
          title: "خطأ في رفع الصورة",
          description: result.error || "فشل في رفع الصورة",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading hero:', error);
      toast({
        title: "خطأ في رفع الصورة",
        description: "حدث خطأ أثناء رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setUploadingHero(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setFormData({ ...formData, image_url: "" });
    setThumbnailPreview(null);
  };

  const handleRemoveHero = () => {
    setFormData({ ...formData, hero_image_url: "" });
    setHeroPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-auto shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 font-arabic">
            {category ? "تعديل الفئة" : "إضافة فئة جديدة"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">
                الاسم (عربي)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange font-arabic text-right"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">
                الاسم (إنجليزي - اختياري)
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">
                اسم الأيقونة
              </label>
              <select
                value={formData.icon_name}
                onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                required
              >
                {availableIcons.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">
                ترتيب العرض
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                min="0"
                required
              />
            </div>
            <div className="flex items-center gap-2 lg:col-span-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-orange focus:ring-orange border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 font-arabic">
                نشط
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">
              صورة الأيقونة (75×75)
            </label>
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5 text-center">
              {thumbnailPreview ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={thumbnailPreview}
                    alt="صورة الفئة"
                    className="w-24 h-24 rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                  <div className="flex gap-2">
                    <label className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm">
                      تغيير الصورة
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbnailUpload}
                        disabled={uploadingThumbnail}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      إزالة
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 font-arabic">
                    لم يتم اختيار صورة. ستظهر أيقونة افتراضية بدلاً من ذلك.
                  </p>
                  <label className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium ${uploadingThumbnail ? "bg-gray-400 cursor-not-allowed" : "bg-orange hover:bg-orange/90"} transition-colors cursor-pointer`}>
                    {uploadingThumbnail ? "جاري الرفع..." : "رفع صورة"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailUpload}
                      disabled={uploadingThumbnail}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">
              صورة البانر (1200×400)
            </label>
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5">
              {heroPreview ? (
                <div className="space-y-3">
                  <img
                    src={heroPreview}
                    alt="صورة البانر"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                  <div className="flex gap-2 justify-center">
                    <label className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm">
                      تغيير الصورة
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleHeroUpload}
                        disabled={uploadingHero}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveHero}
                      className="px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      إزالة
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-center">
                  <div className="h-32 w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-gray-500 text-sm">
                    <p>لم يتم رفع صورة بانر</p>
                    <p className="text-xs text-gray-400 mt-1">
                      تظهر في أعلى صفحة الفئة
                    </p>
                  </div>
                  <label className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium ${uploadingHero ? "bg-gray-400 cursor-not-allowed" : "bg-orange hover:bg-orange/90"} transition-colors cursor-pointer`}>
                    {uploadingHero ? "جاري الرفع..." : "رفع صورة"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleHeroUpload}
                      disabled={uploadingHero}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">
              الاسم (إنجليزي - اختياري)
            </label>
            <input
              type="text"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">
              اسم الأيقونة
            </label>
            <select
              value={formData.icon_name}
              onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
              required
            >
              {availableIcons.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic text-right">
              ترتيب العرض
            </label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
              min="0"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-orange focus:ring-orange border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 font-arabic">
              نشط
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-arabic"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors font-arabic"
            >
              {category ? "تحديث" : "إنشاء"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

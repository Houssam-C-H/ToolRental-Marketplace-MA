import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, CheckCircle, XCircle, Eye, FileText } from "lucide-react";
import { productSubmissionAPI, ProductSubmission } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function MySubmissions() {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<ProductSubmission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [currentUser]);

  const loadSubmissions = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await productSubmissionAPI.getUserSubmissions(currentUser.uid);
      setSubmissions(data);
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-blue mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل طلباتك...</p>
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
              <h1 className="text-2xl font-bold text-dark-blue">طلباتي</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/ajouter-equipement"
                className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange/90 transition-colors"
              >
                إضافة منتج جديد
              </Link>
              <Link
                to="/"
                className="text-dark-blue hover:text-orange transition-colors flex items-center gap-2 font-arabic"
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
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-dark-blue mb-2">
              تتبع طلبات إضافة المنتجات
            </h2>
            <p className="text-gray-600 text-lg">
              تابع حالة طلباتك واعرف متى سيتم مراجعتها ونشرها على المنصة
            </p>
          </div>
        </div>

        {/* Submissions Grid */}
        {submissions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-4">
              لا توجد طلبات بعد
            </h3>
            <p className="text-gray-500 mb-8">
              ابدأ بإضافة منتجك الأول للحصول على طلبات التتبع
            </p>
            <Link
              to="/ajouter-equipement"
              className="bg-dark-blue text-white px-8 py-3 rounded-lg hover:bg-dark-blue/90 transition-colors font-medium"
            >
              إضافة منتج جديد
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Status Header */}
                <div
                  className={`px-6 py-4 border-b ${getStatusColor(submission.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(submission.status)}
                      <span className="font-medium">
                        {getStatusText(submission.status)}
                      </span>
                    </div>
                    <span className="text-xs opacity-75">
                      {formatDate(submission.submitted_at)}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-dark-blue mb-2">
                    {submission.product_data.toolName}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">الفئة:</span>
                      <span>{submission.product_data.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">العلامة التجارية:</span>
                      <span>{submission.product_data.brand}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">السعر:</span>
                      <span>
                        {submission.product_data.dailyPrice} درهم/اليوم
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">الموقع:</span>
                      <span>
                        {submission.product_data.city},{" "}
                        {submission.product_data.neighborhood}
                      </span>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {submission.admin_notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        ملاحظات الإدارة:
                      </p>
                      <p className="text-sm text-gray-600">
                        {submission.admin_notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      عرض التفاصيل
                    </button>

                    {submission.status === "rejected" && (
                      <Link
                        to="/ajouter-equipement"
                        state={{ rejectedSubmission: submission }}
                        className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange/90 transition-colors flex items-center justify-center gap-2"
                      >
                        إعادة التقديم
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-dark-blue">تفاصيل الطلب</h3>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  المعلومات الأساسية
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">اسم المنتج:</span>
                    <span className="font-medium">
                      {selectedSubmission.product_data.toolName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الفئة:</span>
                    <span className="font-medium">
                      {selectedSubmission.product_data.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">العلامة التجارية:</span>
                    <span className="font-medium">
                      {selectedSubmission.product_data.brand}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الموديل:</span>
                    <span className="font-medium">
                      {selectedSubmission.product_data.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحالة:</span>
                    <span className="font-medium">
                      {selectedSubmission.product_data.condition}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  معلومات الاتصال والموقع
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الهاتف:</span>
                    <span className="font-medium">
                      {selectedSubmission.product_data.contactPhone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الواتساب:</span>
                    <span className="font-medium">
                      {selectedSubmission.product_data.contactWhatsApp}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المدينة:</span>
                    <span className="font-medium">
                      {selectedSubmission.product_data.city}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحي:</span>
                    <span className="font-medium">
                      {selectedSubmission.product_data.neighborhood}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">السعر:</span>
                    <span className="font-medium">
                      {selectedSubmission.product_data.dailyPrice} درهم/اليوم
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-800 mb-3">الوصف</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {selectedSubmission.product_data.description}
              </p>
            </div>

            {/* Specifications */}
            {selectedSubmission.product_data.specifications && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">المواصفات</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedSubmission.product_data.specifications}
                </p>
              </div>
            )}

            {/* Delivery Info */}
            {selectedSubmission.product_data.hasDelivery && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  معلومات التوصيل
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">سعر التوصيل:</span>
                    <span className="font-medium">
                      {selectedSubmission.product_data.deliveryPrice} درهم
                    </span>
                  </div>
                  {selectedSubmission.product_data.deliveryNotes && (
                    <div>
                      <span className="text-gray-600">ملاحظات التوصيل:</span>
                      <p className="text-gray-600 mt-1">
                        {selectedSubmission.product_data.deliveryNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submission Timeline */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">جدول زمني</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">تم تقديم الطلب</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(selectedSubmission.submitted_at)}
                    </p>
                  </div>
                </div>

                {selectedSubmission.reviewed_at && (
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${selectedSubmission.status === "approved"
                          ? "bg-green-500"
                          : "bg-red-500"
                        }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedSubmission.status === "approved"
                          ? "تمت الموافقة"
                          : "تم الرفض"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(selectedSubmission.reviewed_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

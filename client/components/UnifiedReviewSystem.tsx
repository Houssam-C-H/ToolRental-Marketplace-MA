import { useState, useEffect } from "react";
import { Star, User, Mail, Phone, CheckCircle, AlertCircle, Send, ThumbsUp, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { anonymousReviewsAPI, reviewsAPI } from "../lib/api";
import { AnonymousReview, ReviewSummary, Review } from "../lib/supabase";

interface UnifiedReviewSystemProps {
    productId: string;
    productName: string;
}

export default function UnifiedReviewSystem({
    productId,
    productName,
}: UnifiedReviewSystemProps) {
    const { currentUser, userProfile } = useAuth();

    // State management
    const [reviews, setReviews] = useState<(AnonymousReview | Review)[]>([]);
    const [summary, setSummary] = useState<ReviewSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form state
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [reviewerName, setReviewerName] = useState("");
    const [reviewerEmail, setReviewerEmail] = useState("");
    const [reviewerPhone, setReviewerPhone] = useState("");
    const [showContactInfo, setShowContactInfo] = useState(false);
    const [rateLimitError, setRateLimitError] = useState("");
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const [userReview, setUserReview] = useState<AnonymousReview | Review | null>(null);
    const [editingReview, setEditingReview] = useState<string | null>(null);

    useEffect(() => {
        loadReviews();
    }, [productId]);

    useEffect(() => {
        if (currentUser && reviews.length > 0) {
            const existingReview = reviews.find((r) =>
                'user_id' in r ? r.user_id === currentUser.uid : false
            );
            if (existingReview) {
                setUserReview(existingReview);
                setRating(existingReview.rating);
                setComment(existingReview.comment || "");
            }
        }
    }, [currentUser, reviews]);

    const loadReviews = async () => {
        try {
            setLoading(true);

            // Load only anonymous reviews for now (since reviews table doesn't exist)
            const [anonymousReviews, summaryData] = await Promise.all([
                anonymousReviewsAPI.getProductReviews(productId),
                anonymousReviewsAPI.getProductRatingSummary(productId)
            ]);

            // Use only anonymous reviews for now
            const allReviews = anonymousReviews
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setReviews(allReviews);
            setSummary(summaryData);
        } catch (error) {
            console.error("Error loading reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        // Rating validation
        if (rating === 0) {
            errors.rating = "يرجى اختيار تقييم من 1 إلى 5 نجوم";
        }

        // Comment validation
        if (comment.length > 500) {
            errors.comment = "التعليق يجب أن يكون أقل من 500 حرف";
        }

        // Email validation (if provided)
        if (reviewerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewerEmail)) {
            errors.email = "يرجى إدخال بريد إلكتروني صحيح";
        }

        // Phone validation (if provided)
        if (reviewerPhone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(reviewerPhone)) {
            errors.phone = "يرجى إدخال رقم هاتف صحيح";
        }

        // Name validation (if provided)
        if (reviewerName && reviewerName.length < 2) {
            errors.name = "الاسم يجب أن يكون أكثر من حرفين";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitReview = async () => {
        setValidationErrors({});
        setRateLimitError("");

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Enhanced spam detection
        const spamPatterns = [
            // URLs and links
            /(http|https|www\.|\.com|\.net|\.org)/i,
            // Commercial keywords
            /(buy|sell|cheap|free|discount|offer|deal|promo)/i,
            // Contact information
            /(call|contact|whatsapp|telegram|phone|mobile)/i,
            // Spam keywords
            /(spam|scam|fake|bot|automated)/i,
            // Repeated characters
            /(.)\1{4,}/i,
            // Excessive punctuation
            /[!]{3,}|[?]{3,}|[.]{3,}/i,
            // Phone number patterns
            /(\+?[0-9]{10,})/i,
            // Email patterns
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i
        ];

        const isSpam = spamPatterns.some(pattern => pattern.test(comment));
        if (isSpam) {
            setValidationErrors({ comment: "يبدو أن التعليق يحتوي على محتوى غير مرغوب فيه أو معلومات اتصال" });
            return;
        }

        // Check for suspicious patterns in reviewer info
        if (reviewerName && spamPatterns.some(pattern => pattern.test(reviewerName))) {
            setValidationErrors({ name: "الاسم يحتوي على محتوى غير مرغوب فيه" });
            return;
        }

        if (reviewerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewerEmail)) {
            setValidationErrors({ email: "يرجى إدخال بريد إلكتروني صحيح" });
            return;
        }

        try {
            setSubmitting(true);

            // Rate limiting is handled by the API, no need for client-side check

            // Always use anonymous reviews API for now (since reviews table doesn't exist)
            const userName = currentUser
                ? (userProfile?.displayName || currentUser.email?.split("@")[0] || "مستخدم مجهول")
                : (reviewerName.trim() || undefined);
            const userEmail = currentUser
                ? (currentUser.email || "")
                : (reviewerEmail.trim() || undefined);
            const userPhone = currentUser
                ? undefined
                : (reviewerPhone.trim() || undefined);

            if (userReview) {
                // For now, we can't update anonymous reviews easily, so we'll add a new one
                await anonymousReviewsAPI.addReview(
                    productId,
                    rating,
                    comment.trim(),
                    userName,
                    userEmail,
                    userPhone
                );
            } else {
                // Add new review
                await anonymousReviewsAPI.addReview(
                    productId,
                    rating,
                    comment.trim(),
                    userName,
                    userEmail,
                    userPhone
                );
            }

            // Update rate limiting
            localStorage.setItem(`lastReview_${productId}`, Date.now().toString());

            setSubmitted(true);
            setShowForm(false);
            await loadReviews(); // Reload reviews

            // Reset form
            setRating(0);
            setComment("");
            setReviewerName("");
            setReviewerEmail("");
            setReviewerPhone("");
            setShowContactInfo(false);
            setEditingReview(null);

            // Hide success message after 3 seconds
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error: any) {
            console.error("Error submitting review:", error);

            if (error.message?.includes('rate limit') || error.message?.includes('too many') ||
                error.message?.includes('يرجى الانتظار') || error.message?.includes('تقييم آخر')) {
                setRateLimitError(error.message);
            } else if (error.message?.includes('spam') || error.message?.includes('محتوى غير مرغوب')) {
                setValidationErrors({ comment: "تم رفض التعليق لاحتوائه على محتوى غير مرغوب فيه" });
            } else {
                alert("حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const deleteReview = async (reviewId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;

        try {
            console.log("Review deletion not implemented for anonymous reviews");
            alert("حذف التقييم غير متاح حالياً. يرجى المحاولة لاحقاً.");
        } catch (error) {
            console.error("Error deleting review:", error);
            alert("حدث خطأ أثناء حذف التقييم. يرجى المحاولة مرة أخرى.");
        }
    };

    const startEditingReview = (review: AnonymousReview | Review) => {
        setEditingReview(review.id);
        setRating(review.rating);
        setComment(review.comment || "");
        setShowForm(true);
    };

    const cancelEdit = () => {
        setEditingReview(null);
        setShowForm(false);
        if (userReview) {
            setRating(userReview.rating);
            setComment(userReview.comment || "");
        } else {
            setRating(0);
            setComment("");
        }
    };

    const renderStars = (
        currentRating: number,
        size: "sm" | "md" | "lg" = "md",
        interactive: boolean = false
    ) => {
        const sizeClasses = {
            sm: "w-4 h-4",
            md: "w-5 h-5",
            lg: "w-6 h-6",
        };

        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClasses[size]} transition-all duration-200 ${interactive ? "cursor-pointer hover:scale-110" : ""
                            } ${star <= (interactive ? hoverRating || rating : currentRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                        onClick={interactive ? () => setRating(star) : undefined}
                        onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
                        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "اليوم";
        if (diffDays === 2) return "أمس";
        if (diffDays <= 7) return `منذ ${diffDays} أيام`;
        if (diffDays <= 30) return `منذ ${Math.ceil(diffDays / 7)} أسابيع`;
        return date.toLocaleDateString("ar-SA");
    };

    const getRatingText = (rating: number) => {
        const texts = {
            1: "سيء جداً",
            2: "سيء",
            3: "متوسط",
            4: "جيد",
            5: "ممتاز"
        };
        return texts[rating as keyof typeof texts] || "";
    };

    const getReviewerName = (review: AnonymousReview | Review) => {
        if ('user_name' in review) {
            return review.user_name;
        }
        return review.reviewer_name || "مستخدم مجهول";
    };

    const isUserReview = (review: AnonymousReview | Review) => {
        if (!currentUser) return false;
        // For now, check by email since we're using anonymous reviews for everyone
        if ('reviewer_email' in review) {
            return review.reviewer_email === currentUser.email;
        }
        return false;
    };

    if (loading) {
        return (
            <div className="animate-pulse bg-white rounded-xl border border-gray-200 p-6" dir="rtl">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border-b border-gray-100 pb-4">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6" dir="rtl">
            {/* Success Message */}
            {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">تم إرسال تقييمك بنجاح! شكراً لك</p>
                </div>
            )}

            {/* Error Messages */}
            {rateLimitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 font-medium">{rateLimitError}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        تقييمات العملاء
                    </h3>
                    <p className="text-gray-600 text-sm">
                        شاركنا تجربتك مع {productName}
                    </p>
                </div>

                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                        style={{
                            background: 'linear-gradient(to right, #f97316, #ea580c)',
                            color: 'white',
                            border: 'none',
                            outline: 'none'
                        }}
                    >
                        <Star className="w-5 h-5" />
                        {userReview ? "تعديل تقييمي" : "أضف تقييمك"}
                    </button>
                )}
            </div>

            {/* Rating Summary */}
            {summary && summary.total_reviews > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-800">
                                    {summary.average_rating.toFixed(1)}
                                </div>
                                <div className="flex items-center gap-1">
                                    {renderStars(summary.average_rating, "md")}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {summary.total_reviews} {summary.total_reviews === 1 ? "تقييم" : "تقييم"}
                                </div>
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="flex-1 max-w-xs">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = summary.rating_distribution[`${star}_star` as keyof typeof summary.rating_distribution];
                                const percentage = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0;

                                return (
                                    <div key={star} className="flex items-center gap-2 mb-2">
                                        <span className="text-sm text-gray-600 w-8">{star}</span>
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-8">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* User's Review */}
            {userReview && (
                <div className="bg-teal/10 border border-teal/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-teal">تقييمك</h4>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => startEditingReview(userReview)}
                                className="text-teal hover:text-teal/80 p-1"
                                title="تعديل التقييم"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            {/* Temporarily hide delete button */}
                            {/* <button
                                onClick={() => deleteReview(userReview.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="حذف التقييم"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button> */}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        {renderStars(userReview.rating, "sm")}
                        <span className="text-sm text-gray-600">
                            {formatDate(userReview.created_at)}
                        </span>
                    </div>
                    {userReview.comment && (
                        <p className="text-gray-700 text-sm">{userReview.comment}</p>
                    )}
                </div>
            )}

            {/* Review Form */}
            {showForm && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">
                            {editingReview ? "تعديل التقييم" : "أضف تقييمك"}
                        </h4>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Rating Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            تقييمك *
                        </label>
                        <div className="flex items-center gap-4">
                            {renderStars(rating, "lg", true)}
                            {rating > 0 && (
                                <span className="text-lg font-medium text-gray-700">
                                    {getRatingText(rating)}
                                </span>
                            )}
                        </div>
                        {validationErrors.rating && (
                            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {validationErrors.rating}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            تعليقك (اختياري)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-200"
                            rows={4}
                            placeholder="شاركنا تجربتك مع هذه الأداة..."
                            maxLength={500}
                        />
                        <div className="text-xs text-gray-500 mt-1 text-left">
                            {comment.length}/500 حرف
                        </div>
                        {validationErrors.comment && (
                            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {validationErrors.comment}
                            </p>
                        )}
                    </div>

                    {/* Contact Information (Only for anonymous users) */}
                    {!currentUser && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <input
                                    type="checkbox"
                                    id="showContactInfo"
                                    checked={showContactInfo}
                                    onChange={(e) => setShowContactInfo(e.target.checked)}
                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <label htmlFor="showContactInfo" className="text-sm font-medium text-gray-700">
                                    إضافة معلومات الاتصال (اختياري) - لزيادة المصداقية
                                </label>
                            </div>

                            {showContactInfo && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            الاسم
                                        </label>
                                        <div className="relative">
                                            <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={reviewerName}
                                                onChange={(e) => setReviewerName(e.target.value)}
                                                className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${validationErrors.name ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                placeholder="اسمك"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            البريد الإلكتروني
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                value={reviewerEmail}
                                                onChange={(e) => setReviewerEmail(e.target.value)}
                                                className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${validationErrors.email ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                placeholder="بريدك الإلكتروني"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            رقم الهاتف
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={reviewerPhone}
                                                onChange={(e) => setReviewerPhone(e.target.value)}
                                                className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                placeholder="رقم هاتفك"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Contact Info Validation Errors */}
                            {(validationErrors.name || validationErrors.email || validationErrors.phone) && (
                                <div className="mt-2 space-y-1">
                                    {validationErrors.name && (
                                        <p className="text-red-600 text-xs flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {validationErrors.name}
                                        </p>
                                    )}
                                    {validationErrors.email && (
                                        <p className="text-red-600 text-xs flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {validationErrors.email}
                                        </p>
                                    )}
                                    {validationErrors.phone && (
                                        <p className="text-red-600 text-xs flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {validationErrors.phone}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSubmitReview}
                            disabled={rating === 0 || submitting}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{
                                background: rating === 0 || submitting
                                    ? 'linear-gradient(to right, #d1d5db, #9ca3af)'
                                    : 'linear-gradient(to right, #f97316, #ea580c)',
                                color: 'white',
                                border: 'none',
                                outline: 'none'
                            }}
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    {editingReview ? "تحديث التقييم" : "إرسال التقييم"}
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            style={{
                                backgroundColor: 'white',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                outline: 'none'
                            }}
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-orange-500" />
                    جميع التقييمات ({reviews.length})
                </h4>

                {reviews.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg mb-2">لا توجد تقييمات بعد</p>
                        <p className="text-gray-400 text-sm">كن أول من يقيم هذه الأداة!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">
                                                {getReviewerName(review).charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-800">
                                                    {getReviewerName(review)}
                                                </p>
                                                {('is_verified' in review && review.is_verified) && (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                )}
                                                {isUserReview(review) && (
                                                    <span className="text-xs bg-teal/10 text-teal px-2 py-1 rounded-full">
                                                        تقييمك
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(review.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {renderStars(review.rating, "sm")}
                                        <span className="text-sm font-medium text-gray-600">
                                            {getRatingText(review.rating)}
                                        </span>
                                    </div>
                                </div>

                                {review.comment && (
                                    <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Trash2, Edit2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { reviewsAPI } from "../lib/api";
import { Review } from "../lib/supabase";

interface RatingSystemProps {
  toolId: string;
  currentRating: number;
  totalReviews: number;
  canRate?: boolean;
}

export default function RatingSystem({
  toolId,
  currentRating,
  totalReviews,
  canRate = true,
}: RatingSystemProps) {
  const { currentUser, userProfile } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [toolId]);

  useEffect(() => {
    if (currentUser && reviews.length > 0) {
      const existingReview = reviews.find((r) => r.user_id === currentUser.id);
      if (existingReview) {
        setUserReview(existingReview);
        setUserRating(existingReview.rating);
        setComment(existingReview.comment || "");
      }
    }
  }, [currentUser, reviews]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      console.log("Loading reviews for product:", toolId);
      const reviewsData = await reviewsAPI.getProductReviews(toolId);
      console.log("Reviews loaded:", reviewsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error loading reviews:", error);
      // Still set empty array on error so UI doesn't break
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!currentUser || userRating === 0) {
      console.log("Cannot submit review - missing user or rating:", {
        currentUser: !!currentUser,
        userRating,
      });
      return;
    }

    try {
      setSubmitting(true);

      const userName =
        userProfile?.display_name ||
        currentUser.email?.split("@")[0] ||
        "مستخدم مجهول";
      const userEmail = currentUser.email || "";

      console.log("Submitting review:", {
        toolId,
        userId: currentUser.id,
        userName,
        userEmail,
        userRating,
        comment,
      });

      if (userReview) {
        // Update existing review
        console.log("Updating existing review:", userReview.id);
        await reviewsAPI.updateReview(userReview.id, userRating, comment);
      } else {
        // Add new review
        console.log("Adding new review");
        await reviewsAPI.addReview(
          toolId,
          currentUser.uid,
          userName,
          userEmail,
          userRating,
          comment,
        );
      }

      // Reload reviews to get updated data
      await loadReviews();

      setShowReviewForm(false);
      setEditingReview(null);

      console.log("Review submitted successfully");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;

    try {
      await reviewsAPI.deleteReview(reviewId);
      await loadReviews();
      setUserReview(null);
      setUserRating(0);
      setComment("");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("حدث خطأ أثناء حذف التقييم. يرجى المحاولة مرة أخرى.");
    }
  };

  const startEditingReview = (review: Review) => {
    setEditingReview(review.id);
    setUserRating(review.rating);
    setComment(review.comment || "");
    setShowReviewForm(true);
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setShowReviewForm(false);
    if (userReview) {
      setUserRating(userReview.rating);
      setComment(userReview.comment || "");
    } else {
      setUserRating(0);
      setComment("");
    }
  };

  const renderStars = (
    rating: number,
    size: "sm" | "md" | "lg" = "md",
    interactive: boolean = false,
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
            className={`${sizeClasses[size]} transition-colors ${interactive ? "cursor-pointer" : ""
              } ${star <= (interactive ? hoverRating || userRating : rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
              }`}
            onClick={interactive ? () => setUserRating(star) : undefined}
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

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
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
    <div className="bg-white rounded-lg border border-gray-200 p-6" dir="rtl">
      {/* Overall Rating */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            التقييمات والمراجعات
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {renderStars(currentRating, "md")}
              <span className="text-lg font-bold text-gray-800">
                {currentRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-500">
              ({totalReviews} {totalReviews === 1 ? "تقييم" : "تقييمات"})
            </span>
          </div>
        </div>

        {/* Add/Edit Review Button */}
        <div>
          {!currentUser ? (
            <div className="text-center">
              <p className="text-gray-600 mb-3">
                قم بتسجيل الدخول لإضافة تقييم
              </p>
              <div className="flex gap-2 justify-center">
                <Link
                  to="/connexion"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/inscription"
                  className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  كن مزود خدمة
                </Link>
              </div>
            </div>
          ) : canRate && !showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors text-lg ${userReview
                ? "bg-teal hover:bg-teal/90 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              style={{
                background: userReview
                  ? 'linear-gradient(to right, #00C39A, #00A68A)'
                  : 'linear-gradient(to right, #FF6A18, #FF8533)',
                color: 'white',
                border: 'none',
                outline: 'none'
              }}
            >
              {userReview ? "تعديل تقييمي" : "أضف تقييم"}
            </button>
          ) : null}
        </div>
      </div>

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
              <button
                onClick={() => deleteReview(userReview.id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="حذف التقييم"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
      {showReviewForm && currentUser && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
          <h4 className="font-medium text-gray-800 mb-4">
            {editingReview ? "تعديل التقييم" : "أضف تقييمك"}
          </h4>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التقييم
            </label>
            {renderStars(userRating, "lg", true)}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التعليق (اختياري)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              rows={3}
              placeholder="شاركنا تجربتك مع هذه الأداة..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={submitReview}
              disabled={userRating === 0 || submitting}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: userRating === 0 || submitting
                  ? '#d1d5db'
                  : 'linear-gradient(to right, #f97316, #ea580c)',
                color: 'white',
                border: 'none',
                outline: 'none'
              }}
            >
              {submitting
                ? "جاري الإرسال..."
                : editingReview
                  ? "تحديث التقييم"
                  : "إرسال التقييم"}
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: 'linear-gradient(to right, #6b7280, #4b5563)',
                color: 'white',
                border: 'none',
                outline: 'none'
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Login Required Message */}
      {!currentUser && canRate && (
        <div className="text-center py-6 border-2 border-orange-200 rounded-lg mb-6 bg-orange-50">
          <p className="text-gray-700 mb-4 text-lg font-medium">
            يجب تسجيل الدخول لإضافة تقييم
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/connexion"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors text-lg"
            >
              تسجيل الدخول
            </Link>
            <Link
              to="/inscription"
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-colors text-lg border-2 border-sky-600"
            >
              كن مزود خدمة
            </Link>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h4 className="font-medium text-gray-800 mb-4">
          جميع التقييمات ({reviews.length})
        </h4>

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            لا توجد تقييمات بعد. كن أول من يقيم هذه الأداة!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">
                        {review.user_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {review.user_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating, "sm")}
                </div>
                {review.comment && (
                  <p className="text-gray-600 text-sm leading-relaxed">
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

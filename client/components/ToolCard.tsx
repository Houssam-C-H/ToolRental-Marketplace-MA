import { Link } from "react-router-dom";
import { useComparison } from "../contexts/ComparisonContext";
import LazyImage from "./LazyImage";

interface Tool {
  id: string | number; // Support both UUID strings and legacy number IDs
  name: string;
  description: string;
  price: number;
  priceUnit: string;
  location: string;
  category: string;
  condition: string;
  status: string;
  owner: string;
  ownerUserId?: string; // Supplier ID for routing to supplier profile
  rating: number;
  reviews: number;
  lastSeen: string;
  image: string;
  isFavorite: boolean;
  hasDelivery?: boolean;
  deliveryPrice?: number;
  contactPhone?: string;
  contactWhatsApp?: string;
}

// Helper function to convert string/number ID to number for comparison context
const getIdForComparison = (id: string | number): number => {
  return typeof id === 'string' ? parseInt(id, 10) || 0 : id;
};

// Helper function to convert Tool to comparison-compatible format
const convertToolForComparison = (tool: Tool) => {
  return {
    ...tool,
    id: getIdForComparison(tool.id)
  };
};

interface ToolCardProps {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: (toolId: string | number) => void;
  viewMode?: "grid" | "list";
}

export default function ToolCard({
  tool,
  isFavorite,
  onToggleFavorite,
  viewMode = "grid",
}: ToolCardProps) {
  const { addToComparison, isInComparison, comparisonCount } = useComparison();

  // Convert tool ID to number for comparison context
  const comparisonId = getIdForComparison(tool.id);

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${viewMode === "list" ? "flex" : "min-h-[320px] flex flex-col"
        }`}
    >
      {/* Tool Image */}
      <div
        className={`relative overflow-hidden ${viewMode === "list" ? "w-32 h-20" : "h-32"}`}
      >
        {/* Blurred Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: `url(${tool.image})`,
            filter: 'blur(8px)',
          }}
        />
        {/* Compare Button - Left Side - Premium Position */}
        <div className="absolute top-3 left-3 z-20">
          <button
            onClick={(e) => {
              const button = e.currentTarget;

              if (isInComparison(comparisonId)) {
                // Tool is already in comparison - show clear message
                showEnhancedToast(
                  "هذه الأداة موجودة بالفعل في المقارنة ✓",
                  "warning",
                );
                return;
              }

              if (addToComparison(convertToolForComparison(tool))) {
                // Success - tool added to comparison
                button.style.transform = "scale(0.9)";
                setTimeout(() => {
                  button.style.transform = "";
                }, 150);

                showEnhancedToast(
                  `✅ تم إضافة "${tool.name}" للمقارنة بنجاح`,
                  "success",
                );

                // Scroll down a bit to show the comparison bar
                setTimeout(() => {
                  window.scrollBy({ top: 100, behavior: "smooth" });
                }, 300);
              } else if (comparisonCount >= 3) {
                showEnhancedToast("❌ يمكنك مقارنة 3 أدوات كحد أقصى", "error");
              }

              function showEnhancedToast(
                text: string,
                type: "success" | "warning" | "error",
              ) {
                const existingToasts =
                  document.querySelectorAll(".comparison-toast");
                existingToasts.forEach((toast) => toast.remove());

                const toast = document.createElement("div");
                const colorClasses = {
                  success: "bg-green-600 border-green-500",
                  warning: "bg-orange-600 border-orange-500",
                  error: "bg-red-600 border-red-500",
                };

                toast.className = `comparison-toast fixed top-4 right-4 left-4 md:right-4 md:left-auto md:w-auto max-w-md ${colorClasses[type]} text-white px-6 py-4 rounded-xl shadow-2xl z-50 font-medium text-sm border-l-4 backdrop-blur-sm`;
                toast.style.transform = "translateY(-100px)";
                toast.style.opacity = "0";

                toast.innerHTML = `
                  <div class="flex items-center justify-between gap-3">
                    <span class="flex-1 text-right">${text}</span>
                    <button onclick="this.parentElement.parentElement.remove()" class="text-white/80 hover:text-white text-lg leading-none">&times;</button>
                  </div>
                `;

                document.body.appendChild(toast);

                // Animate in
                setTimeout(() => {
                  toast.style.transition =
                    "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
                  toast.style.transform = "translateY(0)";
                  toast.style.opacity = "1";
                }, 10);

                // Auto remove after 3 seconds
                setTimeout(() => {
                  if (toast.parentNode) {
                    toast.style.transition = "all 0.3s ease-in-out";
                    toast.style.transform = "translateY(-100px)";
                    toast.style.opacity = "0";
                    setTimeout(() => {
                      if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                      }
                    }, 300);
                  }
                }, 3000);
              }
            }}
            className={`group relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transform transition-all duration-300 border-2 ${isInComparison(comparisonId)
              ? "bg-gradient-to-br from-green-500 to-green-600 border-green-400 text-white shadow-green/40 animate-pulse"
              : "bg-gradient-to-br from-teal to-teal/80 border-teal-400 text-white shadow-teal/30 hover:from-teal-600 hover:to-teal/90 active:scale-95"
              }`}
            title={
              isInComparison(comparisonId) ? "مضاف للمقارنة ✓" : "إضافة للمقارنة"
            }
          >
            {/* Glow effect */}
            <div
              className={`absolute inset-0 rounded-xl blur-sm transition-opacity duration-300 ${isInComparison(comparisonId)
                ? "bg-green-400/60 opacity-80"
                : "bg-teal/40 opacity-0 group-hover:opacity-60"
                }`}
            ></div>

            {/* Icon */}
            <svg
              className="relative w-4 h-4 z-10"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              {isInComparison(comparisonId) ? (
                // Checkmark when added
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              ) : (
                // Compare arrows icon - Two opposing arrows
                <>
                  <path d="M7 14l-3-3 3-3v2h4v2H7v2z" />
                  <path d="M17 10l3 3-3 3v-2h-4v-2h4v-2z" />
                  <circle cx="12" cy="12" r="1" />
                </>
              )}
            </svg>

            {/* Success pulse animation when active */}
            {isInComparison(comparisonId) && (
              <div className="absolute inset-0 rounded-xl bg-green-400 animate-ping opacity-25"></div>
            )}
          </button>
        </div>

        {/* Action Buttons - Top Right Corner */}
        <div className="absolute top-3 right-3 flex gap-1 z-20">
          {/* Share Button */}
          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/outil/${tool.id}`;
              const shareText = `${tool.name} - ${tool.price} درهم/${tool.priceUnit} في ${tool.location}`;

              if (navigator.share) {
                navigator
                  .share({
                    title: tool.name,
                    text: shareText,
                    url: shareUrl,
                  })
                  .catch(() => {
                    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                    showShareMessage();
                  });
              } else {
                navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                showShareMessage();
              }

              function showShareMessage() {
                const message = document.createElement("div");
                message.className =
                  "fixed bottom-4 right-4 bg-orange text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-up";
                message.innerHTML = `
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span>تم نسخ رابط الأداة بنجاح! ✓</span>
                  </div>
                `;
                document.body.appendChild(message);
                setTimeout(() => {
                  if (message.parentNode) {
                    message.parentNode.removeChild(message);
                  }
                }, 3000);
              }
            }}
            className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all duration-200"
            title="مشاركة الأداة"
          >
            <svg
              className="w-3.5 h-3.5 text-gray-600 hover:text-orange"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
            </svg>
          </button>

          {/* Favorite Button */}
          <button
            onClick={() => onToggleFavorite(tool.id)}
            className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
            aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            title={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          >
            <svg
              className={`w-3.5 h-3.5 transition-all duration-200 ${isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-gray-600 hover:text-red-500"}`}
              fill={isFavorite ? "currentColor" : "none"}
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
        </div>

        <LazyImage
          src={tool.image}
          alt={tool.name}
          className={`relative z-10 object-contain mx-auto transition-transform duration-300 hover:scale-105 ${viewMode === "list" ? "w-full h-full" : "w-full h-full"}`}
          placeholder="/placeholder.svg"
        />
      </div>

      {/* Tool Info */}
      <div
        className={`p-3 text-right ${viewMode === "list" ? "flex-1" : "flex-1 flex flex-col"}`}
      >
        <div className="flex-1 space-y-2.5">
          {/* Status and Delivery Info */}
          <div className="flex flex-wrap items-center gap-2 justify-start">
            <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">
              {tool.status}
            </span>
            {tool.hasDelivery && (
              <span className="bg-teal/10 text-teal text-xs font-medium px-2.5 py-1 rounded-full border border-teal/30 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                  <path d="M5 6h5v2H5zm0-2h7v2H5z" />
                </svg>
                توصيل {tool.deliveryPrice ? `${tool.deliveryPrice}د` : "مجاني"}
              </span>
            )}
          </div>

          {/* Tool Name */}
          <div>
            <h3 className="text-dark-blue font-bold text-base leading-tight mb-1">
              {tool.name}
            </h3>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>{tool.location}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-xs leading-snug line-clamp-2">
            {tool.description.length > 65
              ? tool.description.substring(0, 65) + "..."
              : tool.description}
          </p>

          {/* Price - More Prominent */}
          <div className="bg-orange/5 border border-orange/20 rounded-lg p-2">
            <div className="text-orange font-bold text-center">
              <span className="text-xl">{tool.price} درهم</span>
              <span className="text-sm opacity-80"> / {tool.priceUnit}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center text-gray-500 text-xs border-t border-gray-100 pt-2">
            <Link
              to={tool.ownerUserId ? `/fournisseur/${tool.ownerUserId}` : `/profil/${encodeURIComponent(tool.owner)}`}
              className="flex items-center gap-1 hover:text-orange transition-colors group"
              title={`عرض جميع أدوات ${tool.owner}`}
            >
              <svg className="w-3 h-3 group-hover:text-orange transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              <span className="truncate group-hover:text-orange transition-colors">{tool.owner}</span>
            </Link>
            <div className="flex items-center gap-1">
              <span className="font-medium">{tool.rating || 0}</span>
              <svg
                className="w-3 h-3 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-gray-500 text-xs">({tool.reviews || 0} تقييم)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Enhanced UX */}
        <div className="mt-3">
          <Link
            to={`/outil/${tool.id}`}
            className="w-full bg-gradient-to-r from-dark-blue to-dark-blue/90 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-dark-blue/90 hover:to-dark-blue hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-center text-sm block"
          >
            التفاصيل
          </Link>
        </div>
      </div>
    </div>
  );
}

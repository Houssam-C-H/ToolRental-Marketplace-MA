interface ToolCardSkeletonProps {
    viewMode?: "grid" | "list";
}

export default function ToolCardSkeleton({ viewMode = "grid" }: ToolCardSkeletonProps) {
    return (
        <div
            className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${viewMode === "list" ? "flex" : "min-h-[320px] flex flex-col"
                }`}
        >
            {/* Image Skeleton */}
            <div
                className={`relative overflow-hidden bg-gray-200 animate-pulse ${viewMode === "list" ? "w-32 h-20" : "h-32"}`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
            </div>

            {/* Content Skeleton */}
            <div
                className={`p-3 text-right ${viewMode === "list" ? "flex-1" : "flex-1 flex flex-col"}`}
            >
                <div className="flex-1 space-y-2.5">
                    {/* Status and Delivery Info Skeleton */}
                    <div className="flex flex-wrap items-center gap-2 justify-start">
                        <div className="bg-gray-200 h-6 w-20 rounded-full animate-pulse"></div>
                        <div className="bg-gray-200 h-6 w-16 rounded-full animate-pulse"></div>
                    </div>

                    {/* Tool Name Skeleton */}
                    <div>
                        <div className="bg-gray-200 h-5 w-3/4 rounded animate-pulse mb-2"></div>
                        <div className="bg-gray-200 h-3 w-1/2 rounded animate-pulse"></div>
                    </div>

                    {/* Description Skeleton */}
                    <div className="space-y-1">
                        <div className="bg-gray-200 h-3 w-full rounded animate-pulse"></div>
                        <div className="bg-gray-200 h-3 w-2/3 rounded animate-pulse"></div>
                    </div>

                    {/* Price Skeleton */}
                    <div className="bg-gray-200 h-12 w-full rounded-lg animate-pulse"></div>

                    {/* Stats Skeleton */}
                    <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                        <div className="bg-gray-200 h-3 w-20 rounded animate-pulse"></div>
                        <div className="bg-gray-200 h-3 w-16 rounded animate-pulse"></div>
                    </div>
                </div>

                {/* Action Button Skeleton */}
                <div className="mt-3">
                    <div className="bg-gray-200 h-10 w-full rounded-xl animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}



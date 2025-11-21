import React from 'react';

interface OptimizedLoadingProps {
    count?: number;
    type?: 'grid' | 'list' | 'card';
    className?: string;
}

export const OptimizedLoading: React.FC<OptimizedLoadingProps> = ({
    count = 4,
    type = 'grid',
    className = ''
}) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'grid':
                return (
                    <div className="animate-pulse">
                        <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div className="animate-pulse flex items-center space-x-4 p-4">
                        <div className="bg-gray-200 h-16 w-16 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                );

            case 'card':
                return (
                    <div className="animate-pulse">
                        <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const getGridClasses = () => {
        switch (type) {
            case 'grid':
                return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6";
            case 'list':
                return "space-y-4";
            case 'card':
                return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
            default:
                return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6";
        }
    };

    return (
        <div className={`${getGridClasses()} ${className}`}>
            {[...Array(count)].map((_, i) => (
                <div key={i}>
                    {renderSkeleton()}
                </div>
            ))}
        </div>
    );
};

// Loading overlay for better UX
export const LoadingOverlay: React.FC<{
    isLoading: boolean;
    message?: string;
    className?: string;
}> = ({
    isLoading,
    message = "جاري التحميل...",
    className = ""
}) => {
        if (!isLoading) return null;

        return (
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
                <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange"></div>
                    <span className="text-gray-700 font-medium">{message}</span>
                </div>
            </div>
        );
    };

// Progressive loading component
export const ProgressiveLoading: React.FC<{
    isLoading: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    minLoadingTime?: number;
}> = ({
    isLoading,
    children,
    fallback = <OptimizedLoading count={4} type="grid" />,
    minLoadingTime = 500
}) => {
        const [showContent, setShowContent] = React.useState(!isLoading);
        const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);

        React.useEffect(() => {
            if (isLoading) {
                setShowContent(false);
                setMinTimeElapsed(false);

                // Ensure minimum loading time for better UX
                const timer = setTimeout(() => {
                    setMinTimeElapsed(true);
                }, minLoadingTime);

                return () => clearTimeout(timer);
            } else {
                // Only show content after minimum time has elapsed
                if (minTimeElapsed) {
                    setShowContent(true);
                } else {
                    const timer = setTimeout(() => {
                        setMinTimeElapsed(true);
                        setShowContent(true);
                    }, minLoadingTime);

                    return () => clearTimeout(timer);
                }
            }
        }, [isLoading, minTimeElapsed, minLoadingTime]);

        if (isLoading || !showContent) {
            return <>{fallback}</>;
        }

        return <>{children}</>;
    };

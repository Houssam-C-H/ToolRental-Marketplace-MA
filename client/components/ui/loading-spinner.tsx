import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'white' | 'gray';
    className?: string;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
};

const colorClasses = {
    primary: 'text-orange',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'primary',
    className
}) => {
    return (
        <div
            className={cn(
                'animate-spin rounded-full border-2 border-current border-t-transparent',
                sizeClasses[size],
                colorClasses[color],
                className
            )}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};

interface LoadingButtonProps {
    loading: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    title?: string;
}

const buttonSizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
};

const buttonVariantClasses = {
    primary: 'bg-orange hover:bg-orange/90 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-teal hover:bg-teal/90 text-white'
};

export const LoadingButton: React.FC<LoadingButtonProps> = ({
    loading,
    children,
    onClick,
    disabled,
    className,
    size = 'md',
    variant = 'primary',
    title
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            title={title}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                buttonSizeClasses[size],
                buttonVariantClasses[variant],
                className
            )}
        >
            {loading && <LoadingSpinner size="sm" color="white" />}
            {children}
        </button>
    );
};

interface LoadingCardProps {
    loading: boolean;
    children: React.ReactNode;
    className?: string;
    skeleton?: React.ReactNode;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
    loading,
    children,
    className,
    skeleton
}) => {
    if (loading) {
        return (
            <div className={cn('animate-pulse', className)}>
                {skeleton || (
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                )}
            </div>
        );
    }

    return <>{children}</>;
};

interface LoadingOverlayProps {
    loading: boolean;
    children: React.ReactNode;
    message?: string;
    className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    loading,
    children,
    message = "جاري التحميل...",
    className
}) => {
    return (
        <div className={cn('relative', className)}>
            {children}
            {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4">
                        <LoadingSpinner size="xl" color="primary" />
                        <p className="text-gray-600 font-medium">{message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoadingSpinner;

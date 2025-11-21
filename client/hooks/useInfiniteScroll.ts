import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
    hasMore: boolean;
    loading: boolean;
    onLoadMore: () => void;
    threshold?: number;
    rootMargin?: string;
}

export function useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore,
    threshold = 0.1,
    rootMargin = "100px"
}: UseInfiniteScrollOptions) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    onLoadMore();
                }
            },
            {
                threshold,
                rootMargin
            }
        );

        if (node) observerRef.current.observe(node);
    }, [loading, hasMore, onLoadMore, threshold, rootMargin]);

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return { lastElementRef, loadMoreRef };
}



import { useState, useEffect, useRef, useMemo } from "react";

interface VirtualGridProps {
    items: any[];
    itemHeight: number;
    containerHeight: number;
    columns: number;
    gap: number;
    renderItem: (item: any, index: number) => React.ReactNode;
    className?: string;
}

export default function VirtualGrid({
    items,
    itemHeight,
    containerHeight,
    columns,
    gap,
    renderItem,
    className = ""
}: VirtualGridProps) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate visible range
    const visibleRange = useMemo(() => {
        const rowHeight = itemHeight + gap;
        const startIndex = Math.floor(scrollTop / rowHeight) * columns;
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / rowHeight) * columns + columns,
            items.length
        );

        return { startIndex, endIndex };
    }, [scrollTop, itemHeight, gap, columns, containerHeight, items.length]);

    // Get visible items
    const visibleItems = useMemo(() => {
        return items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, index) => ({
            ...item,
            originalIndex: visibleRange.startIndex + index
        }));
    }, [items, visibleRange]);

    // Calculate total height
    const totalHeight = Math.ceil(items.length / columns) * (itemHeight + gap);

    // Handle scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    // Calculate offset for visible items
    const offsetY = Math.floor(visibleRange.startIndex / columns) * (itemHeight + gap);

    return (
        <div
            ref={containerRef}
            className={`overflow-auto ${className}`}
            style={{ height: containerHeight }}
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: "relative" }}>
                <div
                    style={{
                        transform: `translateY(${offsetY}px)`,
                        display: "grid",
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gap: `${gap}px`,
                        padding: `${gap}px`
                    }}
                >
                    {visibleItems.map((item, index) => (
                        <div
                            key={item.id || item.originalIndex}
                            style={{ height: itemHeight }}
                        >
                            {renderItem(item, item.originalIndex)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}



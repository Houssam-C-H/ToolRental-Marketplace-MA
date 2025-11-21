import { useState, useRef, useEffect } from "react";

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholder?: string;
    onLoad?: () => void;
    onError?: () => void;
}

export default function LazyImage({
    src,
    alt,
    className = "",
    placeholder = "/placeholder.svg",
    onLoad,
    onError
}: LazyImageProps) {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin: "50px"
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (isInView && src) {
            const img = new Image();
            img.onload = () => {
                setImageSrc(src);
                setIsLoaded(true);
                onLoad?.();
            };
            img.onerror = () => {
                setImageSrc(placeholder);
                onError?.();
            };
            img.src = src;
        }
    }, [isInView, src, placeholder, onLoad, onError]);

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${!isLoaded ? 'animate-pulse' : ''}`}
            loading="lazy"
        />
    );
}



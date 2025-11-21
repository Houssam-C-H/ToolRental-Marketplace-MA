import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { productsAPI } from '../lib/api';

interface SearchSuggestion {
    id: string;
    name: string;
    category: string;
    city: string;
    price: number;
    image?: string;
}

interface SearchDropdownProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
    onSearch,
    placeholder = "ابحث عن الأدوات...",
    className = ""
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.length >= 2) {
            debounceRef.current = setTimeout(async () => {
                await searchSuggestions(query);
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    const searchSuggestions = async (searchQuery: string) => {
        try {
            setIsLoading(true);
            console.log('🔍 SearchDropdown fetching suggestions for:', searchQuery);

            // Use cached products from main page if available, otherwise fetch
            let products = [];
            try {
                // Try to get from cache first
                const cached = localStorage.getItem('main_page_products');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed.data && parsed.timestamp > Date.now() - (5 * 60 * 1000)) {
                        products = parsed.data.products || [];
                        console.log('🔍 Using cached products for suggestions:', products.length);
                    }
                }
            } catch (e) {
                console.log('🔍 No cached products, fetching fresh...');
            }

            // If no cached products, fetch a small set with minimal fields for speed
            if (products.length === 0) {
                const result = await productsAPI.getApprovedProducts(1, 20, "id, name, category, daily_price, city, neighborhood, images");
                products = result.products || [];

                // Cache the results for next time
                try {
                    localStorage.setItem('main_page_products', JSON.stringify({
                        data: { products },
                        timestamp: Date.now()
                    }));
                } catch (e) {
                    console.warn('Could not cache products:', e);
                }
            }

            // Filter products client-side
            const filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 5); // Only get 5 suggestions

            console.log('🔍 SearchDropdown received suggestions:', {
                count: filteredProducts.length,
                totalProducts: products.length
            });

            const suggestions: SearchSuggestion[] = filteredProducts.map(product => ({
                id: product.id,
                name: product.name,
                category: product.category,
                city: `${product.city}، ${product.neighborhood}`,
                price: product.daily_price,
                image: product.images?.[0]
            }));

            setSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
        } catch (error) {
            console.error('❌ Error fetching suggestions:', error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setSelectedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setQuery(suggestion.name);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        // Use the onSearch callback passed from parent
        onSearch(suggestion.name);
    };

    const handleSearch = () => {
        setShowSuggestions(false);
        // Use the onSearch callback passed from parent
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    const clearSearch = () => {
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        // Only show suggestions if there's a query with at least 2 characters
                        if (query.length >= 2) {
                            setShowSuggestions(true);
                        }
                    }}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pr-12 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-right h-12"
                    dir="rtl"
                />

                {/* Search Icon Button */}
                <button
                    type="button"
                    onClick={handleSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                    <Search className="w-5 h-5 text-gray-400" />
                </button>

                {/* Clear Button */}
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                >
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                            جاري البحث...
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="py-2">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${index === selectedIndex ? 'bg-orange-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {suggestion.image ? (
                                            <img
                                                src={suggestion.image}
                                                alt={suggestion.name}
                                                className="w-12 h-12 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <Search className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 text-right">
                                            <h4 className="font-medium text-gray-900 text-sm">
                                                {suggestion.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {suggestion.category} • {suggestion.city}
                                            </p>
                                            <p className="text-sm font-semibold text-orange-600 mt-1">
                                                {suggestion.price} درهم / اليوم
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Show all results link */}
                            <div className="px-4 py-2 border-t border-gray-100">
                                <button
                                    onClick={handleSearch}
                                    className="w-full text-center text-orange-600 hover:text-orange-700 font-medium text-sm py-2"
                                >
                                    عرض جميع النتائج لـ "{query}"
                                </button>
                            </div>
                        </div>
                    ) : query.length >= 2 ? (
                        <div className="p-4 text-center text-gray-500">
                            <p>لا توجد نتائج لـ "{query}"</p>
                            <button
                                onClick={handleSearch}
                                className="mt-2 text-orange-600 hover:text-orange-700 font-medium"
                            >
                                البحث في جميع المنتجات
                            </button>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;
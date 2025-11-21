import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

interface MinimalSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function MinimalSearch({
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  selectedCategory,
  setSelectedCategory,
}: MinimalSearchProps) {
  const [locationOpen, setLocationOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate('/recherche');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setLocationOpen(false);
        setCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const locations = [
    { value: "", label: "جميع المدن" },
    { value: "sale", label: "سلا" },
    { value: "rabat", label: "الرباط" },
    { value: "temara", label: "تمارة" },
  ];

  const categories = [
    { value: "", label: "جميع الأدوات" },
    { value: "drilling", label: "معدات الحفر" },
    { value: "construction", label: "أدوات البناء" },
    { value: "electrical", label: "الأدوات الكهربائية" },
    { value: "painting", label: "معدات الطلاء" },
    { value: "generators", label: "مولدات ومضخات" },
  ];

  const selectedLocationLabel =
    locations.find((l) => l.value === selectedLocation)?.label || "المدينة";
  const selectedCategoryLabel =
    categories.find((c) => c.value === selectedCategory)?.label || "النوع";

  return (
    <div className="container mx-auto px-4 py-6 md:py-8" ref={searchRef}>
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="bg-white border-2 border-gray-100 rounded-xl shadow-sm overflow-visible">
          {/* Desktop Layout */}
          <div className="hidden lg:flex">
            {/* Search Input */}
            <div className="flex-1 flex items-center">
              <div className="p-4 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="ابحث عن الأدوات..."
                className="flex-1 px-4 py-4 text-right outline-none text-gray-800 placeholder-gray-400 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Location Dropdown */}
            <div className="relative border-r border-gray-100">
              <button
                onClick={() => {
                  setLocationOpen(!locationOpen);
                  setCategoryOpen(false);
                }}
                className="flex items-center gap-2 px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors min-w-[140px]"
              >
                <span>{selectedLocationLabel}</span>
                <svg
                  className={cn(
                    "w-4 h-4 transition-transform text-gray-400",
                    locationOpen ? "rotate-180" : "",
                  )}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>

              {locationOpen && (
                <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {locations.map((location) => (
                    <button
                      key={location.value}
                      onClick={() => {
                        setSelectedLocation(location.value);
                        setLocationOpen(false);
                      }}
                      className={cn(
                        "w-full px-6 py-3 text-right hover:bg-gray-50 transition-colors",
                        selectedLocation === location.value
                          ? "text-orange font-medium bg-orange/5"
                          : "text-gray-700",
                      )}
                    >
                      {location.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative border-r border-gray-100">
              <button
                onClick={() => {
                  setCategoryOpen(!categoryOpen);
                  setLocationOpen(false);
                }}
                className="flex items-center gap-2 px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors min-w-[160px]"
              >
                <span>{selectedCategoryLabel}</span>
                <svg
                  className={cn(
                    "w-4 h-4 transition-transform text-gray-400",
                    categoryOpen ? "rotate-180" : "",
                  )}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>

              {categoryOpen && (
                <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => {
                        setSelectedCategory(category.value);
                        setCategoryOpen(false);
                      }}
                      className={cn(
                        "w-full px-6 py-3 text-right hover:bg-gray-50 transition-colors",
                        selectedCategory === category.value
                          ? "text-orange font-medium bg-orange/5"
                          : "text-gray-700",
                      )}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-orange text-white hover:bg-orange/90 transition-colors font-medium"
            >
              بحث
            </button>
          </div>

          {/* Mobile & Tablet Layout */}
          <div className="lg:hidden">
            {/* Search Input Row */}
            <div className="p-4">
              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                <div className="p-3 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="ابحث عن الأدوات..."
                  className="flex-1 px-3 py-3 text-right outline-none text-gray-800 placeholder-gray-400 text-base bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            {/* Filters Section */}
            <div className="px-4 pb-4 space-y-3">
              {/* Location Dropdown - Mobile */}
              <div className="relative">
                <button
                  onClick={() => {
                    setLocationOpen(!locationOpen);
                    setCategoryOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span className="font-medium">{selectedLocationLabel}</span>
                  </div>
                  <svg
                    className={cn(
                      "w-5 h-5 transition-transform text-gray-400",
                      locationOpen ? "rotate-180" : "",
                    )}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>

                {locationOpen && (
                  <div className="absolute top-full right-0 left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {locations.map((location) => (
                      <button
                        key={location.value}
                        onClick={() => {
                          setSelectedLocation(location.value);
                          setLocationOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-4 text-right hover:bg-gray-50 transition-colors flex items-center gap-3",
                          selectedLocation === location.value
                            ? "text-orange font-medium bg-orange/5"
                            : "text-gray-700",
                        )}
                      >
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <span>{location.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Dropdown - Mobile */}
              <div className="relative">
                <button
                  onClick={() => {
                    setCategoryOpen(!categoryOpen);
                    setLocationOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                    </svg>
                    <span className="font-medium">{selectedCategoryLabel}</span>
                  </div>
                  <svg
                    className={cn(
                      "w-5 h-5 transition-transform text-gray-400",
                      categoryOpen ? "rotate-180" : "",
                    )}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>

                {categoryOpen && (
                  <div className="absolute top-full right-0 left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => {
                          setSelectedCategory(category.value);
                          setCategoryOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-4 text-right hover:bg-gray-50 transition-colors flex items-center gap-3",
                          selectedCategory === category.value
                            ? "text-orange font-medium bg-orange/5"
                            : "text-gray-700",
                        )}
                      >
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                        </svg>
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button - Mobile */}
              <button
                onClick={handleSearch}
                className="w-full px-6 py-4 bg-orange text-white hover:bg-orange/90 transition-colors font-bold text-lg rounded-lg shadow-sm"
              >
                🔍 ابحث الآن
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

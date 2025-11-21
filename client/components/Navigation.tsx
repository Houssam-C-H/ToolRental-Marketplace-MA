import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CategoriesDropdown from "./CategoriesDropdown";
import SearchDropdown from "./SearchDropdown";
import { Search, Filter, Grid, ChevronDown, User, Heart, Plus } from "lucide-react";

interface NavigationProps {
  currentPage?: string;
  showFavoritesCount?: boolean;
  favoritesCount?: number;
}

export default function Navigation({
  currentPage = "",
  showFavoritesCount = true,
  favoritesCount = 0,
}: NavigationProps) {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(".mobile-menu") &&
        !target.closest(".mobile-menu-button")
      ) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMobileMenu]);

  useEffect(() => {
    if (showCategoriesDropdown) {
      setShowMobileMenu(false);
    }
  }, [showCategoriesDropdown]);


  return (
    <>
      {/* Top Banner */}
      <div className="text-white py-2.5 shadow-sm" style={{ backgroundColor: '#FF6A18' }}>
        <div className="container mx-auto px-4">
          <div className="text-center text-sm font-semibold font-arabic">
          منصة ربط رقمية لتأجير أدوات البناء في المغرب 
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b-2 border-gray-200 sticky top-0 bg-white z-40 relative shadow-sm" dir="rtl">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Grid Layout - Two Rows */}
          <div className="grid grid-cols-1">
            {/* Row 1: Main Navigation */}
            <div className="flex items-center justify-between gap-4 lg:gap-6 min-h-[64px] md:min-h-[72px] py-4 md:py-5 lg:py-6">
            {/* Mobile Menu Button - Left side (RTL) */}
            <button
              className="md:hidden p-2 mobile-menu-button focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 rounded-lg"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label={showMobileMenu ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={showMobileMenu}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                ) : (
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                )}
              </svg>
            </button>

            {/* Cluster 1 — Logo (Right) */}
            <div className="flex items-center h-12 flex-shrink-0">
              <Link to="/" className="flex items-center h-full">
                <img
                  src="/logo.png"
                  alt="تأجير - TAEJIR"
                  className="h-12 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Cluster 2 — Search Module (Center) */}
            <div className="hidden lg:flex flex-1 max-w-4xl mx-4 lg:mx-6">
              <div className="flex-1 flex items-center border border-gray-300 rounded-full overflow-hidden bg-white" dir="rtl">
                {/* Search Input - Right side (RTL) */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="ابحث عن الأدوات..."
                    className="w-full px-4 py-2.5 pr-10 border-none outline-none focus:outline-none text-sm font-arabic bg-transparent text-right"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const query = (e.target as HTMLInputElement).value;
                        if (query.trim()) {
                          navigate(`/recherche?q=${encodeURIComponent(query)}`);
                        }
                      }
                    }}
                  />
                  {/* Search icon inside on the right side */}
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
                </div>

                {/* Category Selector (Dropdown) - Left of search input */}
                <div className="border-r border-gray-300 relative">
                  <select className="px-4 py-2.5 pr-8 text-right outline-none focus:outline-none text-sm font-arabic bg-transparent min-w-[140px] border-none appearance-none cursor-pointer">
                    <option value="">كل الفئات</option>
                    <option value="الأدوات الكهربائية">الأدوات الكهربائية</option>
                    <option value="معدات البناء">معدات البناء</option>
                    <option value="معدات الحفر">معدات الحفر</option>
                    <option value="مولدات">مولدات</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 text-gray-400" strokeWidth={2} />
                </div>

                {/* City Selector (Dropdown) - Left of category */}
                <div className="border-r border-gray-300 relative">
                  <select className="px-4 py-2.5 pr-8 text-right outline-none focus:outline-none text-sm font-arabic bg-transparent min-w-[140px] border-none appearance-none cursor-pointer">
                    <option value="">جميع المدن</option>
                    <option value="الرباط">الرباط</option>
                    <option value="سلا">سلا</option>
                    <option value="فاس">فاس</option>
                    <option value="الدار البيضاء">الدار البيضاء</option>
                    <option value="طنجة">طنجة</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 text-gray-400" strokeWidth={2} />
                </div>

                {/* Search Button - Directly to the left of filters, rounded pill shape */}
                <button
                  onClick={() => {
                    const searchInput = document.querySelector('input[placeholder="ابحث عن الأدوات..."]') as HTMLInputElement;
                    if (searchInput?.value.trim()) {
                      navigate(`/recherche?q=${encodeURIComponent(searchInput.value)}`);
                    }
                  }}
                  className="px-6 py-2.5 text-white font-semibold transition-colors flex items-center gap-2 font-arabic border-none outline-none flex-shrink-0 rounded-full"
                  style={{ backgroundColor: '#FF6A18' }}
                >
                  بحث
                </button>
              </div>
            </div>

            {/* Cluster 3 — User Controls (Left) */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              {/* Favorites Icon - Heart outline */}
              <Link
                to="/favoris"
                className="p-2.5 text-gray-500 hover:text-red-500 transition-colors relative rounded-lg hover:bg-gray-50"
                title="المفضلة"
              >
                <Heart
                  className={`w-5 h-5 ${showFavoritesCount && favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''}`}
                  fill={showFavoritesCount && favoritesCount > 0 ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={2}
                />
                {showFavoritesCount && favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* User Icon - Outline style */}
              {!currentUser ? (
                <Link
                  to="/connexion"
                  className="p-2.5 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
                  title="حسابي"
                >
                  <User className="w-5 h-5" strokeWidth={2} />
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="p-2.5 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
                  title="حسابي"
                >
                  <User className="w-5 h-5" strokeWidth={2} />
                </Link>
              )}

              {/* Add Tools Button - Primary CTA, Dark navy, Highest visual priority */}
              <Link
                to="/ajouter-equipement"
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 font-arabic"
                style={{ backgroundColor: '#1F2937' }}
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                أضف أدواتك
              </Link>
            </div>
            </div>

            {/* Row 2: Secondary Navigation Row - Centered */}
            <div className="border-t border-gray-200 py-3 md:py-4 bg-white relative px-4 md:px-6 lg:px-8">
              <div className="flex items-center justify-center" dir="rtl">
                {/* Left Section - Currency and Region (Absolute positioned) */}
                <div className="absolute right-4 flex items-center gap-2 text-sm text-gray-500 font-arabic">
                  <span>المغرب</span>
                  <span className="text-gray-400">/</span>
                  <span>درهم</span>
                </div>

                {/* Central Section - Navigation Menu (Centered) */}
                <nav className="flex items-center gap-8 font-arabic">
                  <Link 
                    to="/outils" 
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
                  >
                    <Grid className="w-4 h-4" />
                    <span>كل الفئات</span>
                  </Link>
                  <Link 
                    to="/outils" 
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
                  >
                    متوفرة للإيجار
                  </Link>
                  <Link 
                    to="/brands" 
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
                  >
                    العلامات التجارية
                  </Link>
                  <Link 
                    to="/a-propos" 
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
                  >
                    من نحن
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer font-medium">
                    <span>المزيد</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Dropdown */}
      {showCategoriesDropdown && (
        <div
          className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50"
          onMouseLeave={() => setShowCategoriesDropdown(false)}
        >
          <CategoriesDropdown
            isOpen={showCategoriesDropdown}
            onClose={() => setShowCategoriesDropdown(false)}
          />
        </div>
      )}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 mobile-menu p-4 space-y-4">
          <Link
            to="/outils"
            className="block py-2 text-gray-700 hover:text-orange"
          >
            كل الفئات
          </Link>
          <Link
            to="/brands"
            className="block py-2 text-gray-700 hover:text-orange"
          >
            العلامات التجارية
          </Link>
          <Link
            to="/a-propos"
            className="block py-2 text-gray-700 hover:text-orange"
          >
            من نحن
          </Link>
          {!currentUser ? (
            <div className="space-y-2 pt-4 border-t">
              <Link to="/connexion" className="block py-2 text-gray-700">
                تسجيل الدخول
              </Link>
              <Link
                to="/inscription"
                className="block py-2 bg-sky-500 hover:bg-sky-600 text-white text-center rounded-lg"
              >
                كن مزود خدمة
              </Link>
            </div>
          ) : (
            <div className="space-y-2 pt-4 border-t">
              <Link to="/ajouter-equipement" className="block py-2 bg-gray-900 hover:bg-gray-800 text-white text-center rounded-lg">
                أضف أداتك
              </Link>
              <Link to="/dashboard" className="block py-2 text-gray-700">
                لوحة التحكم
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}

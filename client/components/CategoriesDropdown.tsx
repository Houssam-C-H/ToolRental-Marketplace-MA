import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const categoriesData = {
  primary: [
    {
      id: 'electrical-handheld',
      name: 'الأدوات الكهربائية اليدوية',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/e3d8e7c5d51c79991fb5574348055ff4532521e7?width=48',
      subcategories: [
        'المثاقب الكهربائية',
        'المناشير الكهربائية',
        'آلات الصنفرة',
        'المطارق الكهربائية'
      ]
    },
    {
      id: 'ladders-scaffolding',
      name: 'السلالم والسقالات',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/02fd06bf781fced05d4e438e903380775eb37b26?width=48',
      subcategories: [
        'سلالم الألومنيوم',
        'سقالات متنقلة',
        'سلالم قابلة للطي',
        'معدات السلامة'
      ]
    },
    {
      id: 'paint-finishing',
      name: 'معدات الطلاء والتشطيبات',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/0b20ea18c7be6ee0e972bf8fed9f7acf0262a986?width=48',
      subcategories: [
        'رشاشات الطلاء',
        'فرش ورولات',
        'خلاطات الطلاء',
        'معدات التنظيف'
      ]
    },
    {
      id: 'hand-tools',
      name: 'الأدوات اليدوية',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/11042a150d8fa5f0ed02e7e590b16241115ec45f?width=48',
      subcategories: [
        'مطارق ومعاول',
        'مفاتيح ومفكات',
        'أدوات القياس',
        'أدوات القطع اليدوية'
      ]
    }
  ]
};

interface CategoriesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onMobileMenuClose?: () => void;
}

export default function CategoriesDropdown({ isOpen, onClose, onMobileMenuClose }: CategoriesDropdownProps) {
  const [selectedCategory, setSelectedCategory] = useState(categoriesData.primary[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Map category IDs to Tools page categories
  const getCategoryUrl = (categoryId: string) => {
    const categoryMap: { [key: string]: string } = {
      'electrical-handheld': 'الأدوات الكهربائية',
      'ladders-scaffolding': 'سلالم وسقالات',
      'paint-finishing': 'معدات الطلاء',
      'hand-tools': 'أدوات يدوية'
    };

    const toolsCategory = categoryMap[categoryId];
    return `/outils${toolsCategory ? `?category=${encodeURIComponent(toolsCategory)}` : ''}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 bg-white border-t-2 border-orange shadow-2xl z-50 mt-0 animate-dropdown-enter"
      dir="rtl"
    >
      <div className="container mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex max-w-6xl mx-auto bg-white rounded-b-lg overflow-hidden shadow-lg">
          {/* Right Panel - Main Categories */}
          <div className="w-1/2 bg-white border-l border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <Link
                  to="/outils"
                  className="text-orange hover:text-orange/80 transition-colors text-sm font-medium"
                  onClick={onClose}
                >
                  عرض الكل ←
                </Link>
                <h3 className="text-dark-blue font-bold text-lg">
                  الفئات الأساسية للمنصة
                </h3>
              </div>
              <div className="space-y-2">
                {categoriesData.primary.map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-center justify-end gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200 ${selectedCategory.id === category.id
                        ? 'bg-orange/10 text-dark-blue border border-orange/20'
                        : 'hover:bg-gray-50 text-gray-700 hover:text-dark-blue'
                      }`}
                    onMouseEnter={() => setSelectedCategory(category)}
                  >
                    <span className="font-medium text-sm">
                      {category.name}
                    </span>
                    <div className={`p-2 rounded-lg ${selectedCategory.id === category.id ? 'bg-orange/20' : 'bg-gray-100'}`}>
                      <img
                        src={category.icon}
                        alt={category.name}
                        className="w-5 h-5 flex-shrink-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Left Panel - Subcategories */}
          <div className="w-1/2 bg-cream/50">
            <div className="p-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-dark-blue font-bold text-lg text-right mb-2">
                  {selectedCategory.name}
                </h3>
                <p className="text-gray-600 text-sm text-right">
                  اختر الفئة الفرعية المناسبة لاحتياجاتك
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {selectedCategory.subcategories.map((subcategory, index) => (
                  <Link
                    key={index}
                    to={getCategoryUrl(selectedCategory.id)}
                    className="text-right p-3 rounded-lg bg-white hover:bg-orange/10 border border-gray-100 hover:border-orange/20 transition-all duration-200 group"
                    onClick={onClose}
                  >
                    <div className="flex items-center justify-between">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-orange transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-gray-700 group-hover:text-dark-blue font-medium text-sm">
                        {subcategory}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* View Category Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  to={getCategoryUrl(selectedCategory.id)}
                  className="bg-dark-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-dark-blue/90 transition-colors block text-center text-sm"
                  onClick={onClose}
                >
                  عرض جميع {selectedCategory.name}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Version */}
        <div className="md:hidden bg-white">
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-orange scrollbar-track-gray-100">
            <div className="p-4 space-y-4">
              <div className="text-center pb-4 border-b border-gray-200">
                <h3 className="text-dark-blue font-bold text-lg mb-2">
                  الفئات الأساسية للمنصة
                </h3>
                <p className="text-gray-600 text-sm">
                  اختر الفئة المناسبة لاحتياجاتك
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {categoriesData.primary.map((category, index) => (
                  <div key={category.id} className="bg-gray-50 rounded-xl overflow-hidden">
                    <Link
                      to={getCategoryUrl(category.id)}
                      className="flex items-center justify-between p-4 hover:bg-orange/10 transition-colors"
                      onClick={onClose}
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-dark-blue font-medium text-sm">
                            {category.name}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {category.subcategories.length} فئة فرعية
                          </div>
                        </div>
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <img
                            src={category.icon}
                            alt={category.name}
                            className="w-6 h-6 flex-shrink-0"
                          />
                        </div>
                      </div>
                    </Link>

                    {/* Top subcategories preview */}
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-2 gap-2">
                        {category.subcategories.slice(0, 4).map((subcategory, subIndex) => (
                          <Link
                            key={subIndex}
                            to={getCategoryUrl(category.id)}
                            className="text-center p-2 bg-white rounded-lg border border-gray-200 hover:border-orange hover:bg-orange/5 transition-colors"
                            onClick={onClose}
                          >
                            <span className="text-gray-700 text-xs font-medium">
                              {subcategory}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link
                  to="/outils"
                  className="bg-orange text-white px-6 py-4 rounded-xl font-medium hover:bg-orange/90 transition-colors block text-center shadow-md"
                  onClick={onClose}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                    </svg>
                    <span>عرض جميع الفئات</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

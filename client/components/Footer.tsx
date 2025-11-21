import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { categoriesAPI, Category } from '../lib/api';

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await categoriesAPI.getCategories();
        // Filter only active categories and sort by display_order (same as dashboard)
        // This ensures footer categories match exactly what's in the dashboard
        const activeCategories = categoriesData
          .filter(cat => cat.is_active !== false)
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        // Show all active categories from dashboard
        setCategories(activeCategories);
      } catch (error) {
        console.error('Error loading categories for footer:', error);
        // Fallback to empty array on error
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <footer className="bg-dark-blue text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center md:text-right lg:col-span-1">
            <img
              src="/logo.png"
              alt="منصة تأجير الأدوات - سلا والرباط"
              className="h-10 md:h-12 mb-4 brightness-0 invert mx-auto md:mx-0"
            />
            <p className="text-gray-200 text-sm leading-relaxed">
              منصة رقمية تربط مالكي الأدوات بالمستأجرين في المغرب.
              نركز على سلا والرباط ونعمل كوسيط رقمي فقط.
            </p>
          </div>

          <div className="text-center md:text-right">
            <h4 className="text-lg font-bold mb-4 text-teal">صفحات مهمة</h4>
            <ul className="space-y-2 text-gray-200">
              <li><Link to="/a-propos" className="hover:text-teal transition-colors">من نحن</Link></li>
              <li><Link to="/outils" className="hover:text-teal transition-colors">تصفح الأدوات</Link></li>
              <li><Link to="/a-propos#contact" className="hover:text-teal transition-colors">اتصل بنا</Link></li>
              <li><Link to="/politique-confidentialite" className="hover:text-teal transition-colors">سياسة الخصوصية</Link></li>
              <li><Link to="/conditions-utilisation" className="hover:text-teal transition-colors">شروط الاستخدام</Link></li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <h4 className="text-lg font-bold mb-4 text-teal">الفئات الرئيسية</h4>
            {loading ? (
              <ul className="space-y-2 text-gray-200">
                <li className="animate-pulse">جاري التحميل...</li>
              </ul>
            ) : categories.length > 0 ? (
              <ul className="space-y-2 text-gray-200">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      to={`/categorie/${encodeURIComponent(category.name)}`} 
                      className="hover:text-teal transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2 text-gray-200">
                <li>لا توجد فئات متاحة</li>
              </ul>
            )}
          </div>

          <div className="text-center md:text-right">
            <h4 className="text-lg font-bold mb-4 text-teal">تواصل معنا</h4>
            <div className="space-y-3 text-gray-200 text-sm">
              <div className="flex items-center justify-center md:justify-end gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                <span className="text-sm">+212 6XX XXX XXX</span>
              </div>
              <div className="flex items-center justify-center md:justify-end gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span className="text-sm">contact@toolsrental.ma</span>
              </div>
              <div className="flex items-center justify-center md:justify-end gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="text-sm">الرباط وسلا، المغرب</span>
              </div>

              {/* Social Media */}
              <div className="flex justify-center md:justify-end gap-4 mt-4">
                <a href="https://wa.me/212XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.479 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                </a>
                <a href="https://twitter.com/toolsrental" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-teal rounded-full flex items-center justify-center hover:bg-teal/80 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://facebook.com/toolsrental" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-teal rounded-full flex items-center justify-center hover:bg-teal/80 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-orange/20 border-2 border-orange/30 rounded-xl p-6 mt-8">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11M12,9A1,1 0 0,1 11,8A1,1 0 0,1 12,7A1,1 0 0,1 13,8A1,1 0 0,1 12,9Z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-teal mb-2">تنبيه مهم للمستخدمين</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                هذه المنصة تعمل كوسيط إلكتروني فقط. نحن لا نتحمل مسؤولية جودة الأدوات أو أي نزاعات قد تنشأ.
                يُنصح بفحص الأدوات والاتفاق على الشروط مسبقاً. استخدم المنصة بمسؤوليتك الشخصية.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center text-gray-300 text-sm">
              <p>&copy; 2024 منصة تأجير الأدوات المغربية. جميع الحقوق محفوظة.</p>
              <p className="mt-1">منصة رقمية مغربية مرخصة • سلا والرباط</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 text-gray-300 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
                </svg>
                <span>معاملات آمنة</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-teal" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,9H13V7H11M11,17H13V11H11V17Z" />
                </svg>
                <span>دعم مستمر</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>خدمة موثوقة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

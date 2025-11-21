import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock data for tools (same as in Index)
const allTools = [
  {
    id: 1,
    name: 'مثقاب كهربائي بوش',
    description: 'مناسب لجميع انواع الحفر',
    price: 100,
    priceUnit: 'اليوم',
    location: 'الرباط , المدينة القديمة',
    category: 'معدات الحفر',
    condition: 'مستعمل',
    status: 'للايجار',
    owner: 'مجاهد النجار',
    rating: 4.8,
    reviews: 1000,
    lastSeen: 'ساعتان',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/6b567352cd6290cf151bdb707f4089668212d300?width=244'
  },
  {
    id: 2,
    name: 'منشار كهربائي ديوالت',
    description: 'قطع دقيق للخشب والمعادن',
    price: 80,
    priceUnit: 'اليوم',
    location: 'الدار البيضاء , المعاريف',
    category: 'أدوات القطع',
    condition: 'جديد',
    status: 'للايجار',
    owner: 'أحمد الحسني',
    rating: 4.9,
    reviews: 850,
    lastSeen: 'ساعة واحدة',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/8f801032aeb3bf5392e41f9f39bb16158cd4febf?width=244'
  },
  {
    id: 3,
    name: 'مولد كهربائي هوندا',
    description: 'طاقة موثوقة للمواقع البعيدة',
    price: 200,
    priceUnit: 'اليوم',
    location: 'فاس , المدينة الجديدة',
    category: 'مولدات',
    condition: 'مستعمل',
    status: 'للايجار',
    owner: 'يوسف التازي',
    rating: 4.7,
    reviews: 720,
    lastSeen: '3 ساعات',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/2893ad07c734518a4f6dbcfbc870a1bd75b433ae?width=244'
  },
  {
    id: 4,
    name: 'خلاط إسمنت صغير',
    description: 'مثالي للمشاريع الصغيرة والمتوسطة',
    price: 120,
    priceUnit: 'اليوم',
    location: 'مراكش , جليز',
    category: 'معدات الخلط',
    condition: 'جديد',
    status: 'للايجار',
    owner: 'عبد الله المراكشي',
    rating: 4.8,
    reviews: 650,
    lastSeen: '30 دقيقة',
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/6b567352cd6290cf151bdb707f4089668212d300?width=244'
  }
];

export default function Favorites() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoriteTools, setFavoriteTools] = useState<typeof allTools>([]);

  useEffect(() => {
    // Load favorites from localStorage
    const saved = localStorage.getItem('tool-favorites');
    const favoriteIds = saved ? JSON.parse(saved) : [];
    setFavorites(favoriteIds);

    // Filter tools to show only favorites
    const favTools = allTools.filter(tool => favoriteIds.includes(tool.id));
    setFavoriteTools(favTools);
  }, []);

  const removeFavorite = (toolId: number) => {
    const newFavorites = favorites.filter(id => id !== toolId);
    setFavorites(newFavorites);
    localStorage.setItem('tool-favorites', JSON.stringify(newFavorites));

    // Update the displayed tools
    const favTools = allTools.filter(tool => newFavorites.includes(tool.id));
    setFavoriteTools(favTools);
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    setFavoriteTools([]);
    localStorage.removeItem('tool-favorites');
  };

  return (
    <div className="min-h-screen bg-white font-arabic" dir="rtl">
      {/* Header */}
      <header className="border-b-2 border-gray-200 py-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="شعار منصة تأجير الأدوات"
                className="h-8 md:h-12"
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link to="/" className="text-dark-blue hover:text-orange transition-colors text-sm lg:text-base">الرئيسية</Link>
              <Link to="/outils" className="text-dark-blue hover:text-orange transition-colors text-sm lg:text-base">الادوات</Link>
              <Link to="/blog" className="text-dark-blue hover:text-orange transition-colors text-sm lg:text-base">المدونة</Link>
              <Link to="/contact" className="text-dark-blue hover:text-orange transition-colors text-sm lg:text-base">الاتصال</Link>
              <Link to="/a-propos" className="text-dark-blue hover:text-orange transition-colors text-sm lg:text-base">من نحن</Link>
            </nav>

            {/* Add Equipment & Favorites */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative">
                <Link to="/favoris">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-orange hover:text-orange/80 cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </div>
              <Link
                to="/ajouter-equipement"
                className="bg-dark-blue text-white px-2 md:px-4 lg:px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2 text-xs md:text-sm lg:text-base"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                <span className="hidden sm:inline">أضف معداتك</span>
                <span className="sm:hidden">أضف</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-dark-blue">
              الأدوات المفضلة
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            جميع الأدوات التي أضفتها إلى قائمة المفضلة الخاصة بك
          </p>
        </div>

        {/* Favorites Actions */}
        {favoriteTools.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={clearAllFavorites}
              className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
              <span>مسح جميع المفضلة</span>
            </button>
            <div className="text-gray-600 text-sm">
              {favoriteTools.length} أداة في المفضلة
            </div>
          </div>
        )}

        {/* Favorites Grid */}
        {favoriteTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {favoriteTools.map((tool) => (
              <div key={tool.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                {/* Tool Image */}
                <div className="relative bg-gray-50 h-40 md:h-48 p-4">
                  <button
                    onClick={() => removeFavorite(tool.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-red-500 hover:bg-red-50 transition-colors z-10"
                  >
                    <svg className="w-4 h-4 fill-red-500 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <img
                    src={tool.image}
                    alt={tool.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-contain mx-auto"
                  />
                </div>

                {/* Tool Info */}
                <div className="p-4 text-right space-y-3">
                  {/* Tags */}
                  <div className="flex justify-end gap-2 flex-wrap">
                    <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full border border-green-200">
                      {tool.status}
                    </span>
                    <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {tool.condition}
                    </span>
                    <span className="bg-orange/10 text-orange text-xs px-2 py-1 rounded-full">
                      {tool.category}
                    </span>
                  </div>

                  {/* Location & Share */}
                  <div className="flex justify-between items-center">
                    <svg className="w-5 h-5 text-gray-400 hover:text-orange cursor-pointer transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <span>{tool.location}</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                    </div>
                  </div>

                  {/* Tool Name */}
                  <h3 className="text-dark-blue font-bold text-base md:text-lg">{tool.name}</h3>

                  {/* Description */}
                  <p className="text-gray-500 text-sm">{tool.description}</p>

                  {/* Price */}
                  <div className="text-orange font-bold">
                    <span className="text-lg">{tool.price} درهم</span>
                    <span className="text-sm"> / {tool.priceUnit}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-end items-center gap-4 text-gray-500 text-xs md:text-sm">
                    <div className="flex items-center gap-1">
                      <span>{tool.lastSeen}</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
                      </svg>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                      <span>{tool.reviews}</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                      <span>{tool.owner}</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                      </svg>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/outil/${tool.id}`}
                      className="flex-1 bg-dark-blue text-white py-3 rounded-lg font-medium hover:bg-dark-blue/90 transition-colors text-center block"
                    >
                      عرض التفاصيل
                    </Link>
                    <button className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-teal/5">
            <div className="w-24 h-24 mx-auto mb-6 bg-orange rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              لا توجد أدوات مفضلة بعد
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              ابدأ بإضافة الأدوات التي تعجبك إلى المفضلة عن طريق النقر على أيقونة القلب
            </p>
            <Link
              to="/"
              className="bg-orange text-white px-6 py-3 rounded-lg font-medium hover:bg-orange/90 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <span>تصفح الأدوات</span>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-dark-blue text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center md:text-right lg:col-span-1">
              <img
                src="/logo.png"
                alt="شعار منصة تأجير الأدوات"
                className="h-10 md:h-12 mb-4 brightness-0 invert mx-auto md:mx-0"
              />
              <p className="text-gray-300 text-sm leading-relaxed">
                منصة لتأجير أدوات البناء والبريكولاج بالمغرب. نربط بين أصحاب الأدوات والباحثين عن معدات مناسبة لمشاريعهم.
              </p>
            </div>

            <div className="text-center md:text-right">
              <h4 className="text-lg font-bold mb-4">روابط مفيدة</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/a-propos" className="hover:text-teal transition-colors">من نحن</Link></li>
                <li><Link to="/contact" className="hover:text-teal transition-colors">اتصل بنا</Link></li>
                <li><Link to="/politique-confidentialite" className="hover:text-teal transition-colors">سياسة الخصوصية</Link></li>
                <li><Link to="/conditions-utilisation" className="hover:text-teal transition-colors">شروط الاستخدام</Link></li>
              </ul>
            </div>

            <div className="text-center md:text-right">
              <h4 className="text-lg font-bold mb-4">الفئات</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/categorie/drilling" className="hover:text-teal transition-colors">معدات الحفر</Link></li>
                <li><Link to="/categorie/construction" className="hover:text-teal transition-colors">أدوات البناء</Link></li>
                <li><Link to="/categorie/electrical" className="hover:text-teal transition-colors">الأدوات الكهربائية</Link></li>
                <li><Link to="/categorie/mechanical" className="hover:text-teal transition-colors">الأدوات الميكانيكية</Link></li>
              </ul>
            </div>

            <div className="text-center md:text-right">
              <h4 className="text-lg font-bold mb-4">تواصل معنا</h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center justify-center md:justify-end gap-2">
                  <span className="text-sm">+212 6XX XXX XXX</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </div>
                <div className="flex items-center justify-center md:justify-end gap-2">
                  <span className="text-sm">contact@toolsrental.ma</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <div className="flex items-center justify-center md:justify-end gap-2">
                  <span className="text-sm">الرباط، المغرب</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 منصة تأجير الأدوات. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

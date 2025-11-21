import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { generateBreadcrumbSchema } from '../lib/schemaGenerator';

const allCategories = [
  {
    id: 'electrical-handheld',
    name: 'الأدوات الكهربائية',
    toolsPageCategory: 'الأدوات الكهربائية',
    description: 'مثاقب، مناشير، آلات صنفرة',
    icon: 'https://api.builder.io/api/v1/image/assets/TEMP/e3d8e7c5d51c79991fb5574348055ff4532521e7?width=48',
    toolsCount: 45,
  },
  {
    id: 'ladders-scaffolding',
    name: 'السلالم والسقالات',
    toolsPageCategory: 'سلالم وسقالات',
    description: 'سلالم ألومنيوم، سقالات متنقلة',
    icon: 'https://api.builder.io/api/v1/image/assets/TEMP/02fd06bf781fced05d4e438e903380775eb37b26?width=48',
    toolsCount: 28,
  },
  {
    id: 'paint-finishing',
    name: 'معدات الطلاء',
    description: 'رشاشات، فرش، رولات طلاء',
    icon: 'https://api.builder.io/api/v1/image/assets/TEMP/0b20ea18c7be6ee0e972bf8fed9f7acf0262a986?width=48',
    toolsCount: 32,
  },
  {
    id: 'hand-tools',
    name: 'الأدوات اليدوية',
    description: 'مطارق، مفاتيح، مفكات',
    icon: 'https://api.builder.io/api/v1/image/assets/TEMP/11042a150d8fa5f0ed02e7e590b16241115ec45f?width=48',
    toolsCount: 67,
  },
  {
    id: 'heavy-machinery',
    name: 'المعدات الثقيلة',
    description: 'حفارات، رافعات، معدات بناء',
    icon: 'https://api.builder.io/api/v1/image/assets/TEMP/2893ad07c734518a4f6dbcfbc870a1bd75b433ae?width=48',
    toolsCount: 15,
  },
  {
    id: 'generators-compressors',
    name: 'المولدات والضواغط',
    description: 'مولدات كهربائية، ضواغط هواء',
    icon: 'https://api.builder.io/api/v1/image/assets/TEMP/6b567352cd6290cf151bdb707f4089668212d300?width=48',
    toolsCount: 22,
  },
  {
    id: 'concrete-tools',
    name: 'معدات الخرسانة',
    description: 'خلاطات إسمنت، منشر خرسانة',
    icon: 'https://api.builder.io/api/v1/image/assets/TEMP/8f801032aeb3bf5392e41f9f39bb16158cd4febf?width=48',
    toolsCount: 19,
  },
  {
    id: 'safety-equipment',
    name: 'معدات السلامة',
    description: 'خوذات أمان، أحزمة سلامة',
    icon: 'https://api.builder.io/api/v1/image/assets/TEMP/e3d8e7c5d51c79991fb5574348055ff4532521e7?width=48',
    toolsCount: 38,
  }
];

export default function Categories() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Map category IDs to Tools page categories
  const getCategoryUrl = (categoryId: string) => {
    const categoryMap: { [key: string]: string } = {
      'electrical-handheld': 'الأدوات الكهربائية',
      'ladders-scaffolding': 'سلالم وسقالات',
      'paint-finishing': 'معدات الطلاء',
      'hand-tools': 'أدوات يدوية',
      'heavy-machinery': 'معدات البناء',
      'generators-compressors': 'مولدات',
      'concrete-tools': 'معدات الخلط',
      'safety-equipment': 'معدات الحفر'
    };

    const toolsCategory = categoryMap[categoryId];
    return `/outils?category=${encodeURIComponent(toolsCategory)}`;
  };

  const filteredCategories = allCategories.filter(category =>
    category.name.includes(searchQuery) ||
    category.description.includes(searchQuery)
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'الرئيسية', url: '/' },
    { name: 'الفئات', url: '/categories' },
  ]);

  return (
    <div className="min-h-screen bg-white font-arabic" dir="rtl">
      <SEOHead
        title="فئات الأدوات | تصفح جميع الفئات | منصة تأجير الأدوات"
        description="اكتشف مجموعة شاملة من فئات الأدوات والمعدات للإيجار في المغرب. أدوات كهربائية، معدات بناء، مولدات، وأكثر. احجز الآن!"
        url={location.pathname}
        type="website"
        schema={breadcrumbSchema}
      />
      <Navigation currentPage="categories" />

      {/* Page Header */}
      <div className="bg-white border-b py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-dark-blue mb-4">
            فئات الأدوات
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            اكتشف مجموعة شاملة من فئات الأدوات والمعدات
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="البحث عن الفئات..."
              className="w-full px-6 py-4 text-right border border-gray-200 rounded-xl outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 transition-colors text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredCategories.map((category) => (
            <Link
              key={category.id}
              to={getCategoryUrl(category.id)}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-orange transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="text-center mb-4">
                <img
                  src={category.icon}
                  alt={category.name}
                  className="w-16 h-16 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                />
                <h3 className="text-xl font-bold text-dark-blue group-hover:text-orange transition-colors">
                  {category.name}
                </h3>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-center text-sm mb-4 leading-relaxed">
                {category.description}
              </p>

              {/* Count */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-orange/10 text-orange px-4 py-2 rounded-lg">
                  <span className="font-bold text-lg">{category.toolsCount}</span>
                  <span className="text-sm">أداة</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              لم يتم العثور على نتائج
            </h3>
            <p className="text-gray-500">
              جرب البحث بكلمات مختلفة
            </p>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange mb-2">
                {allCategories.length}
              </div>
              <div className="text-gray-600 font-medium">فئة رئيسية</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange mb-2">
                {allCategories.reduce((total, cat) => total + cat.toolsCount, 0)}+
              </div>
              <div className="text-gray-600 font-medium">أداة متاحة</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange mb-2">
                500+
              </div>
              <div className="text-gray-600 font-medium">مالك أداة</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange mb-2">
                24/7
              </div>
              <div className="text-gray-600 font-medium">دعم فني</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

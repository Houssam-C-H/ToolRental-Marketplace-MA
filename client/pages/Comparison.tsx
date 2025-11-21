import { Link, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useComparison } from '../contexts/ComparisonContext';
import { SEOHead } from '../components/SEOHead';
import { generateBreadcrumbSchema } from '../lib/schemaGenerator';

export default function Comparison() {
  const location = useLocation();
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'الرئيسية', url: '/' },
    { name: 'مقارنة الأدوات', url: '/comparateur' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
      <SEOHead
        title="مقارنة الأدوات | قارن بين الأدوات المختلفة | منصة تأجير الأدوات"
        description="قارن بين الأدوات المختلفة لاختيار الأنسب لمشروعك من ناحية السعر والجودة والموقع. مقارنة شاملة وسهلة."
        url={location.pathname}
        type="website"
        schema={breadcrumbSchema}
      />
      <Navigation currentPage="comparison" />

      {/* Breadcrumb */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-orange transition-colors">
              الرئيسية
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7"/>
            </svg>
            <span className="text-orange font-medium">مقارنة الأدوات</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <section className="container mx-auto px-4 py-4 md:py-8">
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-dark-blue mb-2 md:mb-4">
            مقارنة الأدوات
          </h1>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">
            قارن بين الأدوات المختلفة لاختيار الأنسب لمشروعك من ناحية السعر والجودة والموقع
          </p>
        </div>
      </section>

      {/* Comparison Content */}
      <section className="container mx-auto px-4 pb-4 md:pb-8">
        {comparisonList.length > 0 ? (
          <div className="space-y-4 md:space-y-8">
            {/* Comparison Header */}
            <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-orange/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-orange" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-dark-blue">
                      مقارنة {comparisonList.length} أدوات
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600">
                      يمكنك مقارنة حتى 3 أدوات في نفس الوقت
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearComparison}
                  className="bg-red-50 text-red-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-red-200 hover:bg-red-100 transition-colors font-medium text-xs md:text-sm"
                >
                  مسح الكل
                </button>
              </div>
            </div>

            {/* Comparison Table - Desktop/Tablet View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-right py-4 px-6 font-semibold text-dark-blue w-40">المقارنة</th>
                      {comparisonList.map((tool) => (
                        <th key={tool.id} className="text-center py-4 px-4 min-w-[280px]">
                          <div className="relative">
                            <button
                              onClick={() => removeFromComparison(tool.id)}
                              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors z-10 flex items-center justify-center"
                              title="إزالة من المقارنة"
                            >
                              ×
                            </button>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <img
                                src={tool.image}
                                alt={tool.name}
                                className="w-24 h-24 object-contain mx-auto mb-3 rounded-lg"
                              />
                              <h4 className="font-bold text-dark-blue leading-tight mb-2">
                                {tool.name}
                              </h4>
                              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                <span>{tool.location}</span>
                              </div>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Price Row */}
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 15h7v2H7zm0-4h10v2H7zm0-4h10v2H7zm-4 6h2v-2H3v2zm0-4h2V7H3v2zm0-4h2V3H3v2z"/>
                          </svg>
                          السعر
                        </div>
                      </td>
                      {comparisonList.map((tool) => (
                        <td key={tool.id} className="text-center py-4 px-4">
                          <div className="bg-orange/5 border border-orange/20 rounded-lg p-3">
                            <div className="text-orange font-bold text-lg">
                              {tool.price} درهم
                            </div>
                            <div className="text-sm text-gray-600">
                              لكل {tool.priceUnit}
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Condition Row */}
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11M12,9A1,1 0 0,1 11,8A1,1 0 0,1 12,7A1,1 0 0,1 13,8A1,1 0 0,1 12,9Z"/>
                          </svg>
                          الحالة
                        </div>
                      </td>
                      {comparisonList.map((tool) => (
                        <td key={tool.id} className="text-center py-4 px-4">
                          <span className="inline-block bg-teal/10 text-teal px-3 py-1 rounded-full text-sm font-medium border border-teal/30">
                            {tool.condition}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Rating Row */}
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          التقييم
                        </div>
                      </td>
                      {comparisonList.map((tool) => (
                        <td key={tool.id} className="text-center py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                              <span className="font-semibold text-dark-blue">{tool.rating}</span>
                            </div>
                            <span className="text-gray-500 text-sm">({tool.reviews} تقييم)</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Delivery Row */}
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3,8L12,14L21,8"/>
                          </svg>
                          التوصيل
                        </div>
                      </td>
                      {comparisonList.map((tool) => (
                        <td key={tool.id} className="text-center py-4 px-4">
                          {tool.hasDelivery ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                              <div className="text-green-700 font-medium text-sm">✓ متاح</div>
                              {tool.deliveryPrice && (
                                <div className="text-xs text-green-600 mt-1">
                                  {tool.deliveryPrice} درهم
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">غير متاح</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Owner Row */}
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                          </svg>
                          المالك
                        </div>
                      </td>
                      {comparisonList.map((tool) => (
                        <td key={tool.id} className="text-center py-4 px-4">
                          <div className="text-gray-700 font-medium text-sm">
                            {tool.owner}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            نشط قبل {tool.lastSeen}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Actions Row */}
                    <tr>
                      <td className="py-4 px-6 font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-dark-blue" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                          </svg>
                          الإجراءات
                        </div>
                      </td>
                      {comparisonList.map((tool) => (
                        <td key={tool.id} className="text-center py-4 px-4">
                          <div className="space-y-2">
                            <Link
                              to={`/outil/${tool.id}`}
                              className="block w-full bg-gradient-to-r from-dark-blue to-dark-blue/90 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:from-dark-blue/90 hover:to-dark-blue hover:shadow-lg transition-all duration-200"
                            >
                              عرض التفاصيل
                            </Link>
                            <button
                              onClick={() => {
                                const message = `مرحباً، أود الاستفسار عن ${tool.name} - ${tool.price} درهم/${tool.priceUnit}`;
                                window.open(`https://wa.me/212600000000?text=${encodeURIComponent(message)}`, '_blank');
                              }}
                              className="block w-full bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              تواصل واتساب
                            </button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Cards View */}
            <div className="lg:hidden space-y-3">
              {comparisonList.map((tool, index) => (
                <div key={tool.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Tool Header - Compact */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 relative">
                    <button
                      onClick={() => removeFromComparison(tool.id)}
                      className="absolute top-2 left-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center z-10"
                      title="إزالة من المقارنة"
                    >
                      ×
                    </button>
                    <div className="flex items-center gap-3">
                      <img
                        src={tool.image}
                        alt={tool.name}
                        className="w-14 h-14 object-contain rounded-lg bg-white p-1.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-orange text-white px-2 py-0.5 rounded-full text-xs font-medium inline-block mb-1">
                          #{index + 1}
                        </div>
                        <h3 className="font-bold text-dark-blue text-sm leading-tight mb-0.5 truncate">
                          {tool.name.length > 40 ? tool.name.substring(0, 40) + '...' : tool.name}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          <span className="truncate">{tool.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tool Details - Compact */}
                  <div className="p-3 space-y-3">
                    {/* Price - Compact */}
                    <div className="bg-orange/5 border border-orange/20 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-orange" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 15h7v2H7zm0-4h10v2H7zm0-4h10v2H7zm-4 6h2v-2H3v2zm0-4h2V7H3v2zm0-4h2V3H3v2z"/>
                          </svg>
                          <span className="font-semibold text-gray-700 text-xs">السعر</span>
                        </div>
                        <div className="text-left">
                          <div className="text-orange font-bold text-lg leading-none">
                            {tool.price} درهم
                          </div>
                          <div className="text-xs text-gray-600">
                            / {tool.priceUnit}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid - Compact */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Condition */}
                      <div className="bg-teal/10 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <svg className="w-3 h-3 text-teal" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11M12,9A1,1 0 0,1 11,8A1,1 0 0,1 12,7A1,1 0 0,1 13,8A1,1 0 0,1 12,9Z"/>
                          </svg>
                          <span className="font-medium text-gray-700 text-xs">الحالة</span>
                        </div>
                        <span className="bg-teal/10 text-teal px-2 py-0.5 rounded-full text-xs font-medium">
                          {tool.condition}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="bg-yellow-50/50 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className="font-medium text-gray-700 text-xs">التقييم</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-dark-blue text-sm">{tool.rating}</span>
                          <span className="text-gray-500 text-xs">({tool.reviews})</span>
                        </div>
                      </div>

                      {/* Delivery */}
                      <div className="bg-green-50/50 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3,8L12,14L21,8"/>
                          </svg>
                          <span className="font-medium text-gray-700 text-xs">التوصيل</span>
                        </div>
                        {tool.hasDelivery ? (
                          <div>
                            <div className="text-green-700 font-medium text-xs">✓ متاح</div>
                            {tool.deliveryPrice && (
                              <div className="text-xs text-green-600">
                                {tool.deliveryPrice}د
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">غير متاح</span>
                        )}
                      </div>

                      {/* Owner */}
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                          </svg>
                          <span className="font-medium text-gray-700 text-xs">المالك</span>
                        </div>
                        <div className="text-gray-700 font-medium text-xs truncate">
                          {tool.owner.length > 15 ? tool.owner.substring(0, 15) + '...' : tool.owner}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tool.lastSeen}
                        </div>
                      </div>
                    </div>

                    {/* Actions - Compact */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/outil/${tool.id}`}
                          className="bg-gradient-to-r from-dark-blue to-dark-blue/90 text-white py-2 px-3 rounded-lg text-xs font-medium hover:from-dark-blue/90 hover:to-dark-blue hover:shadow-lg transition-all duration-200 text-center"
                        >
                          التفاصيل
                        </Link>
                        <button
                          onClick={() => {
                            const message = `مرحباً، أود الاستفسار عن ${tool.name} - ${tool.price} درهم/${tool.priceUnit}`;
                            window.open(`https://wa.me/212600000000?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                          className="bg-green-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          واتساب
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-teal/10 to-teal/20 border border-teal/30 rounded-lg md:rounded-xl p-3 md:p-6">
              <div className="flex items-start gap-2 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-teal" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11M12,9A1,1 0 0,1 11,8A1,1 0 0,1 12,7A1,1 0 0,1 13,8A1,1 0 0,1 12,9Z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-lg font-bold text-teal mb-2 md:mb-3">
                    💡 نصائح للمقارنة الفعالة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-teal">
                    <div className="flex items-start gap-1.5">
                      <span className="text-teal mt-0.5 text-xs">•</span>
                      <span className="text-xs md:text-sm">قارن الأسعار والمواصفات بعناية</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-600 mt-0.5 text-xs">•</span>
                      <span className="text-xs md:text-sm">تحقق من تقييمات المستخدمين</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-600 mt-0.5 text-xs">•</span>
                      <span className="text-xs md:text-sm">اعتبر تكلفة التوصيل في حساباتك</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-600 mt-0.5 text-xs">•</span>
                      <span className="text-xs md:text-sm">تواصل مع المؤجر للتأكد من التوفر</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-600 mt-0.5 text-xs">•</span>
                      <span className="text-xs md:text-sm">اختر الأداة الأقرب لموقعك لتوفير الوقت</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-600 mt-0.5 text-xs">•</span>
                      <span className="text-xs md:text-sm">راجع حالة الأداة قبل اتخاذ القرار</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-4">
              لا توجد أدوات للمقارنة
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              أضف بعض الأدوات للمقارنة بينها واختيار الأنسب لمشروعك من ناحية السعر والجودة والموقع
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/outils"
                className="inline-flex items-center gap-2 bg-orange text-white px-6 py-3 rounded-xl hover:bg-orange/90 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <span>تصفح الأدوات</span>
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 bg-gray-100 text-dark-blue px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>تصفح الفئات</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

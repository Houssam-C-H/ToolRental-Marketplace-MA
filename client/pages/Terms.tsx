import { Link, useLocation } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';

export default function Terms() {
  const location = useLocation();
  const termsData = [
    {
      title: '1. التعريفات',
      content: [
        'المنصة: تشير إلى موقع تأجير الأدوات الإلكتروني',
        'المستخدم: أي شخص يستخدم المنصة سواء كان مؤجر أو مستأجر',
        'الأداة: أي معدة أو آلة متاحة للإيجار عبر المنصة',
        'المالك: الشخص الذي يملك الأداة ويرغب في تأجيرها',
        'المستأجر: الشخص الذي يرغب في استئجار الأداة'
      ]
    },
    {
      title: '2. استخدام المنصة',
      content: [
        'يحق لأي شخص بالغ استخدام المنصة لتأجير أو عرض الأدوات',
        'يجب تقديم معلومات صحيحة ومحدثة عند التسجيل',
        'المستخدم مسؤول عن حماية بيانات حسابه وكلمة المرور',
        'يُمنع استخدام المنصة لأي أغراض غير قانونية أو ضارة',
        'المنصة تحتفظ بالحق في إيقاف أي حساب يخالف هذه الشروط'
      ]
    },
    {
      title: '3. شروط الإيجار',
      content: [
        'جميع عمليات الإيجار تتم بالاتفاق المباشر بين المالك والمستأجر',
        'المنصة تعمل كوسيط فقط ولا تتحمل مسؤولية العقود',
        'يجب الاتفاق على مدة الإيجار وطريقة الدفع قبل استلام الأداة',
        'المستأجر مسؤول عن إرجاع الأداة في نفس حالتها',
        'أي أضرار للأداة يتحملها المستأجر حسب الاتفاق'
      ]
    },
    {
      title: '4. المسؤوليات',
      content: [
        'المنصة غير مسؤولة عن جودة أو حالة الأدوات المعروضة',
        'المالك مسؤول عن دقة وصف الأداة وحالتها',
        'المستأجر مسؤول عن الاستخدام الآمن والمناسب للأداة',
        'أي نزاعات تحل بالاتفاق المباشر بين الطرفين',
        'المنصة تقدم خدمة الوساطة فقط ولا تتدخل في النزاعات'
      ]
    },
    {
      title: '5. الدفع والرسوم',
      content: [
        'الدفع يتم مباشرة بين المالك والمستأجر',
        'المنصة لا تتدخل في عمليات الدفع أو تحصل على عمولات',
        'طرق الدفع متروكة لاتفاق الطرفين',
        'المنصة غير مسؤولة عن أي مشاكل مالية بين الطرفين'
      ]
    },
    {
      title: '6. الخصوصية والبيانات',
      content: [
        'نحترم خصوصية جميع المستخدمين',
        'البيانات الشخصية تُستخدم فقط لتحسين الخدمة',
        'لا نشارك البيانات مع أطراف ثالثة بدون موافقة',
        'المستخدم يحق له طلب حذف بياناته في أي وقت'
      ]
    },
    {
      title: '7. حقوق الملكية الفكرية',
      content: [
        'جميع حقوق المنصة محفوظة لصاحبها',
        'يُمنع نسخ أو إعادة إنتاج أي جزء من المنصة',
        'المحتوى المقدم من المستخدمين يبقى ملكاً لهم',
        'المنصة تحتفظ بالحق في استخدام المحتوى لأغراض التطوير'
      ]
    },
    {
      title: '8. تعديل الشروط',
      content: [
        'يحق للمنصة تعديل هذه الشروط في أي وقت',
        'التعديلات تصبح سارية فور نشرها على المنصة',
        'المستخدمون مطالبون بمراجعة الشروط بانتظام',
        'الاستمرار في استخدام المنصة يعني الموافقة على التعديلات'
      ]
    },
    {
      title: '9. إنهاء الخدمة',
      content: [
        'يحق للمنصة إيقاف الخدمة في أي وقت',
        'المستخدم يحق له إلغاء حسابه في أي وقت',
        'عند إنهاء الخدمة، تُحذف جميع البيانات الشخصية',
        'العقود الجارية تبقى نافذة حتى انتهائها'
      ]
    },
    {
      title: '10. القانون الساري',
      content: [
        'هذه الشروط تخضع للقانون المغربي',
        'أي نزاعات تُحل أمام المحاكم المغربية المختصة',
        'في حالة تعارض النسخة العربية مع أي نسخة أخرى، تُعتبر العربية هي المرجع'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white font-arabic" dir="rtl">
      <SEOHead
        title="شروط الاستخدام | منصة تأجير الأدوات"
        description="اقرأ شروط وأحكام استخدام منصة تأجير الأدوات. تعرف على حقوقك ومسؤولياتك عند استخدام المنصة لتأجير أو استئجار الأدوات."
        url={location.pathname}
        type="website"
      />
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

            {/* Add Equipment Button */}
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
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-orange transition-colors">الرئيسية</Link>
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-dark-blue font-medium">شروط الاستخدام</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-teal/20 to-teal/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark-blue mb-4">
            شروط الاستخدام
          </h1>
          <p className="text-lg md:text-xl text-dark-blue max-w-2xl mx-auto">
            الشروط والأحكام الخاصة باستخدام منصة تأجير الأدوات
          </p>
          <p className="text-sm text-dark-blue/80 mt-4">
            آخر تحديث: يناير 2024
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-orange/10 border border-orange/20 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-dark-blue mb-4">مقدمة</h2>
            <p className="text-gray-700 leading-relaxed">
              مرحباً بكم في منصة تأجير الأدوات. باستخدامكم لهذه المنصة، فإنكم توافقون على الالتزام بشروط الاستخدام المذكورة أدناه.
              نرجو قراءة هذه الشروط بعناية قبل البدء في استخدام خدماتنا. إذا كنتم لا توافقون على هذه الشروط،
              يُرجى عدم استخدام المنصة.
            </p>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {termsData.map((section, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg md:text-xl font-bold text-dark-blue mb-4 border-b border-gray-200 pb-3">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-orange rounded-full mt-2 flex-shrink-0"></div>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="bg-dark-blue text-white rounded-xl p-8 mt-12">
            <h3 className="text-xl font-bold mb-4">هل لديكم أسئلة؟</h3>
            <p className="text-white/90 mb-6">
              إذا كان لديكم أي استفسارات حول شروط الاستخدام، لا تترددوا في التواصل معنا
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                className="bg-orange text-white px-6 py-3 rounded-lg font-medium hover:bg-orange/90 transition-colors text-center"
              >
                اتصل بنا
              </Link>
              <a
                href="mailto:legal@toolsrental.ma"
                className="bg-transparent border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-dark-blue transition-colors text-center"
              >
                legal@toolsrental.ma
              </a>
            </div>
          </div>

          {/* Acceptance */}
          <div className="bg-gray-50 rounded-xl p-6 mt-8 text-center">
            <h3 className="text-lg font-bold text-dark-blue mb-4">الموافقة على الشروط</h3>
            <p className="text-gray-700 leading-relaxed">
              باستخدامكم لمنصة تأجير الأدوات، فإنكم تؤكدون أنكم قد قرأتم وفهمتم ووافقتم على جميع الشروط والأحكام المذكورة أعلاه.
              كما أنكم تؤكدون أنكم تبلغون من العمر 18 عاماً على الأقل وأنكم مؤهلون قانونياً للدخول في هذا الاتفاق.
            </p>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-dark-blue text-center mb-8">مواضيع ذات صلة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link
              to="/politique-confidentialite"
              className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow border border-gray-200"
            >
              <svg className="w-12 h-12 text-orange mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V17C16,18.4 15.6,19 14.2,19H9.8C8.4,19 8,18.4 8,17V13C8,12.4 8.4,11.5 9,11.5V10C9,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.2,9.2 10.2,10V11.5H13.8V10C13.8,9.2 12.8,8.2 12,8.2Z" />
              </svg>
              <h4 className="text-lg font-bold text-dark-blue mb-2">سياسة الخصوصية</h4>
              <p className="text-gray-600 text-sm">تعرف على كيفية حماية بياناتك الشخصية</p>
            </Link>

            <Link
              to="/a-propos"
              className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow border border-gray-200"
            >
              <svg className="w-12 h-12 text-orange mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
              </svg>
              <h4 className="text-lg font-bold text-dark-blue mb-2">من نحن</h4>
              <p className="text-gray-600 text-sm">تعرف على رؤيتنا ورسالتنا</p>
            </Link>

            <Link
              to="/contact"
              className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow border border-gray-200"
            >
              <svg className="w-12 h-12 text-orange mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              <h4 className="text-lg font-bold text-dark-blue mb-2">اتصل بنا</h4>
              <p className="text-gray-600 text-sm">تواصل معنا لأي استفسارات</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-blue text-white py-12">
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
                <li><Link to="/categorie/electrical-handheld" className="hover:text-teal transition-colors">الأدوات الكهربائية</Link></li>
                <li><Link to="/categorie/ladders-scaffolding" className="hover:text-teal transition-colors">السلالم والسقالات</Link></li>
                <li><Link to="/categorie/paint-finishing" className="hover:text-teal transition-colors">معدات الطلاء</Link></li>
                <li><Link to="/categorie/hand-tools" className="hover:text-teal transition-colors">الأدوات اليدوية</Link></li>
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

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Link, useLocation } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';

export default function About() {
  const location = useLocation();
  const stats = [
    { number: '2500+', label: 'أداة متاحة للإيجار', icon: '🔧' },
    { number: '1200+', label: 'عميل راضي', icon: '😊' },
    { number: '50+', label: 'شريك في سلا والرباط', icon: '🤝' },
    { number: '3', label: 'سنوات من الخدمة المتميزة', icon: '⭐' }
  ];

  const values = [
    {
      icon: '🤝',
      title: 'الثقة والموثوقية',
      description: 'نبني الثقة مع كل عميل من خلال الشفافية والخدمة الصادقة المعتمدة على الخبرة المحلية'
    },
    {
      icon: '⚡',
      title: 'السرعة والكفاءة',
      description: 'توفير الأدوات بسرعة في جميع أنحاء سلا والرباط لضمان عدم توقف مشاريعكم'
    },
    {
      icon: '💎',
      title: 'الجودة العالية',
      description: 'جميع أدواتنا من العلامات التجارية المعروفة عالمياً والموثوقة محلياً'
    },
    {
      icon: '📞',
      title: 'الدعم المستمر',
      description: 'فريق دعم محلي متاح لمساعدتكم في أي وقت بخبرة محلية وفهم عميق للسوق المغربي'
    }
  ];

  const timeline = [
    {
      year: '2021',
      title: 'تأسيس المنصة في سلا',
      description: 'بدأنا رحلتنا كأول منصة متخصصة لتأجير أدوات البناء في سلا'
    },
    {
      year: '2022',
      title: 'توسيع الخدمات للرباط',
      description: 'وسعنا خدماتنا لتشمل العاصمة الرباط مع شبكة شراكات قوية'
    },
    {
      year: '2023',
      title: 'شراكات استراتيجية',
      description: 'عقدنا شراكات مع أكثر من 50 مقاول وحرفي في المنطقة'
    },
    {
      year: '2024',
      title: 'القيادة في المنطقة',
      description: 'أصبحنا المنصة الرائدة والمرجع الأول لتأجير الأدوات في سلا والرباط'
    }
  ];

  const team = [
    {
      name: 'يوسف الرباطي',
      role: 'مؤسس ومدير عام',
      description: 'خبرة 15 سنة في مجال البناء والتشييد، متخصص في إدارة المشاريع الكبرى',
      image: 'https://images.pexels.com/photos/15360467/pexels-photo-15360467.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'فاطمة السلاوية',
      role: 'مديرة خدمة العملاء',
      description: 'متخصصة في خدمة العملاء وإدارة العلاقات التجارية، خبرة 10 سنوات',
      image: 'https://images.pexels.com/photos/17444741/pexels-photo-17444741.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'أحمد التازي',
      role: 'مسؤول الصيانة والجودة',
      description: 'خبير في صيانة المعدات وضمان جودة الأدوات، شهادات دولية معتمدة',
      image: 'https://images.pexels.com/photos/31970286/pexels-photo-31970286.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-arabic" dir="rtl">
      <SEOHead
        title="من نحن - منصة تأجير الأدوات | سلا والرباط"
        description="منصة رائدة في تأجير أدوات البناء في سلا والرباط منذ 2021. نخدم الحرفيين وأصحاب المشاريع بأحدث الأدوات وأفضل الأسعار."
        url={location.pathname}
        type="website"
      />
      <Navigation currentPage="about" showFavoritesCount={false} />
      
      {/* Page Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">
            نحن منصة سلا الرائدة لتأجير الأدوات
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            منذ تأسيسنا في سلا عام 2021، نخدم الحرفيين وأصحاب المشاريع في منطقة سلا أولاً ثم الرباط بأحدث الأدوات وأفضل الأسعار
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/outils"
            className="bg-orange text-white px-8 py-3 rounded-lg font-medium hover:bg-orange/90 transition-colors inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>تصفح الأدوات</span>
          </Link>
          <Link
            to="/contact"
            className="bg-gray-100 text-dark-blue px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span>اتصل بنا</span>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12 border-t border-gray-100">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-dark-blue mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium text-sm lg:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-4 py-12 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-dark-blue mb-4">
              قصتنا مع سلا والرباط
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              بدأت فكرة منصتنا عندما لاحظنا صعوبة الحصول على أدوات البناء المناسبة في منطقة سلا والرباط. 
              قررنا إنشاء حل محلي متكامل يخدم الحرفيين والمقاولين بأعلى معايير الجودة والموثوقية.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark-blue mb-3">الخبرة المحلية العميقة</h3>
                    <p className="text-gray-600 leading-relaxed">
                      نفهم احتياجات السوق المغربي جيداً ونعرف تحديات البناء الخاصة بمنطقة سلا والرباط. 
                      هذا ما يجعلنا نقدم خدمة مخصصة ومدروسة لعملائنا الكرام.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark-blue mb-3">شبكة شراكات قوية</h3>
                    <p className="text-gray-600 leading-relaxed">
                      نعمل مع أكثر من 50 شريك محلي موثوق في سلا والرباط لضمان توفر الأدوات عالية الجودة 
                      في جميع أنحاء المنطقة بأسعار منافسة وخدمة استثنائية.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <img 
                src="https://images.pexels.com/photos/31970286/pexels-photo-31970286.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="مباني حديثة في سلا والرباط"
                className="rounded-lg w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="container mx-auto px-4 py-12 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-dark-blue mb-4">
              رحلتنا عبر السنوات
            </h2>
            <p className="text-lg text-gray-600">
              من بداية متواضعة في سلا إلى الريادة في المنطقة
            </p>
          </div>
          
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-orange">{item.year}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-dark-blue mb-2">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="container mx-auto px-4 py-12 border-t border-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-dark-blue mb-4">
            قيمنا ومبادئنا
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            نؤمن بالقيم التي تجعل خدمتنا مميزة ومحل ثقة عملائنا في المغرب
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div key={index} className="text-center bg-white rounded-lg border border-gray-200 p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{value.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-dark-blue mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 py-12 border-t border-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-dark-blue mb-4">
            فريقنا المتخصص
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            فريق من الخبراء المغاربة ذوي الخبرة العميقة في مجال أدوات البناء والتشييد
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="h-48">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-lg font-bold text-dark-blue mb-2">
                  {member.name}
                </h3>
                <p className="text-orange font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-12 border-t border-gray-100">
        <div className="bg-dark-blue rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ابدأ مشروعك اليوم معنا
          </h2>
          <p className="text-lg mb-6 opacity-90">
            انضم إلى آلاف العملاء الراضين في سلا والرباط واحصل على أفضل الأدوات لمشروعك
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/outils"
              className="bg-orange text-white px-6 py-3 rounded-lg font-medium hover:bg-orange/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>استكشف الأدوات</span>
            </Link>
            <Link
              to="/ajouter-equipement"
              className="bg-white text-dark-blue px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span>أضف أداتك</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export default function Privacy() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <SEOHead
        title="سياسة الخصوصية | منصة تأجير الأدوات"
        description="تعرف على سياسة الخصوصية الخاصة بمنصة تأجير الأدوات. نحمي معلوماتك الشخصية ونضمن الخصوصية والأمان في استخدام المنصة."
        url={location.pathname}
        type="website"
      />
      {/* Header */}
      <header className="border-b-2 border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-12"
              />
            </div>
            <Link to="/" className="text-dark-blue hover:text-orange transition-colors flex items-center gap-2">
              <span>العودة للرئيسية</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-dark-blue mb-8 text-right">سياسة الخصوصية</h1>
          
          <div className="prose prose-lg max-w-none text-right space-y-8">
            <div className="bg-orange/10 border border-orange/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-orange mb-4">إشعار مهم</h2>
              <p className="text-gray-700 leading-relaxed">
                منصة تأجير الأدوات هي منصة وسيطة تربط بين أصحاب الأدوات والباحثين عن معدات للإيجار. 
                نحن لسنا مسؤولين عن جودة الأدوات، سلامة المعاملات، أو أي نزاعات قد تنشأ بين المستخدمين.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-dark-blue mb-4">1. المعلومات التي نجمعها</h2>
              <div className="text-gray-700 space-y-4">
                <p>نجمع المعلومات التالية عند استخدامكم لمنصتنا:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>المعلومات الشخصية مثل الاسم ورقم الهاتف والبريد الإلكتروني</li>
                  <li>معلومات الموقع الجغرافي (المدينة والحي)</li>
                  <li>تفاصيل الأدوات المراد تأجيرها أو استئجارها</li>
                  <li>الصور المرفوعة للأدوات</li>
                  <li>سجل التصفح والتفاعل مع المنصة</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-dark-blue mb-4">2. كيف نستخدم معلوماتكم</h2>
              <div className="text-gray-700 space-y-4">
                <p>نستخدم المعلومات المجمعة للأغراض التالية:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>تسهيل عملية الربط بين أصحاب الأدوات والمستأجرين</li>
                  <li>عرض الإعلانات والأدوات المتاحة</li>
                  <li>التواصل معكم بخصوص طلباتكم أو استفساراتكم</li>
                  <li>تحسين خدماتنا وتجربة المستخدمين</li>
                  <li>ضمان الأمان ومنع الاحتيال</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-dark-blue mb-4">3. مشاركة المعلومات</h2>
              <div className="text-gray-700 space-y-4">
                <p>نقوم بمشاركة معلوماتكم في الحالات التالية فقط:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>مع المستخدمين الآخرين لتسهيل عملية التأجير (معلومات الاتصال والموقع)</li>
                  <li>مع مقدمي الخدمات الذين يساعدوننا في تشغيل المنصة</li>
                  <li>عند وجود التزام قانوني بذلك</li>
                  <li>لحماية حقوقنا والمستخدمين الآخرين</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-dark-blue mb-4">4. المسؤولية والتنصل</h2>
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="text-gray-700 space-y-4">
                  <p className="font-bold text-red-800">تنصل من المسؤولية:</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>لسنا مسؤولين عن جودة أو حالة الأدوات المعروضة</li>
                    <li>لا نضمن صحة المعلومات المقدمة من قبل المستخدمين</li>
                    <li>لسنا طرفاً في المعاملات بين المستخدمين</li>
                    <li>لا نتحمل مسؤولية أي أضرار أو خسائر ناتجة عن استخدام المنصة</li>
                    <li>التحقق من هوية المستخدمين وموثوقيتهم مسؤولية كل مستخدم</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-dark-blue mb-4">5. حماية البيانات</h2>
              <div className="text-gray-700 space-y-4">
                <p>نتخذ الإجراءات التالية لحماية معلوماتكم:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>تشفير البيانات الحساسة</li>
                  <li>استخدام خوادم آمنة ومحمية</li>
                  <li>تقييد الوصول للمعلومات الشخصية</li>
                  <li>المراجعة الدورية لإجراءات الأمان</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-dark-blue mb-4">6. ملفات تعريف الارتباط (Cookies)</h2>
              <div className="text-gray-700 space-y-4">
                <p>نستخدم ملفات تعريف الارتباط للأغراض التالية:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>حفظ تفضيلاتكم وإعداداتكم</li>
                  <li>تذكر الأدوات المفضلة لديكم</li>
                  <li>تحليل استخدام الموقع وتحسين الأداء</li>
                  <li>عرض إعلانات مناسبة لاهتماماتكم</li>
                </ul>
                <p>يمكنكم إدارة إعدادات ملفات تعريف الارتباط من خلال متصفحكم.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-dark-blue mb-4">7. حقوقكم</h2>
              <div className="text-gray-700 space-y-4">
                <p>لديكم الحقوق التالية فيما يتعلق بمعلوماتكم الشخصية:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>الوصول إلى معلوماتكم الشخصية المخزنة لدينا</li>
                  <li>تصحيح أو تحديث المعلومات غير الصحيحة</li>
                  <li>حذف حسابكم ومعلوماتكم الشخصية</li>
                  <li>الاعتراض على معالجة معلوماتكم</li>
                  <li>نقل معلوماتكم إلى منصة أخرى</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-dark-blue mb-4">8. التغييرات على سياسة الخصوصية</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سيتم إشعاركم بأي تغييرات جوهرية 
                  عبر البريد الإلكتروني أو إشعار على المنصة. استمراركم في استخدام المنصة بعد 
                  نشر التغييرات يعني موافقتكم على السياسة المحدثة.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-dark-blue mb-4">9. التواصل معنا</h2>
              <div className="text-gray-700 space-y-4">
                <p>إذا كانت لديكم أي أسئلة حول سياسة الخصوصية هذه، يمكنكم التواصل معنا عبر:</p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><strong>البريد الإلكتروني:</strong> privacy@toolsrental.ma</p>
                  <p><strong>الهاتف:</strong> +212 6XX XXX XXX</p>
                  <p><strong>العنوان:</strong> الرباط، المغرب</p>
                </div>
              </div>
            </section>

            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-600">
                آخر تحديث: ديسمبر 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

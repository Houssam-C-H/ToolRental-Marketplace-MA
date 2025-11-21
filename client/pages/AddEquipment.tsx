import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { productSubmissionAPI } from "../lib/api";
import {
  Upload,
  MapPin,
  Phone,
  Heart,
  Grid,
  ArrowLeft,
  Camera,
  X,
  Check,
} from "lucide-react";

export default function AddEquipment() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    toolName: "",
    category: "",
    brand: "",
    model: "",
    condition: "",
    description: "",
    specifications: "",
    dailyPrice: "",
    city: "",
    neighborhood: "",
    ownerName: userProfile?.display_name || "",
    contactPhone: userProfile?.phone || "",
    contactWhatsApp: "",
    hasDelivery: false,
    deliveryPrice: "",
    deliveryNotes: "",
    images: [] as File[],
  });

  // Prefill owner fields from profile and lock them; also handle resend prefill
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ownerName: userProfile?.display_name || prev.ownerName,
      contactPhone: userProfile?.phone || prev.contactPhone,
    }));
    const rejectedData = location.state?.rejectedSubmission;
    if (rejectedData) {
      setFormData({
        toolName: rejectedData.product_data.toolName || "",
        category: rejectedData.product_data.category || "",
        brand: rejectedData.product_data.brand || "",
        model: rejectedData.product_data.model || "",
        condition: rejectedData.product_data.condition || "",
        description: rejectedData.product_data.description || "",
        specifications: rejectedData.product_data.specifications || "",
        dailyPrice: rejectedData.product_data.dailyPrice || "",
        city: rejectedData.product_data.city || "",
        neighborhood: rejectedData.product_data.neighborhood || "",
        ownerName:
          userProfile?.display_name || rejectedData.product_data.ownerName || "",
        contactPhone:
          userProfile?.phone || rejectedData.product_data.contactPhone || "",
        contactWhatsApp: rejectedData.product_data.contactWhatsApp || "",
        hasDelivery: rejectedData.product_data.hasDelivery || false,
        deliveryPrice: rejectedData.product_data.deliveryPrice || "",
        deliveryNotes: rejectedData.product_data.deliveryNotes || "",
        images: [] as File[], // Images need to be re-uploaded
      });
    }
  }, [location.state]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    "معدات الحفر",
    "أدوات البناء",
    "الأدوات الكهربائية",
    "الأدوات الميكانيكية",
    "معدات الرفع",
    "أدوات القياس",
    "معدات السلامة",
    "أخرى",
  ];

  const conditions = [
    "جديد",
    "مستعمل - حالة ممتازة",
    "مستعمل - حالة جيدة",
    "مستعمل - حالة متوسطة",
  ];

  const cities = [
    "سلا",
    "الرباط",
    "القنيطرة",
    "تمارة",
    "الصخيرات",
    "الدار البيضاء",
    "المحمدية",
    "برشيد",
    "الجديدة",
    "سطات",
    "فاس",
    "مكناس",
    "الحاجب",
    "إفران",
    "صفرو",
    "مراكش",
    "آسفي",
    "الصويرة",
    "قلعة السراغنة",
    "أكادير",
    "إنزكان",
    "تارودانت",
    "تيزنيت",
    "ورزازات",
    "زاكورة",
    "طنجة",
    "تطوان",
    "العرائش",
    "أصيلة",
    "شفشاون",
    "الحسيمة",
    "الناظور",
    "وجدة",
    "بركان",
    "تاوريرت",
    "الراشيدية",
    "أرفود",
    "ميدلت",
    "بني ملال",
    "خنيفرة",
    "أزيلال",
    "خريبكة",
    "الفقيه بن صالح",
    "العيون",
    "الداخلة",
    "بوجدور",
    "طانطان",
    "كلميم",
    "سيدي إفني",
  ];

  const neighborhoods = [
    // الرباط وسلا
    "أكدال",
    "حي الرياض",
    "أكرم",
    "السويسي",
    "يعقوب المنصور",
    "حي النهضة",
    "حي السلام",
    "التقدم",
    "المدينة القديمة",
    "الأوداية",
    "باب الأحد",
    "الطابريكيت",
    "المحيط",
    "بطانة",
    "لعمارة",
    "المدينة الجديدة",
    "تباريكت",
    "سلا الجديدة",
    "حي الإنقاذ",
    "حي المستقبل",
    // الدار البيضاء
    "عين السبع",
    "الحي المحمدي",
    "المعاريف",
    "الدراسين",
    "بنسليمان",
    "البرنوصي",
    "سيدي البرنوصي",
    "سيدي مومن",
    "الحي الحسني",
    "مولاي رشيد",
    "بلفدير",
    "الأنفا",
    "المدينة القديمة",
    "الحبوس",
    "الحي الاقتصادي",
    "درب السلطان",
    "عين الشق",
    "عين الذياب",
    "النواصر",
    "سيدي عثمان",
    // مراكش
    "جليز",
    "المدينة الحمراء",
    "حي النخيل",
    "المنارة",
    "مراكش المدينة",
    "جامع الفنا",
    "داوديات",
    "سيدي يوسف بن علي",
    "المحاميد",
    "سيدي غانم",
    // فاس
    "فاس المدينة",
    "أطلس فاس",
    "جنان الورد",
    "زواغة",
    "المرينيين",
    "بنسودة",
    "عين قادوس",
    "سايس",
    "نرجس",
    "المطار",
    // طنجة
    "الحي الإداري",
    "مالاباطا",
    "بني مكادة",
    "الرميلات",
    "بليونش",
    "الدراديب",
    "الحي الصناعي",
    "المنتزه",
    "مرقالة",
    "القنيطرة",
    // أكادير
    "دشيرة الجهاد",
    "بن سرغين",
    "تلبورجت",
    "الحي الصناعي",
    "أنزي",
    "انشادن",
    "أيت ملول",
    "إنزكان",
    "أولاد تايمة",
    "الحوزية",
    // مكناس
    "حمرية",
    "التوفيق",
    "سويسي",
    "مرجان",
    "المدينة الجديدة",
    "بساتين مكناس",
    "المنزه",
    "البساتين",
    // وجدة
    "لازاريت",
    "السلام",
    "الحي الجامعي",
    "المدينة الجديدة",
    "الناصر",
    "سيدي مسعود",
    // تطوان
    "المرتيل",
    "السانية",
    "عوامة",
    "المضيق",
    // القنيطرة
    "بير رامي",
    "المرجة الخضراء",
    "مولاي عبد الله",
    "الحي المحمدي",
    // أسفي
    "الحي الصناعي",
    "لالة عائشة",
    "شاطئ أسفي",
    // مدن أخرى
    "المدينة الجديدة",
    "المدينة القديمة",
    "الحي المحمدي",
    "الحي الإداري",
    "الحي الصناعي",
    "الحي السكني",
    "النهضة",
    "التقدم",
    "السلام",
    "الوحدة",
    "الحرية",
    "الاستقلال",
    "أخرى",
  ];

  // For now, create a simple mapping - will be replaced with proper city-based structure
  const getNeighborhoodsForCity = (city: string) => {
    if (!city) return [];

    const cityNeighborhoods = {
      سلا: [
        "تباريكت",
        "بطانة",
        "حي الإنقاذ",
        "حي السلام",
        "حي مولاي إسماعيل",
        "حي الشفاعة",
        "باب لمريسة",
        "لعيايدة",
        "احصين",
        "المدينة القديمة",
        "حي النصر",
        "حي المستقبل",
      ],
      الرباط: [
        "أكدال",
        "حي الرياض",
        "السويسي",
        "يعقوب المنصور",
        "حي النهضة",
        "المدينة القديمة",
        "الأوداية",
        "حي المحيط",
        "المدينة الجديدة",
        "حي حسان",
        "حي ديور جامع",
        "الحي الإداري",
      ],
      القنيطرة: [
        "بير رامي",
        "المرجة الخضراء",
        "مولاي عبد الله",
        "الحي المحمدي",
        "السكة",
        "المدينة الجديدة",
        "حي السلام",
        "الحي الصناعي",
      ],
      تمارة: [
        "المدينة الجديدة",
        "حي النصر",
        "حي المسيرة",
        "المدينة القديمة",
        "الحي الإداري",
      ],
      الصخيرات: ["المدينة المركز", "حي الشاطئ", "الحي السكني", "الحي الإداري"],
      "الدار البيضاء": [
        "المعاريف",
        "عين السبع",
        "الحي المحمدي",
        "سيدي البرنوصي",
        "سيدي مومن",
        "الحي الحسني",
        "مولاي رشيد",
        "بلفدير",
        "الأنفا",
        "المدينة القديمة",
        "الحبوس",
        "الحي الاقتصادي",
        "درب السلطان",
        "عين الشق",
        "عين الذياب",
        "النواصر",
        "سيدي عثمان",
        "البرنوصي",
        "الراسين",
      ],
      المحمدية: [
        "المدينة الجديدة",
        "حي الشاطئ",
        "الحي الصناعي",
        "حي السلام",
        "المدينة القديمة",
      ],
      برشيد: ["المدينة المركز", "الحي الإداري", "حي النصر", "المدينة الجديدة"],
      الجديدة: [
        "المدينة القديمة",
        "الحي الجديد",
        "سيدي بوزيد",
        "الحارة الكبيرة",
        "حي الشاطئ",
      ],
      سطات: ["المدينة الجديدة", "الحي الإداري", "حي المحطة", "المدينة القديمة"],
      فاس: [
        "فاس المدينة",
        "القرويين",
        "الأندلوسيين",
        "الطالعة الكبيرة",
        "الطالعة الصغيرة",
        "جنان الورد",
        "باب الخوخة",
        "باب الفتوح",
        "عين النقبي",
        "الجنانات",
        "صهريج اكناوة",
        "المرينيين",
        "ظهر الخميس",
        "الوفاق",
        "الأمل",
        "بلخياط",
        "بن دباب",
        "المصلى",
        "عين هارون",
        "عين قادوس",
        "السلام",
        "الضيعة",
        "الحي المحمدي",
        "ثغات",
        "الحديقة",
        "سايس",
        "مونفلوري",
        "النرجس",
        "عوينات الحجاج",
        "زواغة",
        "بنسودة",
        "النماء الصناعي",
        "زواغة العليا",
        "زواغة السفلى",
        "المسيرة",
        "أكدال",
        "المدينة الجديدة",
        "الأطلس",
        "السعادة",
        "الليدو",
      ],
      مكناس: [
        "حمرية",
        "التوفيق",
        "سويسي",
        "مرجان",
        "المدينة الجديدة",
        "بساتين مكناس",
        "المنزه",
        "البساتين",
        "ولي العهد",
        "المطار",
      ],
      الحاجب: ["المدينة المركز", "الحي الإداري", "المدينة الجديدة"],
      إفران: ["المدينة المركز", "الحي السياحي", "حي الجامعة"],
      صفرو: ["المدينة القديمة", "الحي الجديد", "الحي الإداري"],
      مراكش: [
        "جليز",
        "المدينة القديمة",
        "جامع الفنا",
        "القصبة",
        "المدينة الجديدة",
        "جنان الفنا",
        "داوديات",
        "سيدي يوسف بن علي",
        "المحاميد",
        "سيدي غانم",
        "تارغة",
        "المنارة",
        "حي النخيل",
        "الحي الصناعي",
        "مراكش المدينة",
      ],
      آسفي: [
        "المدينة القديمة",
        "الحي الجديد",
        "الحي الصناعي",
        "لالة عائشة",
        "شاطئ أسفي",
      ],
      الصويرة: ["المدينة القديمة", "الحي الجديد", "الشاطئ", "القصبة"],
      "قلعة السراغنة": ["المدينة المركز", "الحي الإداري", "المدينة الجديدة"],
      أكادير: [
        "تالبرجت",
        "فونتي",
        "أكادير أوفلا",
        "الشرف",
        "أنزا",
        "دشيرة الجهاد",
        "بن سرغين",
        "الحي الصناعي",
        "أيت ملول",
        "الحوزية",
        "المحمدية",
        "البحر",
      ],
      إنزكان: ["المدينة المركز", "الحي الجديد", "الحي الصناعي"],
      تارودانت: ["المدينة القديمة", "الحي الجديد", "الحي الإداري"],
      تيزنيت: ["المدينة القديمة", "الحي الحديث", "المدينة الجديدة"],
      ورزازات: ["المدينة المركز", "تبوريدا", "الحي السياحي"],
      زاكورة: ["المدينة المركز", "أمزميز", "الحي الإداري"],
      طنجة: [
        "المصلى",
        "بئر الشفاء",
        "مسنانة",
        "السواني",
        "كاساباراطا",
        "القصبة",
        "الحي الإداري",
        "مالاباطا",
        "بني مكادة",
        "الرميلات",
        "الدراديب",
        "الحي الصناعي",
        "المنتزه",
        "مرقالة",
        "الشرف",
      ],
      تطوان: [
        "المرتيل",
        "السانية",
        "عوامة",
        "المضيق",
        "المدينة القديمة",
        "الحي الجديد",
      ],
      العرائش: [
        "المدينة الجديدة",
        "الحي الإداري",
        "حي الشاطئ",
        "المدينة القديمة",
      ],
      أصيلة: ["المدينة القديمة", "الحي الجديد", "الشاطئ"],
      شفشاون: ["المدينة الزرقاء", "الحي الحديث", "المدينة القديمة"],
      الحسيمة: ["المدينة المركز", "حي الشاطئ", "الحي الجديد"],
      الناظور: ["المدينة الجديدة", "الحي التجاري", "الحي الإداري"],
      وجدة: [
        "لازاريت",
        "السلام",
        "الحي الجامعي",
        "المدينة الجديدة",
        "الناصر",
        "سيدي مسعود",
        "المطار",
        "الحي الإداري",
      ],
      بركان: ["المدينة الجديدة", "الحي الإداري", "المدينة القديمة"],
      تاوريرت: ["المدينة المركز", "الحي الجديد", "الحي الإداري"],
      الراشيدية: ["المدينة الجديدة", "الحي الإداري", "المدينة القديمة"],
      أرفود: ["المدينة المركز", "الحي السياحي", "الحي الجديد"],
      ميدلت: ["المدينة المركز", "الحي الجديد", "الحي الإداري"],
      "بني ملال": [
        "المدينة الجديدة",
        "الحي الإداري",
        "حي النصر",
        "المدينة القديمة",
      ],
      خنيفرة: ["المدينة الجديدة", "الحي الإداري", "المدينة القديمة"],
      أزيلال: ["المدينة المركز", "الحي الجديد", "الحي الإداري"],
      خريبكة: ["المدينة الجديدة", "الحي الإداري", "حي النصر", "الحي الصناعي"],
      "الفقيه بن صالح": ["المدينة المركز", "الحي التجاري", "الحي الإداري"],
      العيون: ["المدينة الجديدة", "الحي الإداري", "الحي التجاري"],
      الداخلة: ["المدينة المركز", "الحي التجاري", "الحي الإداري"],
      بوجدور: ["المدينة المركز", "الحي الإداري"],
      طانطان: ["المدينة المركز", "الحي الإداري"],
      كلميم: ["المدينة الجديدة", "الحي الإداري", "المدينة القديمة"],
      "سيدي إفني": ["المدينة المركز", "حي الشاطئ", "الحي الإداري"],
    };

    return (
      cityNeighborhoods[city as keyof typeof cityNeighborhoods] || [
        "المدينة الجديدة",
        "المدينة القديمة",
        "الحي المحمدي",
        "الحي الإداري",
        "الحي الصناعي",
        "الحي السكني",
        "أخرى",
      ]
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset neighborhood when city changes
      ...(name === "city" && { neighborhood: "" }),
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files).slice(0, 6 - formData.images.length);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    // Validate that at least one image is uploaded
    if (formData.images.length === 0) {
      setSubmitError("يرجى إضافة صورة واحدة على الأقل للأداة");
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert images to base64 strings for storage
      const imagePromises = formData.images.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      const imageUrls = await Promise.all(imagePromises);

      // Prepare submission data for Supabase
      const submissionData = {
        product_data: {
          toolName: formData.toolName,
          category: formData.category,
          brand: formData.brand,
          model: formData.model,
          condition: formData.condition,
          description: formData.description,
          specifications: formData.specifications,
          dailyPrice: formData.dailyPrice,
          city: formData.city,
          neighborhood: formData.neighborhood,
          ownerName: formData.ownerName,
          contactPhone: formData.contactPhone,
          contactWhatsApp: formData.contactWhatsApp,
          hasDelivery: formData.hasDelivery,
          deliveryPrice: formData.deliveryPrice,
          deliveryNotes: formData.deliveryNotes,
          images: imageUrls,
        },
      };

      // Check if this is a resend of a rejected submission
      if (location.state?.rejectedSubmission) {
        // Update the existing rejected submission
        await productSubmissionAPI.updateSubmission(
          location.state.rejectedSubmission.id,
          submissionData,
        );
      } else {
        // Submit a new submission with Firebase user ID
        await productSubmissionAPI.submit(submissionData, currentUser!.id);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    // Clear the location state to prevent showing resend indicators on refresh
    if (location.state?.rejectedSubmission) {
      window.history.replaceState({}, document.title);
    }

    return (
      <div className="min-h-screen bg-white" dir="rtl">
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
              <Link
                to="/"
                className="text-dark-blue hover:text-orange transition-colors flex items-center gap-2 font-arabic"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                <span>العودة للرئيسية</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-dark-blue mb-4">
              {location.state?.rejectedSubmission
                ? "تم إعادة تقديم الطلب بنجاح!"
                : "تم استلام طلبكم بنجاح!"}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {location.state?.rejectedSubmission
                ? "تم إعادة تقديم طلبكم بنجاح. سيتم مراجعة المعلومات المحدثة والصور الجديدة من قبل فريقنا وسيتم نشر إعلانكم في أقرب وقت ممكن."
                : "شكراً لكم على إضافة أداتكم إلى منصتنا. سيتم مراجعة المعلومات والصور المرسلة من قبل فريقنا وسيتم نشر إعلانكم في أقرب وقت ممكن."}
            </p>
            <div className="bg-orange/10 border border-orange/20 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-orange mb-2">
                ما هي الخطوات التالية؟
              </h3>
              <ul className="text-right space-y-2 text-gray-700">
                <li>• مراجعة المعلومات والصور</li>
                <li>• التحقق من صحة البيانات</li>
                <li>• نشر الإعلان على المنصة</li>
                <li>• إشعاركم عبر الهاتف عند النشر</li>
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                to="/my-submissions"
                className="bg-orange text-white px-8 py-3 rounded-lg font-medium hover:bg-orange/90 transition-colors"
              >
                تتبع طلباتي
              </Link>
              <Link
                to="/ajouter-equipement"
                className="bg-teal text-dark-blue px-8 py-3 rounded-lg font-medium hover:bg-teal/90 transition-colors"
              >
                إضافة أداة أخرى
              </Link>
              <Link
                to="/"
                className="bg-dark-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-dark-blue/90 transition-colors"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12"
              />
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-dark-blue hover:text-orange transition-colors flex items-center gap-2 font-arabic"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                <span>العودة للرئيسية</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 md:mb-12">
            <div className="text-right mb-6">
              <h1 className="text-2xl md:text-4xl font-bold text-dark-blue mb-4 font-arabic">
                {location.state?.rejectedSubmission
                  ? "إعادة تقديم الطلب"
                  : "أضف أداتك للإيجار"}
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl font-arabic leading-relaxed">
                {location.state?.rejectedSubmission
                  ? "تم ملء النموذج ببيانات الطلب المرفوض. يرجى مراجعة وتعديل المعلومات حسب الملاحظات ثم إعادة التقديم."
                  : "شارك أدواتك مع الآلاف من الباحثين عن معدات البناء والبريكولاج واحصل على دخل إضافي"}
              </p>
            </div>
            {location.state?.rejectedSubmission && (
              <div className="mt-6 p-4 bg-orange/10 border border-orange/20 rounded-xl text-right">
                <p className="text-orange-700 text-sm font-arabic">
                  <strong>ملاحظة:</strong> يرجى إعادة رفع الصور لأنها مطلوبة
                  للتقديم الجديد
                </p>
                {location.state.rejectedSubmission.admin_notes && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-arabic">
                      <strong>سبب الرفض:</strong>{" "}
                      {location.state.rejectedSubmission.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tool Information */}
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm">
              <h2 className="text-xl md:text-2xl font-bold text-dark-blue mb-6 text-right font-arabic">
                معلومات الأداة
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                    اسم الأداة *
                  </label>
                  <input
                    type="text"
                    name="toolName"
                    value={formData.toolName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                    placeholder="مثال: مثقاب كهربائي بوش"
                    required
                  />
                </div>

                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفئة *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                    required
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العلامة التجارية
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                    placeholder="مثال: بوش، ماكيتا، ديوالت"
                  />
                </div>

                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموديل
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                    placeholder="رقم الموديل أو الاسم التجاري"
                  />
                </div>

                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حالة الأداة *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                    required
                  >
                    <option value="">اختر الحالة</option>
                    {conditions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر اليومي (درهم) *
                  </label>
                  <input
                    type="number"
                    name="dailyPrice"
                    value={formData.dailyPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                    placeholder="100"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 text-right">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الأداة *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                  placeholder="اكتب وصفاً مفصلاً للأداة واستخداماتها..."
                  required
                />
              </div>

              <div className="mt-6 text-right">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المواصفات التقنية
                </label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                  placeholder="القوة، الوزن، الأبعاد، وأي مواصفات تقنية أخرى..."
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-dark-blue mb-6 text-right">
                معلومات الموقع
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدينة *
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                    required
                  >
                    <option value="">اختر المدينة</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحي *
                  </label>
                  <select
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                    required
                    disabled={!formData.city}
                  >
                    <option value="">
                      {formData.city ? "اختر الحي" : "اختر المدينة أولاً"}
                    </option>
                    {getNeighborhoodsForCity(formData.city).map(
                      (neighborhood) => (
                        <option key={neighborhood} value={neighborhood}>
                          {neighborhood}
                        </option>
                      ),
                    )}
                  </select>
                  {!formData.city && (
                    <p className="text-sm text-gray-500 mt-1">
                      يرجى اختيار المدينة أولاً لعرض الأحياء المتاحة
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-dark-blue mb-6 text-right">
                التوصيل
              </h2>

              <div className="space-y-6">
                <div className="text-right">
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasDelivery"
                        checked={!formData.hasDelivery}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            hasDelivery: false,
                            deliveryPrice: "",
                            deliveryNotes: "",
                          }))
                        }
                        className="w-4 h-4 text-teal border-gray-300 focus:ring-teal"
                      />
                      <span className="text-gray-800">بدون توصيل</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasDelivery"
                        checked={formData.hasDelivery}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            hasDelivery: true,
                          }))
                        }
                        className="w-4 h-4 text-teal border-gray-300 focus:ring-teal"
                      />
                      <span className="text-gray-800">مع التوصيل</span>
                    </label>
                  </div>
                </div>

                {formData.hasDelivery && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <div className="text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        السعر (درهم)
                      </label>
                      <input
                        type="number"
                        name="deliveryPrice"
                        value={formData.deliveryPrice}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                        placeholder="50"
                        min="0"
                      />
                    </div>

                    <div className="text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المنطقة
                      </label>
                      <input
                        type="text"
                        name="deliveryNotes"
                        value={formData.deliveryNotes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                        placeholder="داخل المدينة"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-dark-blue mb-6 text-right">
                معلومات التواصل
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المالك أو المحل *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                    placeholder="مثال: أحمد محمد أو متجر الأدوات المحترف"
                    required
                    disabled
                  />
                </div>

                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                    placeholder="+212 6XX XXX XXX"
                    required
                    disabled
                  />
                </div>

                <div className="text-right md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الواتساب
                  </label>
                  <input
                    type="tel"
                    name="contactWhatsApp"
                    value={formData.contactWhatsApp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent text-right"
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>
              </div>
            </div>

            {/* Images Upload */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-dark-blue mb-6 text-right">
                صور الأداة *
              </h2>

              <div className="text-right mb-6">
                <p className="text-gray-600 mb-2">
                  أضف صوراً واضحة للأداة (حد أقصى 6 صور) -{" "}
                  <span className="text-red-500 font-medium">مطلوب</span>
                </p>
                <p className="text-sm text-gray-500">
                  الصور الجيدة تزيد من فرص تأجير أداتك
                </p>
              </div>

              {/* Image Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? "border-teal bg-teal/5"
                    : formData.images.length > 0
                      ? "border-teal"
                      : "border-red-300 bg-red-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      اسحب الصور هنا أو انقر للاختيار
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, JPEG - حد أقصى 5 ميجابايت لكل صورة
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="images"
                      name="images"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                    <label
                      htmlFor="images"
                      className="bg-teal text-dark-blue px-6 py-3 rounded-lg font-medium hover:bg-teal/90 transition-colors cursor-pointer inline-flex items-center gap-2 font-arabic"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                      <span>اختر الصور</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 text-right">
                    الصور المختارة ({formData.images.length}/6)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`صورة ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error message when no images */}
              {formData.images.length === 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm text-center">
                    ⚠️ يرجى إضافة صورة واحدة على الأقل للأداة
                  </p>
                </div>
              )}
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3 text-red-800">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span className="font-medium">{submitError}</span>
                </div>
              </div>
            )}

            {/* Terms and Submit */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="text-right space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 w-4 h-4 text-teal border-gray-300 rounded focus:ring-teal"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    أوافق على{" "}
                    <Link to="/conditions-utilisation" className="text-teal hover:underline">
                      شروط الاستخدام
                    </Link>{" "}
                    و{" "}
                    <Link to="/politique-confidentialite" className="text-teal hover:underline">
                      سياسة الخصوصية
                    </Link>
                    . أفهم أن المنصة هي وسيط فقط وليست مسؤولة عن المعاملات بين
                    المستخدمين.
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="review"
                    required
                    className="mt-1 w-4 h-4 text-teal border-gray-300 rounded focus:ring-teal"
                  />
                  <label htmlFor="review" className="text-sm text-gray-700">
                    أفهم أن إعلاني سيخضع للمراجعة قبل النشر وقد يستغرق ذلك 24-48
                    ساعة
                  </label>
                </div>
              </div>

              <div className="mt-8 flex gap-4 justify-center">
                <Link
                  to="/"
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-teal text-dark-blue px-8 py-3 rounded-lg font-medium hover:bg-teal/90 transition-colors flex items-center gap-2 font-arabic disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark-blue"></div>
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                      <span>إرسال للمراجعة</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

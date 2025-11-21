import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera, Plus, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from '../hooks/use-toast';
import { uploadProfileImage } from '../lib/imageUpload';

export default function UserProfilePage() {
    const { currentUser, userProfile, updateUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        display_name: '',
        phone: '',
        email: '',
        description: '',
        location: '',
        specialties: [] as string[],
        response_time: ''
    });
    const [newSpecialty, setNewSpecialty] = useState('');
    const [imageUploading, setImageUploading] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setFormData({
                display_name: userProfile.display_name || '',
                phone: userProfile.phone || '',
                email: userProfile.email || '',
                description: userProfile.description || '',
                location: userProfile.location || '',
                specialties: userProfile.specialties || [],
                response_time: userProfile.response_time || ''
            });
        }
    }, [userProfile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSpecialtyAdd = () => {
        if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
            setFormData(prev => ({
                ...prev,
                specialties: [...prev.specialties, newSpecialty.trim()]
            }));
            setNewSpecialty('');
        }
    };

    const handleSpecialtyRemove = (specialty: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.filter(s => s !== specialty)
        }));
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "خطأ في نوع الملف",
                description: "يرجى اختيار ملف صورة صالح",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "حجم الملف كبير جداً",
                description: "يرجى اختيار صورة أقل من 5 ميجابايت",
                variant: "destructive",
            });
            return;
        }

        try {
            setImageUploading(true);

            // Use the new image upload function
            const result = await uploadProfileImage(file, currentUser?.uid || 'anonymous');

            if (!result.success) {
                throw new Error(result.error || 'Upload failed');
            }

            // Update user profile with new image URL
            await updateUserProfile({
                profilePhoto: result.url
            });

            toast({
                title: "تم رفع الصورة بنجاح",
                description: "تم تحديث صورة الملف الشخصي",
            });

        } catch (error) {
            console.error('Error uploading image:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));

            let errorMessage = "فشل في رفع الصورة، يرجى المحاولة مرة أخرى";
            if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = `خطأ: ${error.message}`;
            }

            toast({
                title: "خطأ في رفع الصورة",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setImageUploading(false);
        }
    };

    const handleSave = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            await updateUserProfile({
                display_name: formData.display_name,
                phone: formData.phone,
                description: formData.description,
                location: formData.location,
                specialties: formData.specialties,
                response_time: formData.response_time
            });

            toast({
                title: "تم التحديث بنجاح",
                description: "تم حفظ معلومات الملف الشخصي",
            });

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: "خطأ في التحديث",
                description: "فشل في حفظ التغييرات",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Don't reset the form data, just exit editing mode
        // This preserves the current values in the input fields
        setIsEditing(false);
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-gray-800 text-lg">يجب تسجيل الدخول أولاً</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
            <Navigation currentPage="profile" />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={userProfile?.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                                        alt="Profile"
                                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                                    />
                                    <label className={`absolute -bottom-1 -right-1 bg-orange text-white rounded-full p-2 hover:bg-orange/90 transition-colors cursor-pointer ${imageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {imageUploading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <Camera className="w-4 h-4" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={imageUploading}
                                        />
                                    </label>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">الملف الشخصي</h1>
                                    <p className="text-gray-600">إدارة معلوماتك الشخصية</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (isEditing) {
                                        handleCancel();
                                    } else {
                                        setIsEditing(true);
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors"
                            >
                                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                                {isEditing ? 'إلغاء' : 'تعديل'}
                            </button>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">المعلومات الشخصية</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Display Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الاسم الكامل
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="display_name"
                                        value={formData.display_name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                                        placeholder="أدخل اسمك الكامل"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-800">{userProfile?.display_name || 'غير محدد'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    البريد الإلكتروني
                                </label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-800">{userProfile?.email || currentUser.email || 'غير محدد'}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رقم الهاتف
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                                        placeholder="أدخل رقم هاتفك"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-800">{userProfile?.phone || 'غير محدد'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Account Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نوع الحساب
                                </label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <div className={`w-3 h-3 rounded-full ${userProfile?.is_admin ? 'bg-orange' : 'bg-teal'}`}></div>
                                    <span className="text-gray-800">
                                        {userProfile?.is_admin ? 'مزود خدمة' : 'مستخدم عادي'}
                                    </span>
                                </div>
                            </div>

                            {/* Member Since */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    عضو منذ
                                </label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-800">
                                        {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                                    </span>
                                </div>
                            </div>

                            {/* Last Login */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    آخر تسجيل دخول
                                </label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-800">
                                        {userProfile?.lastLogin ? new Date(userProfile.lastLogin).toLocaleDateString('ar-SA') : 'غير محدد'}
                                    </span>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الموقع
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                                        placeholder="أدخل موقعك"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-800">{userProfile?.location || 'غير محدد'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Response Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    وقت الاستجابة
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="response_time"
                                        value={formData.response_time}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                                        placeholder="مثال: أقل من ساعة"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-800">{userProfile?.response_time || 'غير محدد'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الوصف
                            </label>
                            {isEditing ? (
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                                    placeholder="اكتب وصفاً عن نفسك وخدماتك"
                                />
                            ) : (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-800">{userProfile?.description || 'لا يوجد وصف'}</span>
                                </div>
                            )}
                        </div>

                        {/* Specialties */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                التخصصات
                            </label>
                            {isEditing ? (
                                <div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.specialties.map((specialty, index) => (
                                            <span
                                                key={index}
                                                className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                                            >
                                                {specialty}
                                                <button
                                                    type="button"
                                                    onClick={() => handleSpecialtyRemove(specialty)}
                                                    className="text-orange-600 hover:text-orange-800"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSpecialty}
                                            onChange={(e) => setNewSpecialty(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSpecialtyAdd()}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                                            placeholder="أضف تخصصاً جديداً"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSpecialtyAdd}
                                            className="px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            إضافة
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {userProfile?.specialties && userProfile.specialties.length > 0 ? (
                                        userProfile.specialties.map((specialty, index) => (
                                            <span
                                                key={index}
                                                className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                                            >
                                                {specialty}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">لا توجد تخصصات</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Save/Cancel Buttons */}
                        {isEditing && (
                            <div className="flex items-center gap-4 mt-8 pt-6 border-t">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    إلغاء
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

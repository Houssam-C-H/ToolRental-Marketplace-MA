import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);

    const { signIn, resetPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signIn(email, password);
            navigate(from, { replace: true });
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.message?.includes('Invalid login credentials') || error.message?.includes('Email not confirmed')) {
                setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            } else if (error.message?.includes('Too many requests')) {
                setError('تم حظر الحساب مؤقتاً بسبب محاولات تسجيل دخول فاشلة متعددة');
            } else {
                setError(error.message || 'حدث خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await resetPassword(resetEmail);
            setResetSent(true);
        } catch (error: any) {
            console.error('Password reset error:', error);
            setError(error.message || 'حدث خطأ في إرسال رابط إعادة تعيين كلمة المرور');
        } finally {
            setLoading(false);
        }
    };

    if (isResetMode) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-dark-blue">إعادة تعيين كلمة المرور</h2>
                        <p className="mt-2 text-gray-600">أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين</p>
                    </div>

                    {resetSent ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-green-800 mb-2">تم إرسال رابط إعادة التعيين</h3>
                            <p className="text-green-700">تحقق من بريدك الإلكتروني واتبع الرابط لإعادة تعيين كلمة المرور</p>
                            <button
                                onClick={() => setIsResetMode(false)}
                                className="mt-4 text-green-600 hover:text-green-700 font-medium"
                            >
                                العودة لتسجيل الدخول
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 text-sm">{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 text-right">
                                    البريد الإلكتروني
                                </label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange focus:border-orange text-right"
                                    placeholder="أدخل بريدك الإلكتروني"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsResetMode(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        'إرسال رابط إعادة التعيين'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-16 mx-auto mb-6"
                    />
                    <h2 className="text-3xl font-bold text-dark-blue">تسجيل الدخول</h2>
                    <p className="mt-2 text-gray-600">سجل دخولك للوصول إلى حسابك</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-right">
                            البريد الإلكتروني
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange focus:border-orange text-right"
                            placeholder="أدخل بريدك الإلكتروني"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-right">
                            كلمة المرور
                        </label>
                        <div className="relative mt-1">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange focus:border-orange text-right"
                                placeholder="أدخل كلمة المرور"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setIsResetMode(true)}
                            className="text-sm text-orange hover:text-orange/80 transition-colors"
                        >
                            نسيت كلمة المرور؟
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                جاري تسجيل الدخول...
                            </>
                        ) : (
                            'تسجيل الدخول'
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            ليس لديك حساب؟{' '}
                            <Link to="/inscription" className="text-orange hover:text-orange/80 font-medium">
                                كن مزود خدمة
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

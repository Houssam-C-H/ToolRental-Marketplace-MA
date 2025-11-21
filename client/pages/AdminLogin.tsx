import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { adminAuthAPI } from "../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const { adminSession } = await import("../lib/adminSession");
        const isValid = await adminSession.validateSession();
        if (isValid) {
          navigate("/admin-dashboard");
        }
      } catch (error) {
        // Not logged in, stay on login page
      }
    };

    checkAdminSession();
  }, [navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use Supabase admin authentication (session is stored automatically)
      const adminUser = await adminAuthAPI.login(adminEmail, adminPassword);

      // Store additional info for display (session token is stored securely by adminSession)
      localStorage.setItem("adminEmail", adminUser.email);
      localStorage.setItem("adminName", adminUser.name || "");
      localStorage.setItem("adminRole", adminUser.role || "admin");

      // Redirect to admin dashboard
      navigate("/admin-dashboard");
    } catch (err) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
      <Navigation currentPage="admin" />

      {/* Breadcrumb */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">الرئيسية</span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-orange font-medium">دخول الإدارة</span>
          </nav>
        </div>
      </div>

      {/* Login Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                دخول الإدارة
              </h1>
              <p className="text-gray-600">
                أدخل بيانات الدخول للوصول إلى لوحة الإدارة
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent transition-colors"
                  placeholder="admin@ajir.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span className="text-red-600 text-sm">{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-orange text-white py-3 rounded-lg hover:bg-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                disabled={loading}
              >
                {loading ? "جاري الدخول..." : "دخول"}
              </button>
            </form>

            <div className="mt-6 p-4 bg-teal/10 border border-teal/30 rounded-lg">
              <h3 className="text-sm font-medium text-teal mb-2">
                ملاحظة أمنية:
              </h3>
              <div className="text-xs text-teal space-y-1">
                <p>• تأكد من تغيير كلمة المرور الافتراضية بعد أول دخول</p>
                <p>• لا تشارك بيانات الدخول مع أي شخص</p>
                <p>• استخدم كلمة مرور قوية تحتوي على أحرف وأرقام</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-orange transition-colors text-sm"
              >
                العودة إلى الصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();
  const [adminValid, setAdminValid] = React.useState<boolean | null>(
    requireAdmin ? null : true
  );
  const [adminChecking, setAdminChecking] = React.useState(requireAdmin);

  React.useEffect(() => {
    if (!requireAdmin) return;

    let mounted = true;

    const validateAdmin = async () => {
      try {
        setAdminChecking(true);
        const { adminSession } = await import("../lib/adminSession");

        if (!adminSession.isLoggedIn()) {
          if (mounted) setAdminValid(false);
          return;
        }

        const isValid = await adminSession.validateSession();
        if (mounted) {
          setAdminValid(isValid);
        }
      } catch (error) {
        console.error("Admin validation error:", error);
        if (mounted) {
          setAdminValid(false);
        }
      } finally {
        if (mounted) {
          setAdminChecking(false);
        }
      }
    };

    validateAdmin();

    return () => {
      mounted = false;
    };
  }, [requireAdmin]);

  // For admin routes, validate session with server
  if (requireAdmin) {
    if (adminChecking || adminValid === null) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-blue mx-auto mb-4"></div>
            <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
          </div>
        </div>
      );
    }

    if (!adminValid) {
      return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
  }

  // For regular user routes, check Supabase Auth
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-blue mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

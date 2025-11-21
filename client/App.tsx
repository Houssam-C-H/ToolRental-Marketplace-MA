import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import { AuthProvider } from "./contexts/AuthContext";
import QueryProvider from "./providers/QueryProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/NewIndex";
import AddEquipment from "./pages/AddEquipment";
import AdminLogin from "./pages/AdminLogin";
import MySubmissions from "./pages/MySubmissions";
import Tools from "./pages/Tools";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Favorites from "./pages/Favorites";
import Categories from "./pages/Categories";
import CategoryPage from "./pages/CategoryPage";
import Comparison from "./pages/Comparison";
import Terms from "./pages/Terms";
import UserProfile from "./pages/UserProfile";
import UserProfilePage from "./pages/UserProfilePage";
import SupplierProfile from "./pages/SupplierProfile";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import UserDashboard from "./components/Dashboard/UserDashboard";
import AdminDashboard from "./components/Dashboard/AdminDashboard";

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <ComparisonProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/recherche" element={<Search />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Signup />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/politique-confidentialite" element={<Privacy />} />
              <Route path="/conditions-utilisation" element={<Terms />} />
              <Route path="/outils" element={<Tools />} />
              <Route path="/outil/:id" element={<ProductDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categorie/:categoryName" element={<CategoryPage />} />
              <Route path="/comparateur" element={<Comparison />} />
              <Route path="/profil/:ownerName" element={<UserProfile />} />
              <Route path="/fournisseur/:compositeKey" element={<SupplierProfile />} />

              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ajouter-equipement"
                element={
                  <ProtectedRoute>
                    <AddEquipment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mes-demandes"
                element={
                  <ProtectedRoute>
                    <MySubmissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favoris"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mon-profil"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ComparisonProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}

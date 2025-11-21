# Frontend Routing

## Table of Contents
- [Routing Overview](#routing-overview)
- [Route Configuration](#route-configuration)
- [Protected Routes](#protected-routes)
- [Navigation](#navigation)
- [URL Structure](#url-structure)

## Routing Overview

The application uses **React Router DOM v6** for client-side routing. All routes are configured in `client/App.tsx`.

### Router Setup

```tsx
<BrowserRouter>
  <Routes>
    {/* Route definitions */}
  </Routes>
</BrowserRouter>
```

## Route Configuration

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `NewIndex` | Homepage |
| `/recherche` | `Search` | Search results page |
| `/connexion` | `Login` | User login |
| `/inscription` | `Signup` | User registration |
| `/a-propos` | `About` | About us page |
| `/politique-confidentialite` | `Privacy` | Privacy policy |
| `/conditions-utilisation` | `Terms` | Terms of use |
| `/outils` | `Tools` | Tools listing page |
| `/outil/:id` | `ProductDetail` | Product detail page |
| `/categories` | `Categories` | Categories listing |
| `/categorie/:categoryName` | `CategoryPage` | Category page |
| `/comparateur` | `Comparison` | Product comparison |
| `/profil/:ownerName` | `UserProfile` | User profile (public) |
| `/fournisseur/:compositeKey` | `SupplierProfile` | Supplier profile |

### Protected User Routes

| Route | Component | Protection |
|-------|-----------|------------|
| `/dashboard` | `UserDashboard` | Requires authentication |
| `/ajouter-equipement` | `AddEquipment` | Requires authentication |
| `/mes-demandes` | `MySubmissions` | Requires authentication |
| `/favoris` | `Favorites` | Requires authentication |
| `/mon-profil` | `UserProfilePage` | Requires authentication |

### Admin Routes

| Route | Component | Protection |
|-------|-----------|------------|
| `/admin-login` | `AdminLogin` | Public (admin login) |
| `/admin` | `AdminDashboard` | Requires admin authentication |
| `/admin-dashboard` | `AdminDashboard` | Requires admin authentication (alias) |

### Catch-All Route

| Route | Component | Description |
|-------|-----------|-------------|
| `*` | `NotFound` | 404 error page |

## Protected Routes

### User Authentication Protection

The `ProtectedRoute` component protects routes that require user authentication:

```tsx
<ProtectedRoute>
  <UserDashboard />
</ProtectedRoute>
```

**How it works:**
1. Checks `AuthContext` for current user
2. Shows loading spinner while checking
3. Redirects to `/connexion` if not authenticated
4. Renders children if authenticated

**Implementation:**
```tsx
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!currentUser) return <Navigate to="/connexion" />;
  
  return <>{children}</>;
}
```

### Admin Authorization Protection

Admin routes require both authentication and admin authorization:

```tsx
<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>
```

**How it works:**
1. Checks Supabase Auth session
2. Validates admin session via RPC function
3. Shows loading spinner during validation
4. Redirects to `/admin-login` if not authorized
5. Renders children if authorized

**Implementation:**
```tsx
export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const [adminValid, setAdminValid] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (requireAdmin) {
      validateAdminSession().then(setAdminValid);
    }
  }, [requireAdmin]);
  
  if (requireAdmin) {
    if (adminValid === null) return <LoadingSpinner />;
    if (!adminValid) return <Navigate to="/admin-login" />;
  }
  
  // ... user auth check
}
```

## Navigation

### Programmatic Navigation

Use React Router's `useNavigate` hook:

```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/outils');
  };
  
  return <button onClick={handleClick}>Go to Tools</button>;
}
```

### Link Navigation

Use React Router's `Link` component:

```tsx
import { Link } from 'react-router-dom';

<Link to="/outil/123">View Product</Link>
```

### Navigation with State

Pass state when navigating:

```tsx
navigate('/dashboard', { state: { from: 'homepage' } });
```

Access state in destination component:

```tsx
const location = useLocation();
const from = location.state?.from;
```

### Query Parameters

Read query parameters:

```tsx
import { useSearchParams } from 'react-router-dom';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const category = searchParams.get('category');
}
```

Update query parameters:

```tsx
const [searchParams, setSearchParams] = useSearchParams();

setSearchParams({ q: 'drill', category: 'tools' });
```

### Route Parameters

Access route parameters:

```tsx
import { useParams } from 'react-router-dom';

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  // Use id to fetch product data
}
```

## URL Structure

### URL Patterns

#### Product URLs
- Format: `/outil/:id`
- Example: `/outil/550e8400-e29b-41d4-a716-446655440000`
- ID: UUID from database

#### Category URLs
- Format: `/categorie/:categoryName`
- Example: `/categorie/معدات%20الحفر`
- Category name: URL-encoded Arabic name

#### Supplier URLs
- Format: `/fournisseur/:compositeKey`
- Example: `/fournisseur/user123-ownerName`
- Composite key: `{userId}-{ownerName}`

#### User Profile URLs
- Format: `/profil/:ownerName`
- Example: `/profil/مجاهد%20النجار`
- Owner name: URL-encoded Arabic name

### URL Encoding

All non-ASCII characters (Arabic) are URL-encoded:

```tsx
// Encoding
const encoded = encodeURIComponent('معدات الحفر');
// Result: '%D9%85%D8%B9%D8%AF%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AD%D9%81%D8%B1'

// Decoding
const decoded = decodeURIComponent(encoded);
// Result: 'معدات الحفر'
```

### Canonical URLs

SEO canonical URLs are set via `SEOHead` component:

```tsx
<SEOHead
  url={location.pathname}
  // ... other props
/>
```

## Route Guards

### Authentication Guard

Automatically redirects unauthenticated users:

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  }
/>
```

### Admin Guard

Validates admin session before allowing access:

```tsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

## Navigation Patterns

### 1. **Conditional Navigation**
Navigate based on conditions:

```tsx
if (isAuthenticated) {
  navigate('/dashboard');
} else {
  navigate('/connexion');
}
```

### 2. **Navigation with Redirect**
Redirect after action:

```tsx
const handleSubmit = async () => {
  await submitForm();
  navigate('/mes-demandes');
};
```

### 3. **Back Navigation**
Go back in history:

```tsx
const navigate = useNavigate();
navigate(-1); // Go back one page
```

### 4. **Replace Navigation**
Replace current history entry:

```tsx
navigate('/dashboard', { replace: true });
```

## Next Steps

- [State Management Documentation](./06_FRONTEND_STATE_MANAGEMENT.md)
- [Styling Documentation](./07_FRONTEND_STYLING.md)
- [Backend Documentation](../docs/01_BACKEND_OVERVIEW.md)


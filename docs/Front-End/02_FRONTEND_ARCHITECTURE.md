# Frontend Architecture

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Routing Architecture](#routing-architecture)
- [Performance Optimizations](#performance-optimizations)

## Architecture Overview

The frontend follows a **component-based architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         React Application               │
├─────────────────────────────────────────┤
│  Pages (Routes)                         │
│  ├── Public Pages                       │
│  ├── Protected User Pages                │
│  └── Admin Pages                         │
├─────────────────────────────────────────┤
│  Components                             │
│  ├── UI Components (Radix UI)           │
│  ├── Feature Components                 │
│  └── Layout Components                   │
├─────────────────────────────────────────┤
│  Context Providers                      │
│  ├── AuthContext                        │
│  ├── ComparisonContext                  │
│  └── QueryProvider (React Query)        │
├─────────────────────────────────────────┤
│  API Layer (lib/api.ts)                 │
│  ├── productsAPI                        │
│  ├── categoriesAPI                      │
│  ├── reviewsAPI                         │
│  └── adminAPI                           │
├─────────────────────────────────────────┤
│  Supabase Client                        │
└─────────────────────────────────────────┘
```

## Data Flow

### 1. User Actions → API Calls → State Update → UI Re-render

```
User Action (Click, Form Submit)
    ↓
Component Event Handler
    ↓
API Function Call (lib/api.ts)
    ↓
Supabase Client (lib/supabase.ts)
    ↓
Supabase Backend (Database/Auth/Storage)
    ↓
Response Data
    ↓
State Update (useState, Context, React Query)
    ↓
Component Re-render
```

### 2. Authentication Flow

```
User Login
    ↓
AuthContext.signIn()
    ↓
Supabase Auth
    ↓
User Profile Fetch
    ↓
AuthContext State Update
    ↓
ProtectedRoute Check
    ↓
Page Render / Redirect
```

### 3. Product Data Flow

```
Page Load
    ↓
useEffect Hook
    ↓
productsAPI.getApprovedProducts()
    ↓
React Query Cache Check
    ↓
Supabase Query
    ↓
Data Cached (React Query)
    ↓
Component State Update
    ↓
UI Render
```

## Component Architecture

### Component Hierarchy

```
App
├── QueryProvider
│   └── AuthProvider
│       └── BrowserRouter
│           └── ComparisonProvider
│               └── Routes
│                   ├── Public Routes
│                   │   ├── Index (Homepage)
│                   │   ├── Tools
│                   │   ├── ProductDetail
│                   │   └── ...
│                   ├── Protected Routes
│                   │   ├── Dashboard
│                   │   ├── AddEquipment
│                   │   └── ...
│                   └── Admin Routes
│                       └── AdminDashboard
```

### Component Types

#### 1. **Page Components** (`client/pages/`)
- Top-level route components
- Handle data fetching
- Compose layout and feature components
- Examples: `NewIndex.tsx`, `ProductDetail.tsx`, `Tools.tsx`

#### 2. **Layout Components** (`client/components/`)
- Reusable layout structures
- Examples: `Navigation.tsx`, `Footer.tsx`

#### 3. **Feature Components** (`client/components/`)
- Business logic components
- Examples: `ToolCard.tsx`, `SearchDropdown.tsx`, `CostCalculator.tsx`

#### 4. **UI Components** (`client/components/ui/`)
- Reusable UI primitives (Radix UI wrappers)
- Examples: `button.tsx`, `dialog.tsx`, `input.tsx`

#### 5. **Dashboard Components** (`client/components/Dashboard/`)
- Admin and user dashboard specific components
- Examples: `AdminDashboard.tsx`, `UserDashboard.tsx`

## State Management

### 1. **Local State** (useState)
Used for:
- Form inputs
- UI state (modals, dropdowns, tabs)
- Component-specific data

```tsx
const [isOpen, setIsOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
```

### 2. **Context API**
Used for:
- **AuthContext**: Global authentication state
- **ComparisonContext**: Product comparison state

```tsx
// AuthContext provides:
- currentUser: User | null
- userProfile: UserProfile | null
- loading: boolean
- signIn, signUp, logout functions

// ComparisonContext provides:
- comparedProducts: Product[]
- addToComparison, removeFromComparison functions
```

### 3. **React Query** (TanStack Query)
Used for:
- Server state management
- Automatic caching
- Background refetching
- Optimistic updates

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['products', category],
  queryFn: () => productsAPI.getApprovedProducts({ category })
});
```

### 4. **URL State** (React Router)
Used for:
- Search parameters
- Route parameters
- Navigation state

```tsx
const [searchParams] = useSearchParams();
const category = searchParams.get('category');
```

## API Layer

The API layer (`client/lib/api.ts`) provides a clean abstraction over Supabase operations.

### API Structure

```typescript
export const productsAPI = {
  getApprovedProducts: async (filters) => { ... },
  getProductById: async (id) => { ... },
  createProduct: async (product) => { ... },
  updateProduct: async (id, updates) => { ... },
  deleteProduct: async (id) => { ... }
};

export const categoriesAPI = {
  getCategories: async () => { ... },
  getCategoryByName: async (name) => { ... },
  createCategory: async (category) => { ... },
  updateCategory: async (id, updates) => { ... },
  deleteCategory: async (id) => { ... }
};

export const reviewsAPI = {
  getProductReviews: async (productId) => { ... },
  addReview: async (review) => { ... },
  updateReview: async (id, updates) => { ... }
};

export const adminAPI = {
  getSubmissions: async () => { ... },
  approveSubmission: async (id) => { ... },
  rejectSubmission: async (id, reason) => { ... },
  getUsers: async () => { ... }
};
```

### API Design Principles

1. **Type Safety**: All functions are fully typed with TypeScript
2. **Error Handling**: Errors are thrown and caught at component level
3. **Optimized Queries**: Field selection for performance
4. **Consistent Interface**: Similar patterns across all APIs

## Routing Architecture

### Route Structure

```typescript
// Public Routes
/ → Homepage
/recherche → Search
/connexion → Login
/inscription → Signup
/outils → Tools Listing
/outil/:id → Product Detail
/categories → Categories Listing
/categorie/:categoryName → Category Page
/comparateur → Comparison
/profil/:ownerName → User Profile
/fournisseur/:compositeKey → Supplier Profile

// Protected User Routes
/dashboard → User Dashboard
/ajouter-equipement → Add Equipment
/mes-demandes → My Submissions
/favoris → Favorites
/mon-profil → User Profile Page

// Admin Routes
/admin-login → Admin Login
/admin → Admin Dashboard
/admin-dashboard → Admin Dashboard (alias)
```

### Protected Routes

The `ProtectedRoute` component handles:
- **User Authentication**: Checks Supabase Auth session
- **Admin Authorization**: Validates admin session via RPC
- **Loading States**: Shows loading spinner during validation
- **Redirects**: Redirects to login if unauthorized

```tsx
<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>
```

## Performance Optimizations

### 1. **Code Splitting**
- Route-based code splitting (React Router lazy loading)
- Component lazy loading for heavy components

### 2. **Image Optimization**
- Lazy loading with `LazyImage` component
- Responsive images with srcset
- Placeholder images during load

### 3. **React Query Caching**
- Automatic caching of API responses
- Background refetching
- Stale-while-revalidate pattern

### 4. **Memoization**
- `useMemo` for expensive computations
- `useCallback` for stable function references
- `React.memo` for component memoization

### 5. **Virtual Scrolling**
- `VirtualGrid` component for large lists
- Renders only visible items

### 6. **Bundle Optimization**
- Tree shaking (automatic with Vite)
- Dynamic imports for heavy libraries
- SWC for fast compilation

## Security Considerations

### 1. **Authentication**
- Supabase Auth handles password hashing
- JWT tokens stored securely
- Session management via Supabase

### 2. **Authorization**
- Row Level Security (RLS) on database
- Protected routes for sensitive pages
- Admin session validation

### 3. **Input Validation**
- Zod schemas for form validation
- TypeScript for type safety
- Sanitization on API layer

### 4. **XSS Prevention**
- React's automatic escaping
- No `dangerouslySetInnerHTML` usage
- Content Security Policy (CSP) headers

## Next Steps

- [Components Documentation](./03_FRONTEND_COMPONENTS.md)
- [Pages Documentation](./04_FRONTEND_PAGES.md)
- [State Management Details](./06_FRONTEND_STATE_MANAGEMENT.md)


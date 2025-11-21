# Frontend State Management

## Table of Contents
- [State Management Overview](#state-management-overview)
- [Local State](#local-state)
- [Context API](#context-api)
- [React Query](#react-query)
- [URL State](#url-state)
- [State Patterns](#state-patterns)

## State Management Overview

The application uses multiple state management strategies:

1. **Local State** (`useState`) - Component-specific state
2. **Context API** - Global application state
3. **React Query** - Server state and caching
4. **URL State** - Route parameters and query strings

## Local State

### useState Hook

Used for component-specific state:

```tsx
const [count, setCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: '', email: '' });
```

### Common Patterns

#### Form State
```tsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: ''
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};
```

#### Toggle State
```tsx
const [isOpen, setIsOpen] = useState(false);

const toggle = () => setIsOpen(prev => !prev);
```

#### Array State
```tsx
const [items, setItems] = useState([]);

const addItem = (item) => {
  setItems(prev => [...prev, item]);
};

const removeItem = (id) => {
  setItems(prev => prev.filter(item => item.id !== id));
};
```

## Context API

### AuthContext

**Location:** `client/contexts/AuthContext.tsx`

**Provides:**
- `currentUser`: Supabase User object
- `userProfile`: Extended user profile
- `loading`: Authentication loading state
- `signUp`: Registration function
- `signIn`: Login function
- `logout`: Logout function
- `updateUserProfile`: Update profile function
- `isAdmin`: Admin status

**Usage:**
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { currentUser, userProfile, signIn, logout } = useAuth();
  
  if (!currentUser) {
    return <LoginForm onLogin={signIn} />;
  }
  
  return <div>Welcome, {userProfile?.display_name}</div>;
}
```

**State Structure:**
```typescript
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isAdmin: boolean;
}
```

### ComparisonContext

**Location:** `client/contexts/ComparisonContext.tsx`

**Provides:**
- `comparedProducts`: Array of products being compared
- `addToComparison`: Add product to comparison
- `removeFromComparison`: Remove product from comparison
- `clearComparison`: Clear all compared products
- `isInComparison`: Check if product is in comparison

**Usage:**
```tsx
import { useComparison } from '../contexts/ComparisonContext';

function ProductCard({ product }) {
  const { addToComparison, isInComparison } = useComparison();
  const inComparison = isInComparison(product.id);
  
  return (
    <button onClick={() => addToComparison(product)}>
      {inComparison ? 'Remove from Comparison' : 'Add to Comparison'}
    </button>
  );
}
```

**State Structure:**
```typescript
interface ComparisonContextType {
  comparedProducts: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
}
```

## React Query

### Setup

**Location:** `client/providers/QueryProvider.tsx`

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### useQuery Hook

Fetch and cache data:

```tsx
import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '../lib/api';

function ProductsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', category],
    queryFn: () => productsAPI.getApprovedProducts({ category }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <ProductGrid products={data} />;
}
```

### useMutation Hook

Mutate data (create, update, delete):

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function AddProductForm() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (product) => productsAPI.createProduct(product),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added!');
    },
    onError: (error) => {
      toast.error('Failed to add product');
    },
  });
  
  const handleSubmit = (data) => {
    mutation.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Adding...' : 'Add Product'}
      </button>
    </form>
  );
}
```

### Query Keys

Organize query keys consistently:

```tsx
// Products
['products'] // All products
['products', category] // Products by category
['products', id] // Single product

// Categories
['categories'] // All categories
['categories', name] // Single category

// Reviews
['reviews', productId] // Reviews for product
```

### Optimistic Updates

Update UI before server responds:

```tsx
const mutation = useMutation({
  mutationFn: updateProduct,
  onMutate: async (newProduct) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['products', id] });
    
    // Snapshot previous value
    const previousProduct = queryClient.getQueryData(['products', id]);
    
    // Optimistically update
    queryClient.setQueryData(['products', id], newProduct);
    
    return { previousProduct };
  },
  onError: (err, newProduct, context) => {
    // Rollback on error
    queryClient.setQueryData(['products', id], context.previousProduct);
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['products', id] });
  },
});
```

## URL State

### Route Parameters

Access route parameters:

```tsx
import { useParams } from 'react-router-dom';

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  // Use id to fetch product
}
```

### Query Parameters

Read and update query parameters:

```tsx
import { useSearchParams } from 'react-router-dom';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  
  const updateFilters = (newFilters) => {
    setSearchParams({ ...Object.fromEntries(searchParams), ...newFilters });
  };
}
```

### Location State

Pass state when navigating:

```tsx
navigate('/dashboard', { state: { from: 'homepage' } });

// Access in destination
const location = useLocation();
const from = location.state?.from;
```

## State Patterns

### 1. **Lifted State**

Lift state to common parent:

```tsx
function Parent() {
  const [sharedState, setSharedState] = useState();
  
  return (
    <>
      <ChildA state={sharedState} setState={setSharedState} />
      <ChildB state={sharedState} setState={setSharedState} />
    </>
  );
}
```

### 2. **Derived State**

Compute state from other state:

```tsx
const [items, setItems] = useState([]);
const totalPrice = useMemo(() => 
  items.reduce((sum, item) => sum + item.price, 0),
  [items]
);
```

### 3. **State Initialization**

Initialize from localStorage:

```tsx
const [favorites, setFavorites] = useState(() => {
  const saved = localStorage.getItem('favorites');
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}, [favorites]);
```

### 4. **State Reset**

Reset state to initial values:

```tsx
const initialState = { name: '', email: '' };
const [formData, setFormData] = useState(initialState);

const resetForm = () => {
  setFormData(initialState);
};
```

### 5. **State Updates with Previous State**

Use functional updates:

```tsx
// ❌ Wrong
setCount(count + 1);

// ✅ Correct
setCount(prev => prev + 1);
```

## Best Practices

### 1. **Minimize State**

Only store what can't be computed:

```tsx
// ❌ Don't store computed values
const [fullName, setFullName] = useState('');

// ✅ Compute from source
const fullName = `${firstName} ${lastName}`;
```

### 2. **Normalize State**

Keep state normalized:

```tsx
// ❌ Nested state
const [products, setProducts] = useState([
  { id: 1, category: { id: 1, name: 'Tools' } }
]);

// ✅ Normalized state
const [products, setProducts] = useState([
  { id: 1, categoryId: 1 }
]);
const [categories, setCategories] = useState([
  { id: 1, name: 'Tools' }
]);
```

### 3. **Immutable Updates**

Always create new objects/arrays:

```tsx
// ❌ Mutating state
items.push(newItem);

// ✅ Immutable update
setItems(prev => [...prev, newItem]);
```

### 4. **Memoization**

Memoize expensive computations:

```tsx
const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);
```

### 5. **Error Boundaries**

Handle errors gracefully:

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorMessage />;
    }
    return this.props.children;
  }
}
```

## Next Steps

- [Styling Documentation](./07_FRONTEND_STYLING.md)
- [Backend Documentation](../docs/01_BACKEND_OVERVIEW.md)


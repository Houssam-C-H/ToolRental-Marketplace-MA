# Frontend Pages

## Table of Contents
- [Public Pages](#public-pages)
- [Protected User Pages](#protected-user-pages)
- [Admin Pages](#admin-pages)
- [Page Patterns](#page-patterns)

## Public Pages

### Homepage (`NewIndex.tsx`)
**Route:** `/`

**Features:**
- Hero section with search
- Featured categories
- Recommended products (smart recommendations)
- Recent products
- Category grid
- Statistics section
- SEO optimized (Organization, WebSite schemas)

**Data Fetching:**
- Products: `productsAPI.getApprovedProducts()`
- Categories: `categoriesAPI.getCategories()`
- Recommendations: `getSmartRecommendations()` (based on user profile)

**Key Components:**
- `Navigation`
- `ToolCard` (for products)
- `Footer`
- `SEOHead`

### Tools Listing (`Tools.tsx`)
**Route:** `/outils`

**Features:**
- Product grid with filters
- Category filter
- Location filter
- Price range filter
- Search functionality
- Pagination
- SEO optimized (BreadcrumbList schema)

**Query Parameters:**
- `category`: Filter by category
- `city`: Filter by city
- `minPrice`, `maxPrice`: Price range
- `search`: Search query

**Data Fetching:**
- `productsAPI.getApprovedProducts(filters)`

### Product Detail (`ProductDetail.tsx`)
**Route:** `/outil/:id`

**Features:**
- Product images (carousel)
- Product details (name, description, specs)
- Pricing information
- Location and contact info
- Delivery options
- Reviews and ratings
- Related products
- Add to comparison
- Add to favorites
- SEO optimized (Product, BreadcrumbList, FAQPage schemas)

**Data Fetching:**
- `productsAPI.getProductById(id)`
- `reviewsAPI.getProductReviews(productId)`
- Related products: `productsAPI.getApprovedProducts({ category, limit: 4 })`

**Key Components:**
- `LazyImage` (for product images)
- `UnifiedReviewSystem`
- `CostCalculator`
- `ToolComparison`

### Category Page (`CategoryPage.tsx`)
**Route:** `/categorie/:categoryName`

**Features:**
- Category hero image
- Category description
- Products in category
- Filters (location, price)
- SEO optimized (BreadcrumbList schema)

**Data Fetching:**
- `categoriesAPI.getCategoryByName(categoryName)`
- `productsAPI.getApprovedProducts({ category: categoryName })`

### Categories Listing (`Categories.tsx`)
**Route:** `/categories`

**Features:**
- Grid of all categories
- Category icons
- Product counts per category
- SEO optimized (BreadcrumbList schema)

**Data Fetching:**
- `categoriesAPI.getCategories()`

### Search (`Search.tsx`)
**Route:** `/recherche`

**Features:**
- Search results
- Search filters
- Result count
- Pagination
- SEO optimized (BreadcrumbList schema)

**Query Parameters:**
- `q`: Search query
- `category`: Category filter
- `city`: City filter

**Data Fetching:**
- `productsAPI.getApprovedProducts({ search: query, ...filters })`

### Comparison (`Comparison.tsx`)
**Route:** `/comparateur`

**Features:**
- Side-by-side product comparison
- Feature comparison table
- Add/remove products
- Clear comparison
- SEO optimized (BreadcrumbList schema)

**State Management:**
- Uses `ComparisonContext` for compared products

**Key Components:**
- `ToolComparison`

### Supplier Profile (`SupplierProfile.tsx`)
**Route:** `/fournisseur/:compositeKey`

**Features:**
- Supplier information
- Supplier's products
- Ratings and reviews
- Contact information
- SEO optimized (LocalBusiness, BreadcrumbList schemas)

**Data Fetching:**
- `suppliersAPI.getSupplierByCompositeKey(compositeKey)`
- `productsAPI.getApprovedProducts({ owner_user_id: supplier.user_id })`

### User Profile (`UserProfile.tsx`)
**Route:** `/profil/:ownerName`

**Features:**
- User profile information
- User's products
- Ratings and reviews

**Data Fetching:**
- User profile from `user_profiles` table
- Products: `productsAPI.getApprovedProducts({ owner_name: ownerName })`

### About (`About.tsx`)
**Route:** `/a-propos`

**Features:**
- Company information
- Mission and values
- Contact section
- SEO optimized (static meta tags)

### Privacy Policy (`Privacy.tsx`)
**Route:** `/politique-confidentialite`

**Features:**
- Privacy policy content
- SEO optimized

### Terms of Use (`Terms.tsx`)
**Route:** `/conditions-utilisation`

**Features:**
- Terms and conditions
- SEO optimized

### Login (`components/Auth/Login.tsx`)
**Route:** `/connexion`

**Features:**
- Email/password login
- Link to signup
- Link to password reset
- Error handling

**Authentication:**
- Uses `AuthContext.signIn()`

### Signup (`components/Auth/Signup.tsx`)
**Route:** `/inscription`

**Features:**
- Registration form
- Email validation
- Password strength
- Link to login

**Authentication:**
- Uses `AuthContext.signUp()`

### NotFound (`NotFound.tsx`)
**Route:** `*` (catch-all)

**Features:**
- 404 error page
- Link back to homepage

## Protected User Pages

### User Dashboard (`components/Dashboard/UserDashboard.tsx`)
**Route:** `/dashboard`

**Protection:** `ProtectedRoute` (requires authentication)

**Features:**
- Overview tab (statistics, recent activity)
- Submissions tab (user's submissions, status tracking)
- Products tab (user's approved products)

**Data Fetching:**
- `productSubmissionAPI.getUserSubmissions(userId)`
- `productsAPI.getApprovedProducts({ owner_user_id: userId })`

### Add Equipment (`AddEquipment.tsx`)
**Route:** `/ajouter-equipement`

**Protection:** `ProtectedRoute` (requires authentication)

**Features:**
- Product submission form
- Image upload (multiple images)
- Form validation
- Submission confirmation

**Submission:**
- `productSubmissionAPI.submit(submission, userId)`

### My Submissions (`MySubmissions.tsx`)
**Route:** `/mes-demandes`

**Protection:** `ProtectedRoute` (requires authentication)

**Features:**
- List of user's submissions
- Status tracking (pending, approved, rejected)
- Edit/delete submissions
- Resubmit rejected submissions

**Data Fetching:**
- `productSubmissionAPI.getUserSubmissions(userId)`

### Favorites (`Favorites.tsx`)
**Route:** `/favoris`

**Protection:** `ProtectedRoute` (requires authentication)

**Features:**
- List of favorited products
- Remove from favorites
- Link to product details

**Data Storage:**
- Favorites stored in `user_profiles.favorites` (JSON array)

### User Profile Page (`UserProfilePage.tsx`)
**Route:** `/mon-profil`

**Protection:** `ProtectedRoute` (requires authentication)

**Features:**
- Edit profile information
- Change password
- Profile photo upload
- Account settings

**Updates:**
- `AuthContext.updateUserProfile(updates)`

## Admin Pages

### Admin Login (`AdminLogin.tsx`)
**Route:** `/admin-login`

**Features:**
- Admin email/password login
- Session management
- Error handling

**Authentication:**
- Uses `adminSession.login(email, password)`
- Separate from Supabase Auth

### Admin Dashboard (`components/Dashboard/AdminDashboard.tsx`)
**Route:** `/admin` or `/admin-dashboard`

**Protection:** `ProtectedRoute requireAdmin={true}`

**Features:**
- Overview tab (statistics, recent activity)
- Submissions tab (approve/reject submissions)
- Products tab (manage all products)
- Users tab (user management)
- Categories tab (category management with image upload)

**Key Operations:**
- Approve/reject submissions
- Edit/delete products
- Manage users
- Create/edit/delete categories
- Upload category images (thumbnail & hero)

**Data Fetching:**
- `adminAPI.getSubmissions()`
- `productsAPI.getApprovedProducts()`
- `adminAPI.getUsers()`
- `categoriesAPI.getCategories()`

## Page Patterns

### 1. **Data Fetching Pattern**
Most pages follow this pattern:

```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, [dependencies]);
```

### 2. **SEO Pattern**
All public pages include SEO:

```tsx
<SEOHead
  title="Page Title"
  description="Page description"
  image="/og-image.jpg"
  url={location.pathname}
  type="website"
  schema={schemaObject}
/>
```

### 3. **Loading States**
Pages show loading states:

```tsx
{loading ? (
  <LoadingSpinner />
) : error ? (
  <ErrorMessage error={error} />
) : (
  <PageContent data={data} />
)}
```

### 4. **Error Handling**
Error boundaries and try-catch blocks:

```tsx
try {
  // API call
} catch (error) {
  toast.error('حدث خطأ');
  console.error(error);
}
```

### 5. **Responsive Design**
All pages are mobile-responsive:

```tsx
<div className="container mx-auto px-4 md:px-6 lg:px-8">
  {/* Content */}
</div>
```

## Next Steps

- [Routing Documentation](./05_FRONTEND_ROUTING.md)
- [State Management Documentation](./06_FRONTEND_STATE_MANAGEMENT.md)
- [Backend Documentation](../docs/01_BACKEND_OVERVIEW.md)


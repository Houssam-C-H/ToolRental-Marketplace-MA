# Backend API

## Table of Contents
- [API Overview](#api-overview)
- [API Modules](#api-modules)
- [API Functions](#api-functions)
- [Error Handling](#error-handling)
- [Query Optimization](#query-optimization)

## API Overview

The API layer (`client/lib/api.ts`) provides a clean abstraction over Supabase operations. All API functions are fully typed with TypeScript.

### API Structure

```typescript
export const productsAPI = { ... };
export const categoriesAPI = { ... };
export const reviewsAPI = { ... };
export const productSubmissionAPI = { ... };
export const adminAPI = { ... };
export const suppliersAPI = { ... };
```

## API Modules

### 1. productsAPI

Product/tool management operations.

#### getApprovedProducts(filters?)

Get approved products with optional filters.

**Parameters:**
```typescript
interface ProductFilters {
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  owner_user_id?: string;
  limit?: number;
  offset?: number;
}
```

**Returns:** `Promise<{ data: Product[], count: number }>`

**Example:**
```typescript
const { data, count } = await productsAPI.getApprovedProducts({
  category: 'معدات الحفر',
  city: 'الرباط',
  limit: 20
});
```

**Implementation:**
- Filters by `status !== 'hidden'`
- Supports category, city, price range, search
- Optimized field selection (`PRODUCT_LIST_FIELDS`)
- Pagination support

#### getProductById(id)

Get single product by ID.

**Parameters:** `id: string`

**Returns:** `Promise<Product>`

**Example:**
```typescript
const product = await productsAPI.getProductById('550e8400-e29b-41d4-a716-446655440000');
```

#### createProduct(product)

Create new product (admin only, via submission approval).

**Parameters:** `product: Omit<Product, 'id' | 'created_at' | 'updated_at'>`

**Returns:** `Promise<Product>`

#### updateProduct(id, updates)

Update product.

**Parameters:**
- `id: string`
- `updates: Partial<Product>`

**Returns:** `Promise<Product>`

#### deleteProduct(id)

Delete product (soft delete by setting status to 'hidden').

**Parameters:** `id: string`

**Returns:** `Promise<void>`

### 2. categoriesAPI

Category management operations.

#### getCategories()

Get all active categories.

**Returns:** `Promise<Category[]>`

**Example:**
```typescript
const categories = await categoriesAPI.getCategories();
// Returns categories sorted by display_order
```

**Implementation:**
- Filters `is_active !== false`
- Sorted by `display_order`
- Includes product counts

#### getCategoryByName(name)

Get category by name.

**Parameters:** `name: string`

**Returns:** `Promise<Category | null>`

#### createCategory(category)

Create category (admin only, via RPC).

**Parameters:** `category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'product_count'>`

**Returns:** `Promise<Category>`

**Implementation:**
- Calls RPC function: `admin_create_category()`
- Validates admin session first
- Bypasses RLS using `SECURITY DEFINER`

#### updateCategory(id, updates)

Update category (admin only, via RPC).

**Parameters:**
- `id: string`
- `updates: Partial<Category>`

**Returns:** `Promise<Category>`

**Implementation:**
- Calls RPC function: `admin_update_category()`
- Validates admin session first

#### deleteCategory(id)

Delete category (soft delete, admin only, via RPC).

**Parameters:** `id: string`

**Returns:** `Promise<void>`

**Implementation:**
- Calls RPC function: `admin_delete_category()`
- Sets `is_active = false`
- Validates admin session first

### 3. reviewsAPI

Review management operations.

#### getProductReviews(productId)

Get reviews for a product.

**Parameters:** `productId: string`

**Returns:** `Promise<Review[]>`

**Example:**
```typescript
const reviews = await reviewsAPI.getProductReviews('550e8400-e29b-41d4-a716-446655440000');
```

**Implementation:**
- Filters by `product_id`
- Sorted by `created_at DESC`
- Only non-deleted reviews

#### addReview(review)

Add review to product.

**Parameters:**
```typescript
interface ReviewInput {
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5
  comment?: string;
}
```

**Returns:** `Promise<Review>`

#### updateReview(id, updates)

Update review.

**Parameters:**
- `id: string`
- `updates: { rating?: number; comment?: string }`

**Returns:** `Promise<Review>`

#### deleteReview(id)

Delete review (soft delete).

**Parameters:** `id: string`

**Returns:** `Promise<void>`

### 4. productSubmissionAPI

Product submission management.

#### submit(submission, userId)

Submit product for admin review.

**Parameters:**
- `submission: Omit<ProductSubmission, 'id' | 'status' | 'submitted_at'>`
- `userId: string`

**Returns:** `Promise<ProductSubmission>`

**Example:**
```typescript
const submission = await productSubmissionAPI.submit({
  product_data: {
    toolName: 'مثقاب كهربائي',
    category: 'معدات الحفر',
    // ... other fields
  },
  request_state: 'add'
}, userId);
```

#### getUserSubmissions(userId)

Get user's submissions.

**Parameters:** `userId: string`

**Returns:** `Promise<ProductSubmission[]>`

**Implementation:**
- Filters by `user_id`
- Sorted by `submitted_at DESC`

#### getSubmission(id)

Get submission by ID.

**Parameters:** `id: string`

**Returns:** `Promise<ProductSubmission>`

#### updateSubmission(id, submission)

Update submission (resubmit).

**Parameters:**
- `id: string`
- `submission: Omit<ProductSubmission, 'id' | 'status' | 'submitted_at'>`

**Returns:** `Promise<ProductSubmission>`

#### deleteSubmission(id)

Delete submission.

**Parameters:** `id: string`

**Returns:** `Promise<void>`

### 5. adminAPI

Admin operations (requires admin authentication).

#### getSubmissions()

Get all submissions (admin only).

**Returns:** `Promise<ProductSubmission[]>`

**Implementation:**
- Requires admin session validation
- Returns all submissions (pending, approved, rejected)
- Sorted by `submitted_at DESC`

#### approveSubmission(id)

Approve submission and create product.

**Parameters:** `id: string`

**Returns:** `Promise<Product>`

**Implementation:**
1. Validates admin session
2. Gets submission
3. Creates product from submission data
4. Updates submission status to 'approved'
5. Returns created product

#### rejectSubmission(id, reason)

Reject submission.

**Parameters:**
- `id: string`
- `reason: string`

**Returns:** `Promise<void>`

**Implementation:**
1. Validates admin session
2. Updates submission status to 'rejected'
3. Sets `admin_notes` to reason

#### getUsers()

Get all users (admin only).

**Returns:** `Promise<UserProfile[]>`

**Implementation:**
- Requires admin session validation
- Returns all user profiles

### 6. suppliersAPI

Supplier profile operations.

#### getSupplierByCompositeKey(compositeKey)

Get supplier by composite key.

**Parameters:** `compositeKey: string` (format: `{userId}-{ownerName}`)

**Returns:** `Promise<Supplier | null>`

**Implementation:**
- Parses composite key
- Looks up by `user_id` or `display_name`

#### getSupplierByUserId(userId)

Get supplier by user ID.

**Parameters:** `userId: string`

**Returns:** `Promise<Supplier | null>`

## Error Handling

### Error Types

API functions throw errors that should be caught at the component level:

```typescript
try {
  const product = await productsAPI.getProductById(id);
} catch (error) {
  console.error('Error fetching product:', error);
  toast.error('فشل تحميل المنتج');
}
```

### Common Errors

1. **Network Errors**: Connection issues
2. **Authentication Errors**: Invalid session
3. **Authorization Errors**: Insufficient permissions
4. **Validation Errors**: Invalid data
5. **Not Found Errors**: Resource doesn't exist

### Error Handling Pattern

```typescript
async function fetchData() {
  try {
    setLoading(true);
    const data = await api.getData();
    setData(data);
  } catch (error) {
    console.error(error);
    setError(error.message);
    toast.error('حدث خطأ');
  } finally {
    setLoading(false);
  }
}
```

## Query Optimization

### Field Selection

API functions use optimized field sets:

```typescript
const PRODUCT_LIST_FIELDS = "id, name, description, category, brand, model, condition, daily_price, city, neighborhood, images, owner_name, owner_user_id, rating, reviews_count, status, created_at, updated_at";

const PRODUCT_DETAIL_FIELDS = "*";
```

**Benefits:**
- Reduced payload size
- Faster queries
- Lower bandwidth usage

### Pagination

Products API supports pagination:

```typescript
const { data, count } = await productsAPI.getApprovedProducts({
  limit: 20,
  offset: 0
});
```

### Filtering

Efficient filtering using Supabase query builder:

```typescript
let query = supabase
  .from('products')
  .select('*', { count: 'exact' })
  .neq('status', 'hidden');

if (category) {
  query = query.eq('category', category);
}

if (city) {
  query = query.eq('city', city);
}
```

### Indexing

Database indexes optimize common queries:
- `category`: Filter by category
- `city`: Filter by city
- `status`: Filter by status
- `owner_user_id`: User's products
- `created_at DESC`: Recent products

## Next Steps

- [Authentication Documentation](./04_BACKEND_AUTHENTICATION.md)
- [Security Documentation](./05_BACKEND_SECURITY.md)
- [RPC Functions Documentation](./06_BACKEND_RPC_FUNCTIONS.md)


# Backend Database

## Table of Contents
- [Database Schema](#database-schema)
- [Tables](#tables)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Triggers](#triggers)
- [Data Types](#data-types)

## Database Schema

The database is PostgreSQL, managed by Supabase. The complete schema is defined in `complete_database_schema.sql`.

### Schema Overview

```
user_profiles
  ├── products (owner_user_id)
  ├── product_submissions (user_id)
  └── suppliers (user_id)

admin_users
  └── admin_sessions (admin_id)

categories
  └── products (category)

products
  └── anonymous_reviews (product_id)
```

## Tables

### 1. user_profiles

User account information (linked to Supabase Auth).

**Columns:**
- `id` (UUID, PK): References `auth.users(id)`
- `email` (TEXT, UNIQUE): User email
- `display_name` (TEXT): User display name
- `phone` (TEXT): Phone number
- `profile_photo` (TEXT): Profile photo URL
- `description` (TEXT): User description
- `location` (TEXT): User location
- `city` (TEXT): User city
- `specialties` (TEXT[]): Array of specialties
- `response_time` (TEXT): Response time
- `is_admin` (BOOLEAN): Admin status (default: false)
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `last_login` (TIMESTAMPTZ): Last login timestamp
- `total_products` (INTEGER): Product count
- `average_rating` (NUMERIC): Average rating
- `total_reviews` (INTEGER): Review count
- `product_categories` (TEXT[]): Categories user has products in
- `last_product_update` (TIMESTAMPTZ): Last product update

**Indexes:**
- `idx_user_profiles_email`: On `email`
- `idx_user_profiles_is_admin`: On `is_admin`

**RLS Policies:**
- Users can read own profile
- Users can update own profile
- Public can read profiles

### 2. admin_users

Admin accounts (separate from Supabase Auth).

**Columns:**
- `id` (UUID, PK): Admin ID
- `email` (TEXT, UNIQUE): Admin email
- `name` (TEXT): Admin name
- `password_hash` (TEXT): Hashed password (bcrypt)
- `role` (TEXT): 'admin' or 'super_admin'
- `is_active` (BOOLEAN): Active status
- `failed_login_attempts` (INTEGER): Failed login count
- `last_login` (TIMESTAMPTZ): Last login timestamp
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Update timestamp

**Indexes:**
- `idx_admin_users_email`: On `email`
- `idx_admin_users_is_active`: On `is_active`

**RLS Policies:**
- Block direct access (all operations via RPC)

### 3. admin_sessions

Admin session tokens.

**Columns:**
- `id` (UUID, PK): Session ID
- `admin_id` (UUID, FK): References `admin_users(id)`
- `session_token` (TEXT, UNIQUE): Session token
- `expires_at` (TIMESTAMPTZ): Expiration timestamp
- `ip_address` (TEXT): Client IP
- `user_agent` (TEXT): User agent
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `last_used_at` (TIMESTAMPTZ): Last use timestamp

**Indexes:**
- `idx_admin_sessions_token`: On `session_token`
- `idx_admin_sessions_admin_id`: On `admin_id`
- `idx_admin_sessions_expires`: On `expires_at`

**RLS Policies:**
- Block direct access (all operations via RPC)

### 4. products

Product/tool listings.

**Columns:**
- `id` (UUID, PK): Product ID
- `name` (TEXT): Product name
- `description` (TEXT): Product description
- `category` (TEXT): Category name
- `brand` (TEXT): Brand name
- `model` (TEXT): Model name
- `condition` (TEXT): Condition (new, used, etc.)
- `specifications` (TEXT): Product specifications
- `daily_price` (NUMERIC): Daily rental price
- `city` (TEXT): City location
- `neighborhood` (TEXT): Neighborhood
- `contact_phone` (TEXT): Contact phone
- `contact_whatsapp` (TEXT): WhatsApp number
- `has_delivery` (BOOLEAN): Delivery available
- `delivery_price` (NUMERIC): Delivery price
- `delivery_notes` (TEXT): Delivery notes
- `images` (TEXT[]): Array of image URLs
- `owner_name` (TEXT): Owner name
- `owner_user_id` (UUID, FK): References `user_profiles(id)`
- `rating` (NUMERIC): Average rating
- `reviews_count` (INTEGER): Review count
- `status` (TEXT): Status (active, hidden, etc.)
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Update timestamp
- `first_image` (TEXT): First image URL (computed)
- `image_count` (INTEGER): Image count (computed)

**Indexes:**
- `idx_products_category`: On `category`
- `idx_products_city`: On `city`
- `idx_products_status`: On `status`
- `idx_products_owner_user_id`: On `owner_user_id`
- `idx_products_created_at`: On `created_at DESC`
- `idx_products_daily_price`: On `daily_price`

**RLS Policies:**
- Public can read products
- Users can insert products (own products)
- Users can update own products

### 5. product_submissions

Product submission requests for admin review.

**Columns:**
- `id` (UUID, PK): Submission ID
- `user_id` (UUID, FK): References `user_profiles(id)`
- `product_data` (JSONB): Product data (from form)
- `status` (TEXT): Status (pending, approved, rejected)
- `request_state` (TEXT): Request type (add, modify, delete)
- `admin_notes` (TEXT): Admin notes
- `submitted_at` (TIMESTAMPTZ): Submission timestamp
- `reviewed_at` (TIMESTAMPTZ): Review timestamp
- `reviewed_by` (UUID): Admin who reviewed

**Indexes:**
- `idx_product_submissions_user_id`: On `user_id`
- `idx_product_submissions_status`: On `status`
- `idx_product_submissions_submitted_at`: On `submitted_at DESC`

**RLS Policies:**
- Users can insert own submissions
- Users can read own submissions
- Admin access via RPC functions

### 6. anonymous_reviews

Product reviews (anonymous or authenticated).

**Columns:**
- `id` (UUID, PK): Review ID
- `product_id` (UUID, FK): References `products(id)`
- `reviewer_name` (TEXT): Reviewer name (optional)
- `reviewer_email` (TEXT): Reviewer email (optional)
- `reviewer_phone` (TEXT): Reviewer phone (optional)
- `rating` (INTEGER): Rating (1-5)
- `comment` (TEXT): Review comment
- `is_verified` (BOOLEAN): Verification status
- `verification_token` (TEXT): Verification token
- `ip_address` (TEXT): IP address
- `user_agent` (TEXT): User agent
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Update timestamp
- `is_deleted` (BOOLEAN): Soft delete flag
- `deleted_at` (TIMESTAMPTZ): Deletion timestamp

**Indexes:**
- `idx_anonymous_reviews_product_id`: On `product_id`
- `idx_anonymous_reviews_created_at`: On `created_at DESC`

**RLS Policies:**
- Public can read reviews (non-deleted)
- Public can insert reviews

### 7. categories

Product categories.

**Columns:**
- `id` (UUID, PK): Category ID
- `name` (TEXT, UNIQUE): Category name (Arabic)
- `name_en` (TEXT): Category name (English)
- `icon_name` (TEXT): Icon identifier
- `image_url` (TEXT): Thumbnail image URL (75×75)
- `hero_image_url` (TEXT): Hero/banner image URL (1200×400)
- `display_order` (INTEGER): Display order
- `is_active` (BOOLEAN): Active status
- `product_count` (INTEGER): Product count (computed)
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Update timestamp

**Indexes:**
- `idx_categories_name`: On `name`
- `idx_categories_is_active`: On `is_active`
- `idx_categories_display_order`: On `display_order`

**RLS Policies:**
- Public can read categories
- Admin operations via RPC functions

### 8. suppliers

Supplier profiles (denormalized from user_profiles).

**Columns:**
- `id` (UUID, PK): Supplier ID
- `user_id` (UUID, FK, UNIQUE): References `user_profiles(id)`
- `display_name` (TEXT): Display name
- `email` (TEXT): Email
- `phone` (TEXT): Phone
- `profile_photo` (TEXT): Profile photo URL
- `description` (TEXT): Description
- `location` (TEXT): Location
- `specialties` (TEXT[]): Specialties array
- `response_time` (TEXT): Response time
- `is_verified` (BOOLEAN): Verification status
- `is_active` (BOOLEAN): Active status
- `total_products` (INTEGER): Product count
- `average_rating` (NUMERIC): Average rating
- `total_reviews` (INTEGER): Review count
- `product_categories` (TEXT[]): Categories
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Update timestamp
- `last_product_update` (TIMESTAMPTZ): Last product update

**Indexes:**
- `idx_suppliers_user_id`: On `user_id`
- `idx_suppliers_is_active`: On `is_active`
- `idx_suppliers_total_products`: On `total_products DESC`

**RLS Policies:**
- Public can read suppliers (active only)
- Users can update own supplier

## Relationships

### Foreign Keys

1. **products.owner_user_id** → `user_profiles.id`
   - ON DELETE SET NULL
   - Users can have many products

2. **product_submissions.user_id** → `user_profiles.id`
   - ON DELETE CASCADE
   - Users can have many submissions

3. **admin_sessions.admin_id** → `admin_users.id`
   - ON DELETE CASCADE
   - Admins can have many sessions

4. **anonymous_reviews.product_id** → `products.id`
   - ON DELETE CASCADE
   - Products can have many reviews

5. **suppliers.user_id** → `user_profiles.id`
   - ON DELETE CASCADE
   - One-to-one relationship

## Indexes

Indexes are created for performance optimization:

### User Profiles
- `email`: Fast email lookups
- `is_admin`: Fast admin queries

### Products
- `category`: Filter by category
- `city`: Filter by city
- `status`: Filter by status
- `owner_user_id`: User's products
- `created_at DESC`: Recent products
- `daily_price`: Price filtering

### Submissions
- `user_id`: User's submissions
- `status`: Filter by status
- `submitted_at DESC`: Recent submissions

### Reviews
- `product_id`: Product reviews
- `created_at DESC`: Recent reviews

### Categories
- `name`: Category lookup
- `is_active`: Active categories
- `display_order`: Sorted display

## Triggers

### Auto-create User Profile

**Function:** `handle_new_user()`

**Trigger:** On `auth.users` INSERT

**Action:** Automatically creates `user_profiles` record when user signs up

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Data Types

### Common Types

- **UUID**: Unique identifiers (primary keys)
- **TEXT**: Variable-length strings
- **NUMERIC**: Decimal numbers (prices, ratings)
- **INTEGER**: Whole numbers (counts, IDs)
- **BOOLEAN**: True/false values
- **TIMESTAMPTZ**: Timestamps with timezone
- **TEXT[]**: Array of text values
- **JSONB**: JSON data (product_submissions.product_data)

### Status Values

**Product Status:**
- `active`: Product is active and visible
- `hidden`: Product is hidden from public
- `pending`: Product pending approval

**Submission Status:**
- `pending`: Awaiting admin review
- `approved`: Approved by admin
- `rejected`: Rejected by admin

**Request State:**
- `add`: New product submission
- `modify`: Product modification request
- `delete`: Product deletion request

## Next Steps

- [API Documentation](./03_BACKEND_API.md)
- [Authentication Documentation](./04_BACKEND_AUTHENTICATION.md)
- [Security Documentation](./05_BACKEND_SECURITY.md)


# Backend Overview

## Table of Contents
- [Introduction](#introduction)
- [Technology Stack](#technology-stack)
- [Supabase Setup](#supabase-setup)
- [Architecture](#architecture)
- [Database Overview](#database-overview)
- [API Layer](#api-layer)

## Introduction

The backend of the Ajir Tool Rental Marketplace is built on **Supabase**, a Backend-as-a-Service (BaaS) platform that provides:

- **PostgreSQL Database**: Relational database with Row Level Security (RLS)
- **Authentication**: User authentication and authorization
- **Storage**: File storage for images
- **Real-time**: Real-time subscriptions (optional)
- **Edge Functions**: Serverless functions (optional)

### Key Features
- **Row Level Security (RLS)**: Database-level access control
- **Admin Authentication**: Separate admin authentication system
- **RPC Functions**: Stored procedures for privileged operations
- **Image Storage**: Supabase Storage for product and category images
- **Type Safety**: Full TypeScript types for database schema

## Technology Stack

### Core Technologies
- **Supabase**: Backend platform
- **PostgreSQL**: Database (via Supabase)
- **PostgREST**: REST API (automatic from Supabase)
- **Supabase JS Client**: JavaScript/TypeScript client library

### Database Features
- **Row Level Security (RLS)**: Fine-grained access control
- **Triggers**: Automatic data updates
- **Functions**: Stored procedures (PL/pgSQL)
- **Indexes**: Performance optimization
- **Foreign Keys**: Referential integrity

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Environment Variables

Set these in your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_ADMIN_EMAIL=your-admin-email@example.com
```

### 3. Database Setup

Run the database schema script:

1. Open Supabase SQL Editor
2. Run `complete_database_schema.sql`
3. Run `admin_category_rpc_functions.sql` (for admin category operations)

### 4. Storage Setup

Create storage buckets:

1. Go to Storage in Supabase dashboard
2. Create bucket: `product-images` (public)
3. Create bucket: `category-images` (public)
4. Set up bucket policies (allow public read)

## Architecture

### Backend Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
├─────────────────────────────────────────┤
│  API Layer (lib/api.ts)                │
│  ├── productsAPI                       │
│  ├── categoriesAPI                     │
│  ├── reviewsAPI                       │
│  ├── adminAPI                          │
│  └── suppliersAPI                      │
├─────────────────────────────────────────┤
│  Supabase Client (lib/supabase.ts)     │
├─────────────────────────────────────────┤
│  Supabase Platform                     │
│  ├── PostgreSQL Database               │
│  ├── Authentication                   │
│  ├── Storage                           │
│  └── RPC Functions                     │
└─────────────────────────────────────────┘
```

### Data Flow

```
Frontend Component
    ↓
API Function (lib/api.ts)
    ↓
Supabase Client
    ↓
Supabase Platform
    ├── Database (PostgreSQL)
    ├── Auth (Supabase Auth)
    └── Storage (Supabase Storage)
    ↓
Response Data
    ↓
Frontend Component
```

## Database Overview

### Tables

1. **user_profiles**: User account information
2. **admin_users**: Admin accounts (separate from Supabase Auth)
3. **admin_sessions**: Admin session tokens
4. **products**: Product/tool listings
5. **product_submissions**: Product submission requests
6. **anonymous_reviews**: Product reviews
7. **categories**: Product categories
8. **suppliers**: Supplier profiles (denormalized from user_profiles)

### Relationships

```
user_profiles (1) ──< (many) products
user_profiles (1) ──< (many) product_submissions
products (1) ──< (many) anonymous_reviews
categories (1) ──< (many) products
user_profiles (1) ── (1) suppliers
```

### Key Features

- **Row Level Security**: All tables have RLS enabled
- **Foreign Keys**: Referential integrity enforced
- **Indexes**: Optimized queries
- **Triggers**: Automatic data updates

## API Layer

### Location: `client/lib/api.ts`

The API layer provides a clean abstraction over Supabase operations.

### API Modules

#### 1. **productsAPI**
- `getApprovedProducts(filters)`: Get approved products with filters
- `getProductById(id)`: Get single product
- `createProduct(product)`: Create new product
- `updateProduct(id, updates)`: Update product
- `deleteProduct(id)`: Delete product

#### 2. **categoriesAPI**
- `getCategories()`: Get all categories
- `getCategoryByName(name)`: Get category by name
- `createCategory(category)`: Create category (admin only, via RPC)
- `updateCategory(id, updates)`: Update category (admin only, via RPC)
- `deleteCategory(id)`: Delete category (admin only, via RPC)

#### 3. **reviewsAPI**
- `getProductReviews(productId)`: Get reviews for product
- `addReview(review)`: Add review
- `updateReview(id, updates)`: Update review
- `deleteReview(id)`: Delete review

#### 4. **productSubmissionAPI**
- `submit(submission, userId)`: Submit product for review
- `getUserSubmissions(userId)`: Get user's submissions
- `getSubmission(id)`: Get submission by ID
- `updateSubmission(id, updates)`: Update submission
- `deleteSubmission(id)`: Delete submission

#### 5. **adminAPI**
- `getSubmissions()`: Get all submissions (admin only)
- `approveSubmission(id)`: Approve submission
- `rejectSubmission(id, reason)`: Reject submission
- `getUsers()`: Get all users (admin only)

#### 6. **suppliersAPI**
- `getSupplierByCompositeKey(key)`: Get supplier by composite key
- `getSupplierByUserId(userId)`: Get supplier by user ID

### API Design Principles

1. **Type Safety**: All functions fully typed
2. **Error Handling**: Errors thrown for component-level handling
3. **Optimized Queries**: Field selection for performance
4. **Consistent Interface**: Similar patterns across all APIs

## Authentication

### User Authentication

Uses **Supabase Auth**:
- Email/password authentication
- JWT tokens
- Session management
- Password reset
- Email verification (optional)

### Admin Authentication

Separate system using:
- `admin_users` table
- `admin_sessions` table
- RPC function: `admin_authenticate()`
- Session token validation

See [Backend Authentication Documentation](./04_BACKEND_AUTHENTICATION.md) for details.

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- **Public Read**: Products, categories, reviews
- **User Write**: Users can create/update own data
- **Admin Access**: Admin-only operations via RPC functions

### API Security

- **Anon Key**: Public operations (read products, create reviews)
- **Service Role Key**: Admin operations (not exposed to frontend)
- **RPC Functions**: Privileged operations with `SECURITY DEFINER`

See [Backend Security Documentation](./05_BACKEND_SECURITY.md) for details.

## Next Steps

- [Database Documentation](./02_BACKEND_DATABASE.md)
- [API Documentation](./03_BACKEND_API.md)
- [Authentication Documentation](./04_BACKEND_AUTHENTICATION.md)
- [Security Documentation](./05_BACKEND_SECURITY.md)
- [RPC Functions Documentation](./06_BACKEND_RPC_FUNCTIONS.md)


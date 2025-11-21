# Backend Security

## Table of Contents
- [Security Overview](#security-overview)
- [Row Level Security (RLS)](#row-level-security-rls)
- [RLS Policies](#rls-policies)
- [API Security](#api-security)
- [Data Validation](#data-validation)
- [Best Practices](#best-practices)

## Security Overview

The application implements multiple layers of security:

1. **Row Level Security (RLS)**: Database-level access control
2. **API Authentication**: User and admin authentication
3. **RPC Functions**: Privileged operations with `SECURITY DEFINER`
4. **Input Validation**: Data validation at API layer
5. **HTTPS**: Encrypted connections

## Row Level Security (RLS)

### What is RLS?

Row Level Security is a PostgreSQL feature that restricts access to rows in a table based on policies. It's enabled on all tables in the database.

### RLS Status

All tables have RLS enabled:

```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_submissions ENABLE ROW LEVEL SECURITY;
-- ... etc
```

### How RLS Works

1. **Policy Evaluation**: Before any query, PostgreSQL evaluates RLS policies
2. **Access Control**: Policies determine which rows are visible/modifiable
3. **User Context**: Uses `auth.uid()` to identify current user
4. **Automatic Filtering**: Rows are automatically filtered based on policies

## RLS Policies

### user_profiles Policies

```sql
-- Users can read own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Public can read profiles
CREATE POLICY "Public can read profiles"
  ON user_profiles FOR SELECT
  USING (true);
```

**Access:**
- ✅ Users can read/update own profile
- ✅ Public can read all profiles
- ❌ Users cannot update other profiles

### products Policies

```sql
-- Public can read products
CREATE POLICY "Public can read products"
  ON products FOR SELECT
  USING (true);

-- Users can insert products
CREATE POLICY "Users can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

-- Users can update own products
CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = owner_user_id);
```

**Access:**
- ✅ Public can read all products
- ✅ Users can create products (with `owner_user_id` = their ID)
- ✅ Users can update own products
- ❌ Users cannot update other users' products

### product_submissions Policies

```sql
-- Users can insert own submissions
CREATE POLICY "Users can insert own submissions"
  ON product_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read own submissions
CREATE POLICY "Users can read own submissions"
  ON product_submissions FOR SELECT
  USING (auth.uid() = user_id);
```

**Access:**
- ✅ Users can create submissions (with `user_id` = their ID)
- ✅ Users can read own submissions
- ❌ Users cannot read other users' submissions
- ⚠️ Admin access via RPC functions (bypasses RLS)

### admin_users Policies

```sql
-- Block direct access
CREATE POLICY "Block direct access"
  ON admin_users FOR ALL
  USING (false);
```

**Access:**
- ❌ No direct access (all operations via RPC)
- ✅ Admin operations via `admin_authenticate()` RPC

### anonymous_reviews Policies

```sql
-- Public can read reviews (non-deleted)
CREATE POLICY "Public can read reviews"
  ON anonymous_reviews FOR SELECT
  USING (is_deleted = false);

-- Public can insert reviews
CREATE POLICY "Public can insert reviews"
  ON anonymous_reviews FOR INSERT
  WITH CHECK (true);
```

**Access:**
- ✅ Public can read non-deleted reviews
- ✅ Public can create reviews
- ❌ No update/delete via direct access

### categories Policies

```sql
-- Public can read categories
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);
```

**Access:**
- ✅ Public can read categories
- ⚠️ Admin create/update/delete via RPC functions

## API Security

### Authentication

**User Authentication:**
- Supabase Auth (JWT tokens)
- Tokens validated on each request
- Automatic token refresh

**Admin Authentication:**
- Custom system with session tokens
- Validated via RPC function
- Stored in localStorage (consider httpOnly cookies)

### Authorization

**User Operations:**
- Can only modify own data
- RLS policies enforce this

**Admin Operations:**
- Require admin session validation
- Use RPC functions with `SECURITY DEFINER`
- Bypass RLS for admin operations

### API Keys

**Anon Key:**
- Public operations (read products, create reviews)
- Exposed in frontend code
- Limited by RLS policies

**Service Role Key:**
- Full database access
- ⚠️ **NEVER** expose to frontend
- Only use in server-side code or RPC functions

### RPC Functions with SECURITY DEFINER

RPC functions can bypass RLS using `SECURITY DEFINER`:

```sql
CREATE OR REPLACE FUNCTION admin_create_category(...)
RETURNS categories
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with function creator's privileges
AS $$
BEGIN
  -- Check admin status
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Insert category (bypasses RLS)
  INSERT INTO categories (...) VALUES (...);
END;
$$;
```

**Security Considerations:**
- Always validate admin status inside function
- Don't trust client input
- Use parameterized queries

## Data Validation

### Input Validation

**Frontend:**
- Form validation (React Hook Form + Zod)
- Type checking (TypeScript)

**Backend:**
- RLS policies prevent unauthorized access
- Database constraints (NOT NULL, UNIQUE, CHECK)
- RPC function validation

### SQL Injection Prevention

**Supabase Client:**
- Uses parameterized queries automatically
- No raw SQL strings

**Example:**
```typescript
// ✅ Safe (parameterized)
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId); // Parameterized

// ❌ Never do this (even though Supabase prevents it)
// const query = `SELECT * FROM products WHERE id = '${productId}'`;
```

### XSS Prevention

**Frontend:**
- React automatically escapes content
- No `dangerouslySetInnerHTML` usage
- Content Security Policy (CSP) headers

### CSRF Protection

**Supabase:**
- JWT tokens prevent CSRF
- Tokens stored in memory/localStorage
- Consider httpOnly cookies for production

## Best Practices

### 1. **Principle of Least Privilege**

- Users can only access their own data
- Admins have elevated privileges only when needed
- RLS policies enforce this

### 2. **Defense in Depth**

- Multiple security layers:
  - RLS policies
  - API authentication
  - Input validation
  - Database constraints

### 3. **Secure Password Storage**

- Never store plain text passwords
- Use bcrypt (Supabase handles this)
- Strong password requirements

### 4. **Session Management**

- Short session expiration times
- Secure token storage
- Automatic session cleanup

### 5. **Error Handling**

- Don't expose sensitive information in errors
- Log errors server-side
- Generic error messages to users

### 6. **HTTPS Only**

- All connections over HTTPS
- HSTS headers
- Secure cookies

### 7. **Regular Security Audits**

- Review RLS policies regularly
- Check for unused RPC functions
- Monitor for suspicious activity

### 8. **Environment Variables**

- Never commit secrets to git
- Use environment variables
- Rotate keys regularly

## Security Checklist

### Database
- [x] RLS enabled on all tables
- [x] Policies defined for all operations
- [x] Foreign keys for referential integrity
- [x] Indexes for performance
- [x] Constraints (NOT NULL, UNIQUE, CHECK)

### Authentication
- [x] User authentication (Supabase Auth)
- [x] Admin authentication (custom system)
- [x] Password hashing (bcrypt)
- [x] Session management
- [x] Account lockout (admin)

### API
- [x] Input validation
- [x] Type safety (TypeScript)
- [x] Error handling
- [x] Rate limiting (consider adding)

### Frontend
- [x] XSS prevention (React escaping)
- [x] CSRF protection (JWT tokens)
- [x] Secure storage (localStorage for tokens)
- [x] HTTPS only

## Next Steps

- [RPC Functions Documentation](./06_BACKEND_RPC_FUNCTIONS.md)
- [Database Documentation](./02_BACKEND_DATABASE.md)


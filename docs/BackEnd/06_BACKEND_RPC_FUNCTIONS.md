# Backend RPC Functions

## Table of Contents
- [RPC Functions Overview](#rpc-functions-overview)
- [Admin Authentication Functions](#admin-authentication-functions)
- [Admin Category Functions](#admin-category-functions)
- [Function Security](#function-security)
- [Creating New RPC Functions](#creating-new-rpc-functions)

## RPC Functions Overview

RPC (Remote Procedure Call) functions are PostgreSQL stored procedures that can be called from the Supabase client. They're useful for:

- **Privileged Operations**: Bypass RLS with `SECURITY DEFINER`
- **Complex Logic**: Multi-step operations
- **Data Validation**: Server-side validation
- **Performance**: Execute on database server

### Calling RPC Functions

```typescript
const { data, error } = await supabase.rpc('function_name', {
  param1: value1,
  param2: value2
});
```

## Admin Authentication Functions

### admin_authenticate()

Authenticate admin user and create session.

**Location:** `complete_database_schema.sql`

**Parameters:**
- `admin_email` (TEXT): Admin email
- `password` (TEXT): Admin password
- `client_ip` (TEXT, optional): Client IP address
- `user_agent` (TEXT, optional): User agent string

**Returns:** JSON object with session token and admin info

**Example:**
```typescript
const { data, error } = await supabase.rpc('admin_authenticate', {
  admin_email: 'admin@example.com',
  password: 'password123',
  client_ip: '192.168.1.1',
  user_agent: navigator.userAgent
});

// Returns:
// {
//   session_token: 'base64-encoded-token',
//   expires_at: '2024-12-31T23:59:59Z',
//   admin_id: 'uuid',
//   admin_name: 'Admin Name'
// }
```

**Security:**
- Uses `SECURITY DEFINER` to access `admin_users` table
- Validates password with bcrypt
- Locks account after 5 failed attempts
- Generates secure session token

### admin_validate_session()

Validate admin session token.

**Location:** `complete_database_schema.sql`

**Parameters:**
- `p_session_token` (TEXT): Session token

**Returns:** JSON object with validation result

**Example:**
```typescript
const { data, error } = await supabase.rpc('admin_validate_session', {
  p_session_token: 'token-from-localStorage'
});

// Returns:
// {
//   is_valid: true,
//   admin_id: 'uuid',
//   expires_at: '2024-12-31T23:59:59Z'
// }
```

**Security:**
- Checks token exists and not expired
- Updates `last_used_at` timestamp
- Returns validation result

## Admin Category Functions

### admin_create_category()

Create new category (admin only).

**Location:** `admin_category_rpc_functions.sql`

**Parameters:**
- `p_name` (TEXT): Category name (Arabic)
- `p_name_en` (TEXT, optional): Category name (English)
- `p_icon_name` (TEXT, optional): Icon identifier
- `p_image_url` (TEXT, optional): Thumbnail image URL (75×75)
- `p_hero_image_url` (TEXT, optional): Hero image URL (1200×400)
- `p_display_order` (INTEGER, optional): Display order
- `p_is_active` (BOOLEAN, optional): Active status

**Returns:** Created category record

**Example:**
```typescript
const { data, error } = await supabase.rpc('admin_create_category', {
  p_name: 'معدات الحفر',
  p_name_en: 'Drilling Equipment',
  p_icon_name: 'Drill',
  p_image_url: 'https://example.com/icon.jpg',
  p_hero_image_url: 'https://example.com/hero.jpg',
  p_display_order: 1,
  p_is_active: true
});
```

**Security:**
- Uses `SECURITY DEFINER` to bypass RLS
- ⚠️ **Note**: This function doesn't validate admin status (should be added)
- Called after `validateAdminSession()` in API layer

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION admin_create_category(
  p_name TEXT,
  p_name_en TEXT DEFAULT NULL,
  p_icon_name TEXT DEFAULT 'Settings',
  p_image_url TEXT DEFAULT NULL,
  p_hero_image_url TEXT DEFAULT NULL,
  p_display_order INTEGER DEFAULT 0,
  p_is_active BOOLEAN DEFAULT true
)
RETURNS categories
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_category categories;
BEGIN
  INSERT INTO categories (
    name, name_en, icon_name, image_url, hero_image_url,
    display_order, is_active
  ) VALUES (
    p_name, p_name_en, p_icon_name, p_image_url, p_hero_image_url,
    p_display_order, p_is_active
  )
  RETURNING * INTO new_category;
  
  RETURN new_category;
END;
$$;
```

### admin_update_category()

Update category (admin only).

**Location:** `admin_category_rpc_functions.sql`

**Parameters:**
- `p_category_id` (UUID): Category ID
- `p_name` (TEXT, optional): Category name
- `p_name_en` (TEXT, optional): Category name (English)
- `p_icon_name` (TEXT, optional): Icon identifier
- `p_image_url` (TEXT, optional): Thumbnail image URL
- `p_hero_image_url` (TEXT, optional): Hero image URL
- `p_display_order` (INTEGER, optional): Display order
- `p_is_active` (BOOLEAN, optional): Active status

**Returns:** Updated category record

**Example:**
```typescript
const { data, error } = await supabase.rpc('admin_update_category', {
  p_category_id: '550e8400-e29b-41d4-a716-446655440000',
  p_name: 'معدات الحفر المحدثة',
  p_display_order: 2
});
```

**Security:**
- Uses `SECURITY DEFINER` to bypass RLS
- ⚠️ **Note**: Should validate admin status
- Called after `validateAdminSession()` in API layer

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION admin_update_category(
  p_category_id UUID,
  p_name TEXT DEFAULT NULL,
  p_name_en TEXT DEFAULT NULL,
  p_icon_name TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_hero_image_url TEXT DEFAULT NULL,
  p_display_order INTEGER DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS categories
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_category categories;
BEGIN
  UPDATE categories
  SET
    name = COALESCE(p_name, name),
    name_en = COALESCE(p_name_en, name_en),
    icon_name = COALESCE(p_icon_name, icon_name),
    image_url = COALESCE(p_image_url, image_url),
    hero_image_url = COALESCE(p_hero_image_url, hero_image_url),
    display_order = COALESCE(p_display_order, display_order),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE id = p_category_id
  RETURNING * INTO updated_category;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Category not found';
  END IF;
  
  RETURN updated_category;
END;
$$;
```

### admin_delete_category()

Delete category (soft delete, admin only).

**Location:** `admin_category_rpc_functions.sql`

**Parameters:**
- `p_category_id` (UUID): Category ID

**Returns:** VOID

**Example:**
```typescript
const { error } = await supabase.rpc('admin_delete_category', {
  p_category_id: '550e8400-e29b-41d4-a716-446655440000'
});
```

**Security:**
- Uses `SECURITY DEFINER` to bypass RLS
- Soft delete (sets `is_active = false`)
- ⚠️ **Note**: Should validate admin status

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION admin_delete_category(
  p_category_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE categories
  SET is_active = false,
      updated_at = NOW()
  WHERE id = p_category_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Category not found';
  END IF;
END;
$$;
```

## Function Security

### SECURITY DEFINER

Functions with `SECURITY DEFINER` run with the privileges of the function creator, allowing them to bypass RLS.

**Use Cases:**
- Admin operations
- Cross-table operations
- Data migrations

**Security Considerations:**
- Always validate permissions inside function
- Don't trust client input
- Use parameterized queries
- Limit function permissions

### Admin Validation Pattern

**Current Implementation:**
- Admin validation happens in API layer (`validateAdminSession()`)
- RPC functions assume caller is validated

**Recommended Improvement:**
```sql
CREATE OR REPLACE FUNCTION admin_create_category(...)
RETURNS categories
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate admin status
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can create categories.';
  END IF;
  
  -- Perform operation
  INSERT INTO categories (...) VALUES (...);
END;
$$;
```

### Granting Permissions

RPC functions must be granted execute permissions:

```sql
GRANT EXECUTE ON FUNCTION admin_create_category(...) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_create_category(...) TO anon;
```

## Creating New RPC Functions

### Step 1: Define Function

```sql
CREATE OR REPLACE FUNCTION my_function(
  p_param1 TEXT,
  p_param2 INTEGER DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- If needs to bypass RLS
AS $$
DECLARE
  result JSON;
BEGIN
  -- Validate permissions (if SECURITY DEFINER)
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Perform operation
  -- ...
  
  -- Return result
  RETURN json_build_object('success', true);
END;
$$;
```

### Step 2: Grant Permissions

```sql
GRANT EXECUTE ON FUNCTION my_function(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION my_function(TEXT, INTEGER) TO anon;
```

### Step 3: Call from Frontend

```typescript
const { data, error } = await supabase.rpc('my_function', {
  p_param1: 'value1',
  p_param2: 123
});
```

### Best Practices

1. **Use Descriptive Names**: `admin_create_category` not `create_cat`
2. **Parameter Prefixes**: Use `p_` prefix for parameters
3. **Return Types**: Use specific return types when possible
4. **Error Handling**: Use `RAISE EXCEPTION` for errors
5. **Validation**: Always validate input and permissions
6. **Documentation**: Comment complex logic

## Next Steps

- [API Documentation](./03_BACKEND_API.md)
- [Security Documentation](./05_BACKEND_SECURITY.md)
- [Database Documentation](./02_BACKEND_DATABASE.md)


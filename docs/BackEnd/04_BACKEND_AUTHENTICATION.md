# Backend Authentication

## Table of Contents
- [Authentication Overview](#authentication-overview)
- [User Authentication](#user-authentication)
- [Admin Authentication](#admin-authentication)
- [Session Management](#session-management)
- [Password Security](#password-security)

## Authentication Overview

The application uses two separate authentication systems:

1. **User Authentication**: Supabase Auth (email/password)
2. **Admin Authentication**: Custom system with `admin_users` table

## User Authentication

### Supabase Auth

User authentication is handled by Supabase Auth service.

#### Sign Up

**Location:** `client/contexts/AuthContext.tsx`

```typescript
async function signUp(
  email: string,
  password: string,
  displayName: string,
  phone?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: password.trim(),
    options: {
      data: {
        display_name: displayName.trim(),
        phone: phone?.trim() || null,
      },
      emailRedirectTo: `${window.location.origin}/dashboard`
    }
  });
  
  if (error) throw error;
  
  // User profile is auto-created via trigger
}
```

**Process:**
1. User submits registration form
2. Supabase creates auth user
3. Trigger `handle_new_user()` creates `user_profiles` record
4. User receives confirmation email (if enabled)

#### Sign In

```typescript
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: password.trim()
  });
  
  if (error) throw error;
  
  // Fetch user profile
  await fetchUserProfile(data.user.id);
}
```

**Process:**
1. User submits login form
2. Supabase validates credentials
3. Returns JWT token
4. Frontend stores token
5. User profile is fetched

#### Sign Out

```typescript
async function logout() {
  await supabase.auth.signOut();
  setCurrentUser(null);
  setUserProfile(null);
}
```

#### Password Reset

```typescript
async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    {
      redirectTo: `${window.location.origin}/reset-password`
    }
  );
  
  if (error) throw error;
}
```

### User Profile Auto-Creation

**Trigger:** `handle_new_user()`

**Location:** `complete_database_schema.sql`

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, is_admin, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    false,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Admin Authentication

### Custom Admin System

Admin authentication is separate from Supabase Auth, using a custom system with:
- `admin_users` table
- `admin_sessions` table
- RPC function: `admin_authenticate()`

### Admin Login

**Location:** `client/lib/adminSession.ts`

```typescript
async function login(email: string, password: string) {
  const { data, error } = await supabase.rpc('admin_authenticate', {
    admin_email: email.trim().toLowerCase(),
    password: password.trim(),
    client_ip: null, // Optional
    user_agent: navigator.userAgent
  });
  
  if (error) throw error;
  
  // Store session token
  localStorage.setItem('admin_session_token', data.session_token);
  localStorage.setItem('admin_session_expires', data.expires_at);
}
```

### Admin Authenticate RPC Function

**Location:** `complete_database_schema.sql`

```sql
CREATE OR REPLACE FUNCTION admin_authenticate(
  admin_email TEXT,
  password TEXT,
  client_ip TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  session_token TEXT;
  session_id UUID;
  expires_at TIMESTAMPTZ;
BEGIN
  -- Find admin user
  SELECT * INTO admin_record
  FROM admin_users
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(admin_email))
    AND is_active = true;

  -- Check if admin exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid credentials';
  END IF;

  -- Check if account is locked
  IF admin_record.failed_login_attempts >= 5 THEN
    RAISE EXCEPTION 'Account temporarily locked';
  END IF;

  -- Verify password (bcrypt)
  IF NOT (admin_record.password_hash = crypt(TRIM(password), admin_record.password_hash)) THEN
    -- Increment failed attempts
    UPDATE admin_users
    SET failed_login_attempts = failed_login_attempts + 1
    WHERE id = admin_record.id;
    
    RAISE EXCEPTION 'Invalid credentials';
  END IF;

  -- Reset failed attempts on successful login
  UPDATE admin_users
  SET 
    failed_login_attempts = 0,
    last_login = NOW()
  WHERE id = admin_record.id;

  -- Generate secure session token
  session_token := encode(gen_random_bytes(32), 'base64');
  expires_at := NOW() + INTERVAL '7 days';

  -- Create session
  INSERT INTO admin_sessions (admin_id, session_token, expires_at, ip_address, user_agent)
  VALUES (admin_record.id, session_token, expires_at, client_ip, user_agent)
  RETURNING id INTO session_id;

  -- Return session info
  RETURN json_build_object(
    'session_token', session_token,
    'expires_at', expires_at,
    'admin_id', admin_record.id,
    'admin_name', admin_record.name
  );
END;
$$;
```

### Admin Session Validation

**Location:** `client/lib/adminSession.ts`

```typescript
async function validateSession(): Promise<boolean> {
  const token = localStorage.getItem('admin_session_token');
  if (!token) return false;

  const { data, error } = await supabase.rpc('admin_validate_session', {
    p_session_token: token
  });

  if (error || !data) {
    clearSession();
    return false;
  }

  return data.is_valid;
}
```

### Admin Validate Session RPC Function

```sql
CREATE OR REPLACE FUNCTION admin_validate_session(p_session_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record admin_sessions%ROWTYPE;
BEGIN
  -- Find session
  SELECT * INTO session_record
  FROM admin_sessions
  WHERE session_token = p_session_token
    AND expires_at > NOW();

  -- Check if session exists and is valid
  IF NOT FOUND THEN
    RETURN json_build_object('is_valid', false);
  END IF;

  -- Update last used timestamp
  UPDATE admin_sessions
  SET last_used_at = NOW()
  WHERE id = session_record.id;

  -- Return validation result
  RETURN json_build_object(
    'is_valid', true,
    'admin_id', session_record.admin_id,
    'expires_at', session_record.expires_at
  );
END;
$$;
```

## Session Management

### User Sessions (Supabase)

- **Storage**: Handled by Supabase client
- **Token**: JWT stored in memory/localStorage
- **Expiration**: Managed by Supabase
- **Refresh**: Automatic token refresh

### Admin Sessions

- **Storage**: `localStorage` (session token)
- **Token**: Base64-encoded random bytes
- **Expiration**: 7 days (configurable)
- **Validation**: RPC function validates on each request

### Session Expiration

**Admin Sessions:**
```typescript
function isSessionExpired(): boolean {
  const expiresAt = localStorage.getItem('admin_session_expires');
  if (!expiresAt) return true;
  
  return new Date(expiresAt) < new Date();
}
```

### Session Cleanup

**Automatic Cleanup:**
- Expired sessions are ignored
- Old sessions can be cleaned up via cron job

**Manual Cleanup:**
```typescript
function clearSession() {
  localStorage.removeItem('admin_session_token');
  localStorage.removeItem('admin_session_expires');
}
```

## Password Security

### Password Hashing

**User Passwords (Supabase):**
- Handled by Supabase Auth
- Uses bcrypt (industry standard)
- Automatic hashing and verification

**Admin Passwords:**
- Stored as bcrypt hashes in `admin_users.password_hash`
- Hashed using PostgreSQL `crypt()` function
- Verified using `crypt(password, hash) = hash`

### Password Requirements

**User Passwords:**
- Minimum 6 characters (Supabase default)
- Can be customized in Supabase dashboard

**Admin Passwords:**
- Should be strong (enforced in application)
- Minimum 8 characters recommended
- Mix of letters, numbers, symbols

### Password Reset

**User Password Reset:**
- Via Supabase Auth: `resetPasswordForEmail()`
- Sends reset email with token
- User clicks link and sets new password

**Admin Password Reset:**
- Must be done by super admin
- Or via database directly (development only)

### Account Lockout

**Admin Accounts:**
- Locked after 5 failed login attempts
- `failed_login_attempts` counter
- Reset on successful login
- Manual unlock required (database)

## Security Best Practices

### 1. **Never Store Passwords in Plain Text**
- Always hash passwords
- Use bcrypt or similar

### 2. **Use HTTPS**
- All authentication over HTTPS
- Prevents man-in-the-middle attacks

### 3. **Session Tokens**
- Use secure, random tokens
- Store securely (httpOnly cookies preferred)
- Set expiration times

### 4. **Rate Limiting**
- Limit login attempts
- Prevent brute force attacks

### 5. **Password Policies**
- Enforce strong passwords
- Regular password changes (optional)

## Next Steps

- [Security Documentation](./05_BACKEND_SECURITY.md)
- [RPC Functions Documentation](./06_BACKEND_RPC_FUNCTIONS.md)


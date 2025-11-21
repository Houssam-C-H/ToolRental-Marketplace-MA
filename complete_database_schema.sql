-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR AJIR TOOL RENTAL MARKETPLACE
-- =====================================================
-- This script creates all tables, functions, policies, and triggers
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- For password hashing

-- =====================================================
-- 2. CREATE TABLES (in dependency order)
-- =====================================================

-- =====================================================
-- 2.1 USER_PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  phone TEXT,
  profile_photo TEXT,
  description TEXT,
  location TEXT,
  specialties TEXT[],
  response_time TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  total_products INTEGER DEFAULT 0,
  average_rating NUMERIC(3,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  product_categories TEXT[],
  last_product_update TIMESTAMPTZ
);

-- =====================================================
-- 2.2 ADMIN_USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  failed_login_attempts INTEGER DEFAULT 0,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2.3 ADMIN_SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2.4 PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  condition TEXT NOT NULL,
  specifications TEXT,
  daily_price NUMERIC(10,2) NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT,
  contact_phone TEXT NOT NULL,
  contact_whatsapp TEXT,
  has_delivery BOOLEAN DEFAULT false,
  delivery_price NUMERIC(10,2),
  delivery_notes TEXT,
  images TEXT[] DEFAULT '{}',
  owner_name TEXT NOT NULL,
  owner_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  rating NUMERIC(3,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Optional compatibility fields
  first_image TEXT,
  image_count INTEGER
);

-- =====================================================
-- 2.5 PRODUCT_SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  request_state TEXT NOT NULL DEFAULT 'add' CHECK (request_state IN ('add', 'modify', 'delete')),
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- =====================================================
-- 2.6 ANONYMOUS_REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS anonymous_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name TEXT,
  reviewer_email TEXT,
  reviewer_phone TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  ip_address TEXT,
  user_agent TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2.7 SUPPLIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  profile_photo TEXT,
  description TEXT,
  location TEXT,
  specialties TEXT[],
  response_time TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  total_products INTEGER DEFAULT 0,
  average_rating NUMERIC(3,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  product_categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_product_update TIMESTAMPTZ
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

-- Admin users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Admin sessions indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_city ON products(city);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_owner_user_id ON products(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_daily_price ON products(daily_price);

-- Product submissions indexes
CREATE INDEX IF NOT EXISTS idx_product_submissions_user_id ON product_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_product_submissions_status ON product_submissions(status);
CREATE INDEX IF NOT EXISTS idx_product_submissions_submitted_at ON product_submissions(submitted_at DESC);

-- Anonymous reviews indexes
CREATE INDEX IF NOT EXISTS idx_anonymous_reviews_product_id ON anonymous_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_reviews_is_deleted ON anonymous_reviews(is_deleted);
CREATE INDEX IF NOT EXISTS idx_anonymous_reviews_created_at ON anonymous_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anonymous_reviews_ip_address ON anonymous_reviews(ip_address);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_total_products ON suppliers(total_products DESC);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- =====================================================
-- 5.1 USER_PROFILES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public can read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can read profiles"
  ON user_profiles FOR SELECT
  USING (true);

-- =====================================================
-- 5.2 ADMIN_USERS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Block direct access" ON admin_users;

CREATE POLICY "Block direct access"
  ON admin_users FOR ALL
  USING (false);

-- =====================================================
-- 5.3 ADMIN_SESSIONS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Block direct access" ON admin_sessions;

CREATE POLICY "Block direct access"
  ON admin_sessions FOR ALL
  USING (false);

-- =====================================================
-- 5.4 PRODUCTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Users can insert products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;

CREATE POLICY "Public can read products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Users can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = owner_user_id);

-- =====================================================
-- 5.5 PRODUCT_SUBMISSIONS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can insert own submissions" ON product_submissions;
DROP POLICY IF EXISTS "Users can read own submissions" ON product_submissions;
DROP POLICY IF EXISTS "Admins can read all submissions" ON product_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON product_submissions;

CREATE POLICY "Users can insert own submissions"
  ON product_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own submissions"
  ON product_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Note: Admin policies for submissions should be handled via RPC functions
-- or service role key, as admin authentication is separate from Supabase Auth

-- =====================================================
-- 5.6 ANONYMOUS_REVIEWS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can read reviews" ON anonymous_reviews;
DROP POLICY IF EXISTS "Public can insert reviews" ON anonymous_reviews;

CREATE POLICY "Public can read reviews"
  ON anonymous_reviews FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Public can insert reviews"
  ON anonymous_reviews FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 5.7 SUPPLIERS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can read suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update own supplier" ON suppliers;

CREATE POLICY "Public can read suppliers"
  ON suppliers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can update own supplier"
  ON suppliers FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. CREATE FUNCTIONS
-- =====================================================

-- =====================================================
-- 6.1 AUTO-CREATE USER PROFILE TRIGGER FUNCTION
-- =====================================================

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

-- =====================================================
-- 6.2 ADMIN AUTHENTICATION FUNCTIONS
-- =====================================================

-- Function: admin_authenticate (with session creation)
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
  -- Find admin user (case-insensitive, trimmed)
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

  -- Verify password
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
  
  -- Set expiration (24 hours)
  expires_at := NOW() + INTERVAL '24 hours';

  -- Create session
  INSERT INTO admin_sessions (
    admin_id,
    session_token,
    expires_at,
    ip_address,
    user_agent
  ) VALUES (
    admin_record.id,
    session_token,
    expires_at,
    client_ip,
    user_agent
  ) RETURNING id INTO session_id;

  -- Clean up expired sessions (optional, can be done via cron)
  DELETE FROM admin_sessions s WHERE s.expires_at < NOW();

  -- Return admin data with session token
  RETURN json_build_object(
    'id', admin_record.id,
    'email', admin_record.email,
    'name', admin_record.name,
    'role', admin_record.role,
    'session_token', session_token,
    'expires_at', expires_at
  );
END;
$$;

-- Function: admin_validate_session
CREATE OR REPLACE FUNCTION admin_validate_session(
  session_token TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record admin_sessions%ROWTYPE;
  admin_record admin_users%ROWTYPE;
BEGIN
  -- Find session
  SELECT * INTO session_record
  FROM admin_sessions s
  WHERE s.session_token = admin_validate_session.session_token
    AND s.expires_at > NOW();

  -- Check if session exists and is valid
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired session';
  END IF;

  -- Get admin details
  SELECT * INTO admin_record
  FROM admin_users
  WHERE id = session_record.admin_id
    AND is_active = true;

  IF NOT FOUND THEN
    -- Admin was deactivated, delete session
    DELETE FROM admin_sessions WHERE id = session_record.id;
    RAISE EXCEPTION 'Admin account is inactive';
  END IF;

  -- Update last used timestamp
  UPDATE admin_sessions
  SET last_used_at = NOW()
  WHERE id = session_record.id;

  -- Return admin data
  RETURN json_build_object(
    'id', admin_record.id,
    'email', admin_record.email,
    'name', admin_record.name,
    'role', admin_record.role,
    'session_id', session_record.id,
    'expires_at', session_record.expires_at
  );
END;
$$;

-- Function: admin_logout
CREATE OR REPLACE FUNCTION admin_logout(
  session_token TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete session
  DELETE FROM admin_sessions
  WHERE session_token = admin_logout.session_token;

  RETURN json_build_object('success', true);
END;
$$;

-- Function: admin_update_password
CREATE OR REPLACE FUNCTION admin_update_password(
  admin_email TEXT,
  current_password TEXT,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
BEGIN
  -- Validate new password
  IF length(new_password) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters';
  END IF;

  IF new_password !~ '[A-Z]' THEN
    RAISE EXCEPTION 'Password must contain at least one uppercase letter';
  END IF;

  IF new_password !~ '[a-z]' THEN
    RAISE EXCEPTION 'Password must contain at least one lowercase letter';
  END IF;

  IF new_password !~ '[0-9]' THEN
    RAISE EXCEPTION 'Password must contain at least one number';
  END IF;

  -- Find and verify admin
  SELECT * INTO admin_record
  FROM admin_users
  WHERE email = admin_email
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin not found';
  END IF;

  -- Verify current password
  IF NOT (admin_record.password_hash = crypt(current_password, admin_record.password_hash)) THEN
    RAISE EXCEPTION 'Current password is incorrect';
  END IF;

  -- Update password
  UPDATE admin_users
  SET 
    password_hash = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = admin_record.id;

  RETURN json_build_object('success', true);
END;
$$;

-- Function: get_admin_from_session
CREATE OR REPLACE FUNCTION get_admin_from_session(
  session_token TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT s.admin_id INTO admin_id
  FROM admin_sessions s
  JOIN admin_users a ON s.admin_id = a.id
  WHERE s.session_token = get_admin_from_session.session_token
    AND s.expires_at > NOW()
    AND a.is_active = true;

  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired session';
  END IF;

  -- Update last used
  UPDATE admin_sessions
  SET last_used_at = NOW()
  WHERE session_token = get_admin_from_session.session_token;

  RETURN admin_id;
END;
$$;

-- =====================================================
-- 7. CREATE TRIGGERS
-- =====================================================

-- Trigger: Auto-create user profile on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 8. CREATE INITIAL ADMIN USER (OPTIONAL)
-- =====================================================
-- ⚠️ CHANGE THE PASSWORD BEFORE RUNNING IN PRODUCTION!

INSERT INTO admin_users (
  email,
  name,
  password_hash,
  role,
  is_active
) VALUES (
  'admin@ajir.com',
  'Main Admin',
  crypt('Admin123456', gen_salt('bf')),  -- ⚠️ CHANGE THIS PASSWORD!
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- DONE!
-- =====================================================
-- Your database schema is now complete!
-- 
-- Initial admin credentials (if created):
-- Email: admin@ajir.com
-- Password: Admin123456
-- 
-- ⚠️ IMPORTANT: Change the admin password immediately after first login!
-- =====================================================


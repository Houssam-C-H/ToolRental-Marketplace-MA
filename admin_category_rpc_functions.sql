-- Admin Category Management RPC Functions
-- These functions bypass RLS using SECURITY DEFINER to allow admin operations

-- Create category (admin only)
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
    name,
    name_en,
    icon_name,
    image_url,
    hero_image_url,
    display_order,
    is_active
  ) VALUES (
    p_name,
    p_name_en,
    p_icon_name,
    p_image_url,
    p_hero_image_url,
    p_display_order,
    p_is_active
  )
  RETURNING * INTO new_category;
  
  RETURN new_category;
END;
$$;

-- Update category (admin only)
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

-- Delete category (soft delete - admin only)
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_create_category(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_create_category(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION admin_update_category(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_category(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION admin_delete_category(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_category(UUID) TO anon;


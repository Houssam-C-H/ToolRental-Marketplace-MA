import { supabase } from "./supabase";

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload category image to Supabase Storage
 * Supports both thumbnail (image_url) and hero (hero_image_url) images
 */
export async function uploadCategoryImage(
  file: File,
  categoryId: string,
  type: 'thumbnail' | 'hero'
): Promise<ImageUploadResult> {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size too large. Maximum 5MB allowed.' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `categories/${categoryId}/${type}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('category-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Allow overwriting existing images
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('category-images')
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('Error uploading category image:', error);
    return { success: false, error: error.message || 'Failed to upload image' };
  }
}


import { supabase } from './supabase';

export interface ImageUploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Upload image to Supabase Storage with proper error handling
 * Uses multiple fallback strategies for different permission scenarios
 */
export async function uploadProfileImage(
    file: File,
    userId: string
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
        const fileName = `${userId}-${Date.now()}.${fileExt}`;

        // Strategy 1: Try with anonymous authentication
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                await supabase.auth.signInAnonymously();
            }

            const { data, error } = await supabase.storage
                .from('profile-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (!error) {
                const { data: { publicUrl } } = supabase.storage
                    .from('profile-images')
                    .getPublicUrl(fileName);
                return { success: true, url: publicUrl };
            }
        } catch (authError) {
            console.log('Strategy 1 failed, trying alternative approach...');
        }

        // Strategy 2: Try without authentication (if bucket allows public uploads)
        try {
            const { data, error } = await supabase.storage
                .from('profile-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (!error) {
                const { data: { publicUrl } } = supabase.storage
                    .from('profile-images')
                    .getPublicUrl(fileName);
                return { success: true, url: publicUrl };
            }
        } catch (uploadError) {
            console.log('Strategy 2 failed, using data URL fallback...');
        }

        // Strategy 3: Fallback to data URL (base64 encoding)
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                resolve({ success: true, url: dataUrl });
            };
            reader.onerror = () => {
                resolve({ success: false, error: 'Failed to process image file' });
            };
            reader.readAsDataURL(file);
        });

    } catch (error) {
        console.error('Image upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteProfileImage(fileName: string): Promise<ImageUploadResult> {
    try {
        const { error } = await supabase.storage
            .from('profile-images')
            .remove([fileName]);

        if (error) {
            console.error('Supabase storage delete error:', error);
            return { success: false, error: `Delete failed: ${error.message}` };
        }

        return { success: true };

    } catch (error) {
        console.error('Image delete error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

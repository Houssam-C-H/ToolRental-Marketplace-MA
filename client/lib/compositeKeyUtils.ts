/**
 * Composite Key System for Supplier URLs
 * 
 * This system creates a single URL key that contains both:
 * - Firebase ID (for Firebase Realtime Database)
 * - owner_user_id (for Supabase products table)
 * 
 * URL format: /fournisseur/{encodedCompositeKey}
 * Example: /fournisseur/FznXTRnPjIb6OyxBrQQ6sBQo4SQ2_abc123def456
 */

interface CompositeKey {
    firebaseId: string;
    ownerUserId: string;
}

/**
 * Encode a composite key for URL usage
 * Format: {firebaseId}_{base64EncodedOwnerUserId}
 */
export function encodeCompositeKey(firebaseId: string, ownerUserId: string): string {
    try {
        // Encode the owner_user_id to base64 for URL safety
        const encodedOwnerUserId = btoa(ownerUserId);

        // Combine with separator
        const compositeKey = `${firebaseId}_${encodedOwnerUserId}`;

        console.log('Encoded composite key:', compositeKey);
        return compositeKey;
    } catch (error) {
        console.error('Error encoding composite key:', error);
        throw new Error('Failed to encode composite key');
    }
}

/**
 * Decode a composite key from URL
 * Returns both Firebase ID and owner_user_id
 */
export function decodeCompositeKey(encodedKey: string): CompositeKey {
    try {
        // Split by the separator
        const parts = encodedKey.split('_');

        if (parts.length !== 2) {
            throw new Error('Invalid composite key format');
        }

        const [firebaseId, encodedOwnerUserId] = parts;

        // Decode the owner_user_id from base64
        const ownerUserId = atob(encodedOwnerUserId);

        const result = {
            firebaseId,
            ownerUserId
        };

        console.log('Decoded composite key:', result);
        return result;
    } catch (error) {
        console.error('Error decoding composite key:', error);
        throw new Error('Failed to decode composite key');
    }
}

/**
 * Create a composite key from existing data
 * This is useful when you have both IDs and want to create a URL
 */
export function createCompositeKey(firebaseId: string, ownerUserId: string): string {
    return encodeCompositeKey(firebaseId, ownerUserId);
}

/**
 * Validate if a string looks like a composite key
 */
export function isValidCompositeKey(key: string): boolean {
    try {
        const parts = key.split('_');
        return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
    } catch {
        return false;
    }
}

/**
 * Extract Firebase ID from composite key (without full decoding)
 */
export function extractFirebaseId(compositeKey: string): string | null {
    try {
        const parts = compositeKey.split('_');
        return parts.length === 2 ? parts[0] : null;
    } catch {
        return null;
    }
}

/**
 * Generate composite key for a supplier
 * This function should be used when creating supplier URLs
 */
export function generateSupplierUrl(firebaseId: string, ownerUserId: string): string {
    const compositeKey = createCompositeKey(firebaseId, ownerUserId);
    return `/fournisseur/${compositeKey}`;
}

/**
 * Example usage and testing functions
 */
export const compositeKeyExamples = {
    // Example: Create a composite key
    createExample: () => {
        const firebaseId = "FznXTRnPjIb6OyxBrQQ6sBQo4SQ2";
        const ownerUserId = "abc123def456";
        return createCompositeKey(firebaseId, ownerUserId);
    },

    // Example: Decode a composite key
    decodeExample: (compositeKey: string) => {
        return decodeCompositeKey(compositeKey);
    },

    // Example: Generate a supplier URL
    generateUrlExample: () => {
        const firebaseId = "FznXTRnPjIb6OyxBrQQ6sBQo4SQ2";
        const ownerUserId = "abc123def456";
        return generateSupplierUrl(firebaseId, ownerUserId);
    }
};

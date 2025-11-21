export function clearAllCaches() {
  console.log('🧹 Clearing all caches...');

  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      if (
        key.includes('cache') ||
        key.includes('submissions') ||
        key.includes('products') ||
        key.includes('main_page_products') ||
        key.includes('admin_') ||
        key.includes('user_') ||
        key.startsWith('tool-') ||
        key.includes('comparison') ||
        key.includes('favorites')
      ) {
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach(key => {
    console.log(`Removing localStorage key: ${key}`);
    localStorage.removeItem(key);
  });

  sessionStorage.clear();

  console.log('✅ All caches cleared!');
  console.log('⚠️ Please refresh the page and restart your dev server if you changed environment variables.');
}

if (typeof window !== 'undefined') {
  (window as any).clearAllCaches = clearAllCaches;
}


import { useEffect, useState } from 'react';
import { generateMainSitemap, generateProductsSitemap, generateCategoriesSitemap } from '../lib/sitemapGenerator';

export default function Sitemap() {
  const [sitemap, setSitemap] = useState<string>('');
  const [type, setType] = useState<'main' | 'products' | 'categories'>('main');

  useEffect(() => {
    const loadSitemap = async () => {
      try {
        let xml = '';
        switch (type) {
          case 'products':
            xml = await generateProductsSitemap();
            break;
          case 'categories':
            xml = await generateCategoriesSitemap();
            break;
          default:
            xml = await generateMainSitemap();
        }
        setSitemap(xml);
      } catch (error) {
        console.error('Error generating sitemap:', error);
        setSitemap('<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>');
      }
    };

    // Determine type from URL
    const path = window.location.pathname;
    if (path.includes('sitemap-products')) {
      setType('products');
    } else if (path.includes('sitemap-categories')) {
      setType('categories');
    } else {
      setType('main');
    }

    loadSitemap();
  }, [type]);

  // Return XML content
  useEffect(() => {
    if (sitemap) {
      // Set content type to XML
      document.contentType = 'application/xml';
      // For server-side rendering, this would be handled differently
      // For now, we'll return it as a component that can be accessed
    }
  }, [sitemap]);

  // For client-side, return the XML as text
  // In production, this should be handled server-side
  return (
    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
      {sitemap || 'Loading sitemap...'}
    </pre>
  );
}


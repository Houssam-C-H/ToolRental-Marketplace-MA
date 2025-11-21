import { productsAPI, categoriesAPI } from './api';

export interface SitemapEntry {
  url: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastmod?: string;
  images?: Array<{ loc: string; title?: string; caption?: string }>;
}

const baseUrl = import.meta.env.VITE_SITE_URL || 'https://yoursite.com';

/**
 * Generate XML sitemap from entries
 */
export function generateXMLSitemap(entries: SitemapEntry[]): string {
  const urlEntries = entries.map((entry) => {
    let urlXml = `  <url>\n    <loc>${baseUrl}${entry.url}</loc>\n    <priority>${entry.priority}</priority>\n    <changefreq>${entry.changefreq}</changefreq>`;
    
    if (entry.lastmod) {
      urlXml += `\n    <lastmod>${entry.lastmod}</lastmod>`;
    }

    if (entry.images && entry.images.length > 0) {
      urlXml += '\n    <image:image>';
      entry.images.forEach((image) => {
        urlXml += `\n      <image:loc>${image.loc}</image:loc>`;
        if (image.title) {
          urlXml += `\n      <image:title>${image.title}</image:title>`;
        }
        if (image.caption) {
          urlXml += `\n      <image:caption>${image.caption}</image:caption>`;
        }
        urlXml += '\n    </image:image>';
      });
      urlXml += '\n    </image:image>';
    }

    urlXml += '\n  </url>';
    return urlXml;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;
}

/**
 * Generate main sitemap with all static pages
 */
export async function generateMainSitemap(): Promise<string> {
  const staticPages: SitemapEntry[] = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/outils', priority: 0.9, changefreq: 'daily' },
    { url: '/categories', priority: 0.9, changefreq: 'weekly' },
    { url: '/recherche', priority: 0.8, changefreq: 'daily' },
    { url: '/comparateur', priority: 0.7, changefreq: 'weekly' },
    { url: '/a-propos', priority: 0.7, changefreq: 'monthly' },
    { url: '/politique-confidentialite', priority: 0.5, changefreq: 'yearly' },
    { url: '/conditions-utilisation', priority: 0.5, changefreq: 'yearly' },
    { url: '/connexion', priority: 0.6, changefreq: 'monthly' },
    { url: '/inscription', priority: 0.6, changefreq: 'monthly' },
  ];

  return generateXMLSitemap(staticPages);
}

/**
 * Generate products sitemap
 */
export async function generateProductsSitemap(): Promise<string> {
  try {
    // Fetch all approved products
    const { products } = await productsAPI.getApprovedProducts(1, 10000); // Large limit to get all
    
    const productEntries: SitemapEntry[] = products.map((product) => {
      const images = product.images && product.images.length > 0
        ? product.images.map((img) => ({
            loc: img.startsWith('http') ? img : `${baseUrl}${img}`,
            title: product.name,
            caption: `${product.name} - ${product.category}`,
          }))
        : [];

      return {
        url: `/outil/${product.id}`,
        priority: 0.8,
        changefreq: 'weekly',
        lastmod: product.updated_at || product.created_at,
        images: images.length > 0 ? images : undefined,
      };
    });

    return generateXMLSitemap(productEntries);
  } catch (error) {
    console.error('Error generating products sitemap:', error);
    return generateXMLSitemap([]);
  }
}

/**
 * Generate categories sitemap
 */
export async function generateCategoriesSitemap(): Promise<string> {
  try {
    const categories = await categoriesAPI.getCategories();
    
    const categoryEntries: SitemapEntry[] = categories.map((category) => ({
      url: `/categorie/${encodeURIComponent(category.name)}`,
      priority: 0.8,
      changefreq: 'weekly',
      lastmod: category.updated_at || category.created_at,
    }));

    return generateXMLSitemap(categoryEntries);
  } catch (error) {
    console.error('Error generating categories sitemap:', error);
    return generateXMLSitemap([]);
  }
}

/**
 * Generate sitemap index
 */
export function generateSitemapIndex(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-products.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
}


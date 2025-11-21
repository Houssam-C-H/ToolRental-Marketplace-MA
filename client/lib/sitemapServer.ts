/**
 * Server-side sitemap generation utilities
 * 
 * For production, these should be used in a serverless function or API route
 * to generate sitemaps on-demand or at build time.
 */

import { generateMainSitemap, generateProductsSitemap, generateCategoriesSitemap } from './sitemapGenerator';

/**
 * Generate all sitemaps and return as XML strings
 * Use this in a serverless function or API route
 */
export async function generateAllSitemaps() {
  try {
    const [mainSitemap, productsSitemap, categoriesSitemap] = await Promise.all([
      generateMainSitemap(),
      generateProductsSitemap(),
      generateCategoriesSitemap(),
    ]);

    return {
      main: mainSitemap,
      products: productsSitemap,
      categories: categoriesSitemap,
    };
  } catch (error) {
    console.error('Error generating sitemaps:', error);
    throw error;
  }
}

/**
 * Example serverless function handler (for Vercel, Netlify, etc.)
 * 
 * Example for Vercel (api/sitemap.xml.ts):
 * 
 * export default async function handler(req, res) {
 *   const sitemaps = await generateAllSitemaps();
 *   res.setHeader('Content-Type', 'application/xml');
 *   res.status(200).send(sitemaps.main);
 * }
 * 
 * Example for Netlify (netlify/functions/sitemap.ts):
 * 
 * export const handler = async (event, context) => {
 *   const sitemaps = await generateAllSitemaps();
 *   return {
 *     statusCode: 200,
 *     headers: { 'Content-Type': 'application/xml' },
 *     body: sitemaps.main
 *   };
 * }
 */

/**
 * Generate sitemap index
 */
export function generateSitemapIndexXML(): string {
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://yoursite.com';
  const date = new Date().toISOString().split('T')[0];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${date}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-products.xml</loc>
    <lastmod>${date}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${date}</lastmod>
  </sitemap>
</sitemapindex>`;
}


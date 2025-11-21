import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'product' | 'article';
  schema?: object;
  locale?: string;
  alternateLocales?: string[];
  canonical?: string;
}

export function SEOHead({
  title,
  description,
  image,
  url,
  type = 'website',
  schema,
  locale = 'ar_MA',
  alternateLocales = ['fr_MA'],
  canonical,
}: SEOProps) {
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://yoursite.com';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const canonicalUrl = canonical || fullUrl;
  const ogImage = image || `${baseUrl}/og-image.jpg`;
  const twitterImage = image || `${baseUrl}/twitter-image.jpg`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateLinkTag = (rel: string, href: string, attributes?: Record<string, string>) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
      
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          link.setAttribute(key, value);
        });
      }
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('author', 'Tool Rental Marketplace');
    updateMetaTag('geo.region', 'MA');
    updateMetaTag('geo.placename', 'Rabat');
    updateMetaTag('geo.position', '34.0209;-6.8416');
    updateMetaTag('ICBM', '34.0209, -6.8416');

    // Open Graph tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:locale', locale, true);
    updateMetaTag('og:site_name', 'منصة تأجير الأدوات', true);

    // Alternate locales
    alternateLocales.forEach((altLocale) => {
      updateMetaTag(`og:locale:alternate`, altLocale, true);
    });

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', twitterImage);

    // Canonical URL
    updateLinkTag('canonical', canonicalUrl);

    // Hreflang tags
    updateLinkTag('alternate', fullUrl, { hreflang: 'ar' });
    updateLinkTag('alternate', fullUrl, { hreflang: 'ar-MA' });
    if (alternateLocales.includes('fr_MA')) {
      updateLinkTag('alternate', fullUrl.replace(baseUrl, `${baseUrl}/fr`), { hreflang: 'fr' });
      updateLinkTag('alternate', fullUrl.replace(baseUrl, `${baseUrl}/fr`), { hreflang: 'fr-MA' });
    }
    updateLinkTag('alternate', fullUrl, { hreflang: 'x-default' });

    // Structured data (JSON-LD)
    if (schema) {
      let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }
  }, [title, description, image, url, type, schema, locale, alternateLocales, canonical, baseUrl, fullUrl, canonicalUrl, ogImage, twitterImage]);

  return null;
}


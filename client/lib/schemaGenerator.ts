import { Product } from './api';

export interface Breadcrumb {
  name: string;
  url: string;
}

export interface Supplier {
  id: string;
  name: string;
  city?: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

export interface Review {
  rating: number;
  reviewCount: number;
}

/**
 * Generate Product schema for structured data
 */
export function generateProductSchema(
  product: Product,
  baseUrl: string = 'https://yoursite.com'
): object {
  const productUrl = `${baseUrl}/outil/${product.id}`;
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`)
    : [`${baseUrl}/placeholder.svg`];

  const schema: any = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} للإيجار في ${product.city || 'المغرب'}`,
    image: images,
    url: productUrl,
    sku: product.id,
    category: product.category || 'أدوات البناء',
  };

  // Add offers
  if (product.daily_price) {
    schema.offers = {
      '@type': 'Offer',
      price: product.daily_price.toString(),
      priceCurrency: 'MAD',
      availability: product.status === 'approved' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: product.daily_price.toString(),
        priceCurrency: 'MAD',
        unitCode: 'DAY',
        unitText: 'يوم',
      },
      url: productUrl,
    };
  }

  // Add brand if available
  if (product.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: product.brand,
    };
  }

  // Add aggregate rating if available
  if (product.average_rating && product.total_reviews) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.average_rating.toString(),
      reviewCount: product.total_reviews.toString(),
      bestRating: '5',
      worstRating: '1',
    };
  }

  // Add condition
  if (product.condition) {
    schema.itemCondition = `https://schema.org/${product.condition === 'new' ? 'NewCondition' : 'UsedCondition'}`;
  }

  return schema;
}

/**
 * Generate LocalBusiness schema for suppliers
 */
export function generateLocalBusinessSchema(
  supplier: Supplier,
  baseUrl: string = 'https://yoursite.com'
): object {
  const schema: any = {
    '@context': 'https://schema.org/',
    '@type': 'LocalBusiness',
    name: supplier.name,
    url: `${baseUrl}/fournisseur/${supplier.id}`,
  };

  if (supplier.address || supplier.city) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: supplier.city || 'Rabat',
      addressCountry: 'MA',
      addressRegion: supplier.city || 'Rabat',
    };
    
    if (supplier.address) {
      schema.address.streetAddress = supplier.address;
    }
  }

  if (supplier.latitude && supplier.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: supplier.latitude.toString(),
      longitude: supplier.longitude.toString(),
    };
  }

  if (supplier.phone) {
    schema.telephone = supplier.phone;
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Breadcrumb[],
  baseUrl: string = 'https://yoursite.com'
): object {
  return {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`,
    })),
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
  baseUrl: string = 'https://yoursite.com'
): object {
  return {
    '@context': 'https://schema.org/',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Organization schema for the website
 */
export function generateOrganizationSchema(
  baseUrl: string = 'https://yoursite.com'
): object {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Organization',
    name: 'منصة تأجير الأدوات',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'منصة رائدة في تأجير أدوات البناء والبريكولاج بالمغرب',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Rabat',
      addressCountry: 'MA',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      areaServed: 'MA',
      availableLanguage: ['ar', 'fr'],
    },
  };
}

/**
 * Combine multiple schemas into a @graph format
 */
export function combineSchemas(...schemas: object[]): object {
  if (schemas.length === 0) return {};
  if (schemas.length === 1) return schemas[0];
  
  return {
    '@context': 'https://schema.org/',
    '@graph': schemas,
  };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema(
  baseUrl: string = 'https://yoursite.com'
): object {
  return {
    '@context': 'https://schema.org/',
    '@type': 'WebSite',
    name: 'منصة تأجير الأدوات',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/recherche?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}


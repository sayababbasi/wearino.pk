/**
 * Product Page — Server Component with Dynamic SEO
 *
 * This is a Next.js App Router SERVER component.
 * It generates per-product metadata (title, description, Open Graph,
 * Twitter Cards, JSON-LD Product schema) at request time, so every product
 * you create is automatically indexed by Google with rich results.
 *
 * The actual interactive UI is delegated to ProductDetailClient.tsx ('use client').
 */

import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

const API_BASE  = (process.env.NEXT_PUBLIC_API_URL || 'https://wearino-pk.onrender.com/api').replace(/\/api$/, '');
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  || 'https://wearino.pk';
const SITE_NAME = 'Wearino.pk';

// ─── Server-side product fetch (cached 1 hour) ───────────────────────────────
async function fetchProductSeo(id: string) {
  if (!id || id === 'undefined') return null;
  try {
    const res = await fetch(`${API_BASE}/api/product/${id}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product || data || null;
  } catch {
    return null;
  }
}

// ─── Dynamic Metadata (Google, social sharing) ───────────────────────────────
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const product = await fetchProductSeo(params.id);

  if (!product) {
    return {
      title: `Product Not Found | ${SITE_NAME}`,
      description: `Browse our premium fashion collection at ${SITE_NAME}.`,
    };
  }

  const name        = product.name || 'Product';
  const desc        = (product.description || `Buy ${name} online at ${SITE_NAME}. Premium quality fashion with fast delivery across Pakistan.`).substring(0, 160);
  const price       = product.discount
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : (product.price || 0).toFixed(2);
  const rawImages   = product.images || (product.image ? [product.image] : []);
  const toAbsUrl    = (img: string) => img?.startsWith('http') ? img : `${SITE_URL}/${img}`;
  const ogImage     = rawImages.length > 0 ? toAbsUrl(rawImages[0]) : `${SITE_URL}/og-default.jpg`;
  const productUrl  = `${SITE_URL}/products/${params.id}`;
  const keywords    = [name, product.category?.name || 'Fashion', 'Pakistan', SITE_NAME, 'buy online', 'fashion Pakistan', ...(product.tags || [])].filter(Boolean).join(', ');

  return {
    title: `${name} | ${SITE_NAME}`,
    description: desc,
    keywords,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    alternates: { canonical: productUrl },
    openGraph: {
      type: 'website',
      url: productUrl,
      siteName: SITE_NAME,
      title: `${name} – Rs ${price} | ${SITE_NAME}`,
      description: desc,
      images: [{ url: ogImage, width: 800, height: 800, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} – Rs ${price} | ${SITE_NAME}`,
      description: desc,
      images: [ogImage],
      site: '@WearinoPK',
    },
  };
}

// ─── JSON-LD Structured Data (Google Shopping, rich results) ─────────────────
async function ProductJsonLd({ id }: { id: string }) {
  const product = await fetchProductSeo(id);
  if (!product) return null;

  const rawImages = product.images || (product.image ? [product.image] : []);
  const toAbsUrl  = (img: string) => img?.startsWith('http') ? img : `${SITE_URL}/${img}`;
  const price     = product.discount
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : (product.price || 0).toFixed(2);

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: rawImages.map(toAbsUrl),
    sku: product.sku || String(product.id),
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${id}`,
      priceCurrency: 'PKR',
      price,
      availability: (product.stock || 0) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };

  // Aggregate rating (boosts click-through rate in search results)
  if (product.rating && product.reviews) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviews,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── Page Export (Server Component) ──────────────────────────────────────────
export default async function ProductPage({ params }: { params: { id: string } }) {
  return (
    <>
      {/* Inject JSON-LD into <head> for Google */}
      <ProductJsonLd id={params.id} />
      {/* Delegate all interactivity to the client component */}
      <ProductDetailClient />
    </>
  );
}

import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearino.revoticai.com';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://wearino-pk.onrender.com/api').replace(/\/api$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static Routes
  const routes = [
    '',
    '/products',
    '/categories',
    '/search',
    '/contact',
    '/auth/login'
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Dynamically fetch active products
    const productsRes = await fetch(`${API_BASE}/api/product`, { next: { revalidate: 3600 } });
    let productRoutes: MetadataRoute.Sitemap = [];
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      const products = productsData.data?.products || [];
      productRoutes = products.map((p: any) => ({
        url: `${SITE_URL}/products/${p.id || p.product_id}`,
        lastModified: new Date(p.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
    }

    // Dynamically fetch active categories
    const categoriesRes = await fetch(`${API_BASE}/api/category`, { next: { revalidate: 3600 } });
    let categoryRoutes: MetadataRoute.Sitemap = [];
    if (categoriesRes.ok) {
      const categoriesData = await categoriesRes.json();
      const categories = categoriesData.data?.categories || [];
      categoryRoutes = categories.map((c: any) => ({
        url: `${SITE_URL}/categories/${encodeURIComponent(c.name.toLowerCase())}`,
        lastModified: new Date(c.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }

    return [...routes, ...productRoutes, ...categoryRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes; // Return static routes if API fails
  }
}

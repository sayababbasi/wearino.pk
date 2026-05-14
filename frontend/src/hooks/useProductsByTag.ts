'use client';

import { useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../lib/api';

export function useProductsByTag(tag?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Map frontend tag names to backend tag names
        const tagMap: Record<string, string> = {
          'sale': 'sale',
          'new_arrivals': 'new_arrivals',
          'trending': 'trending',
          'new': 'new',
          'flash_sale': 'sale',
        };

        const backendTag = tag ? tagMap[tag] || tag : undefined;
        const allProducts = await api.getProducts(backendTag ? { tag: backendTag } : undefined);

        setProducts(allProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
        // Fallback to empty array
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [tag]);

  return { products, loading, error };
}

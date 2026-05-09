'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, apiClient } from '@/src/lib/api';

export default function CategoryFeaturesBar() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const content = await api.getContent('category_feature');
        const activeFeatures = content
          .filter((item: any) => item.isActive)
          .sort((a: any, b: any) => a.order - b.order)
          .map((item: any) => {
            let parsedMeta: any = {};
            if (typeof item.meta === 'string') {
              try {
                parsedMeta = JSON.parse(item.meta);
              } catch (e) {
                console.error("Failed to parse feature meta", e);
              }
            } else if (item.meta) {
              parsedMeta = item.meta;
            }
            
            return {
              ...item,
              imageUrl: apiClient.getImageUrl(item.imageUrl),
              subtitle: parsedMeta.subtitle || ''
            };
          });
        setFeatures(activeFeatures);
      } catch (error) {
        console.error('Failed to fetch category features:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  if (loading || features.length === 0) {
    return null; // Return null while loading or if no features to match the design silently
  }

  return (
    <div className="container-custom mt-8 mb-4">
      <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-4 md:p-6 flex flex-wrap md:flex-nowrap justify-between items-center gap-4 md:gap-2">
        {features.map((feature, index) => (
          <div key={feature.id} className="flex items-center gap-3 md:gap-4 flex-1 min-w-[140px]">
            {/* Image/Icon */}
            <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center">
              <img 
                src={feature.imageUrl || 'https://via.placeholder.com/48?text=Icon'} 
                alt={feature.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Text Content */}
            <div className="flex flex-col">
              <Link href={feature.linkUrl || '#'} className="text-[13px] md:text-sm font-bold text-gray-900 hover:text-[var(--color-gold)] transition-colors leading-tight">
                {feature.title}
              </Link>
              <span className="text-[10px] md:text-xs text-gray-500 mt-0.5 leading-tight">
                {feature.subtitle}
              </span>
            </div>

            {/* Separator (except for last item) */}
            {index < features.length - 1 && (
              <div className="hidden md:block w-px h-8 bg-gray-200 ml-auto mr-2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { api, apiClient } from '../lib/api';

export interface Banner {
    id: number;
    type: string;
    title: string;
    imageUrl: string;
    linkUrl: string;
    position: string;
    order: number;
    isActive: boolean;
    meta: any;
}

export function useBanners() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);
                // Fetch only banner type content
                const content = await api.getContent('banner');

                // Filter active banners and process image URLs
                const activeBanners = content
                    .filter((item: any) => item.isActive)
                    .map((item: any) => ({
                        ...item,
                        // Ensure imageUrl is fully qualified
                        imageUrl: apiClient.getImageUrl(item.imageUrl)
                    }));

                setBanners(activeBanners);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch banners:', err);
                setError('Failed to load banners');
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    const getBannersByPosition = (position: string) => {
        return banners.filter(b => b.position === position);
    };

    return {
        banners,
        loading,
        error,
        getBannersByPosition
    };
}

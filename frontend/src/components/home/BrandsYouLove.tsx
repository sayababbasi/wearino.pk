'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, apiClient } from '@/src/lib/api';

export default function BrandsYouLove() {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const content = await api.getContent('brand');
                setBrands(content || []);
            } catch (error) {
                console.error('Failed to fetch brands', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBrands();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (loading && brands.length === 0) return null;
    if (!loading && brands.length === 0) return null;

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="flex-1 h-[1px] bg-gray-200"></div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-[2px] uppercase text-dark-900 whitespace-nowrap">
                        Brands You Love
                    </h2>
                    <div className="flex-1 h-[1px] bg-gray-200"></div>
                </div>

                {/* Scrollable Container */}
                <div className="relative group">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide no-scrollbar"
                        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                    >
                        {brands.map((brand) => (
                            <div
                                key={brand.id}
                                className="flex-shrink-0 w-[200px] md:w-[280px] aspect-square relative group/item cursor-pointer overflow-hidden border border-gray-100"
                            >
                                {/* Background Image */}
                                <img
                                    src={apiClient.getImageUrl(brand.imageUrl)}
                                    alt={brand.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                                />

                                {/* Overlay with Title (Design from screenshot) */}
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <h3 className="text-white text-xl md:text-3xl font-black tracking-tighter uppercase text-center px-4 drop-shadow-lg">
                                        {brand.title}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg p-3 rounded-full opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg p-3 rounded-full opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </section>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/src/lib/api';

export default function TrendingCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await api.getCategories();
                // Assuming data is array of categories or has categories property
                const cats = Array.isArray(data) ? data : (data as any)?.categories || [];
                // Filter by unique slug (case-insensitive) and only parents
                const seen = new Set();
                const uniqueCats = cats.filter((c: any) => {
                    const slug = c.name.toLowerCase().replace(/\s+/g, '-');
                    if (seen.has(slug)) return false;
                    seen.add(slug);
                    return c.status === 'active' && !c.parentId;
                });
                setCategories(uniqueCats);
            } catch (error) {
                console.error('Error fetching categories for home:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (loading && categories.length === 0) return null;
    if (!loading && categories.length === 0) return null;

    return (
        <section className="py-12 bg-white overflow-hidden">
            <div className="container-custom">
                {/* Header with lines */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="flex-1 h-[1px] bg-gray-200"></div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-[2px] uppercase text-dark-900 whitespace-nowrap">
                        Trending Categories
                    </h2>
                    <div className="flex-1 h-[1px] bg-gray-200"></div>
                </div>

                {/* Scrollable Container */}
                <div className="relative group">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-8 md:gap-16 pb-8 scrollbar-hide no-scrollbar items-start"
                        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                    >
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/products?category=${category.id}`}
                                className="flex flex-col items-center flex-shrink-0 group/item"
                            >
                                {/* Circular Image Container */}
                                <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full p-1 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-transform duration-500 group-hover/item:scale-105">
                                    <div className="w-full h-full rounded-full overflow-hidden border border-gray-100">
                                        <img
                                            src={api.getImageUrl(category.image) || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=400'}
                                            alt={category.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Dynamic Badges based on names */}
                                    {category.name.toLowerCase().includes('sale') && (
                                        <div className="absolute bottom-4 right-0 bg-dark-900 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                                            Sale
                                        </div>
                                    )}
                                </div>

                                {/* Name */}
                                <h3 className="mt-4 text-sm md:text-base font-bold tracking-[0.1em] uppercase text-dark-900 transition-colors group-hover/item:text-dark-600">
                                    {category.name}
                                </h3>
                            </Link>
                        ))}
                    </div>

                    {/* Swipe indicator (as seen in screenshot) */}
                    <div className="absolute -top-10 right-0 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none md:flex hidden">
                        <span>Swipe</span>
                        <div className="flex gap-0.5">
                            <span>‹</span><span>‹</span><span>‹</span>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-4 md:-left-12 top-[40%] md:top-1/2 -translate-y-1/2 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-3 rounded-full hover:bg-dark-900 hover:text-white transition-all duration-300 z-20 group/btn"
                    >
                        <ChevronLeft size={20} className="md:size-6" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-4 md:-right-12 top-[40%] md:top-1/2 -translate-y-1/2 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-3 rounded-full hover:bg-dark-900 hover:text-white transition-all duration-300 z-20 group/btn"
                    >
                        <ChevronRight size={20} className="md:size-6" />
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

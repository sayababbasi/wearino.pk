'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, apiClient } from '@/src/lib/api';

export default function LovedAndWornBy() {
    const [influencers, setInfluencers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchInfluencers = async () => {
            try {
                const content = await api.getContent('influencer');
                setInfluencers(content || []);
            } catch (error) {
                console.error('Failed to fetch influencers', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInfluencers();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (loading && influencers.length === 0) return null;
    if (!loading && influencers.length === 0) return null;

    return (
        <section className="py-16 bg-[#fcfcfc] overflow-hidden">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center gap-4 mb-16">
                    <div className="flex-1 h-[1px] bg-gray-200"></div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-[2px] uppercase text-dark-900 whitespace-nowrap">
                        Loved and Worn By
                    </h2>
                    <div className="flex-1 h-[1px] bg-gray-200"></div>
                </div>

                {/* Scrollable Container */}
                <div className="relative group">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-8 md:gap-12 pb-6 scrollbar-hide no-scrollbar"
                        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                    >
                        {influencers.map((person) => (
                            <div
                                key={person.id}
                                className="flex-shrink-0 flex flex-col items-center group/item"
                            >
                                {/* Circular Profile Image (Matching screenshot) */}
                                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full p-1 bg-white shadow-xl transition-transform duration-500 group-hover/item:scale-105">
                                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-100">
                                        <img
                                            src={apiClient.getImageUrl(person.imageUrl)}
                                            alt={person.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Name underneath with specific style */}
                                <h3 className="mt-8 text-2xl md:text-4xl font-black tracking-tighter uppercase text-[#5a1b1b] transition-colors group-hover/item:text-[#a52a2a]">
                                    {person.title}
                                </h3>
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

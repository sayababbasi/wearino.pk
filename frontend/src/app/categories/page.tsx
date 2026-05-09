'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/src/lib/api';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const data = await api.getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="container-custom py-12 text-center">
                <p>Loading categories...</p>
            </div>
        );
    }

    return (
        <div className="container-custom py-12">
            <h1 className="text-4xl font-bold mb-8">Shop by Category</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/categories/${category.id}`}
                        className="block group relative overflow-hidden rounded-lg aspect-[4/3] bg-gray-100"
                    >
                        {category.image && (
                            <img
                                src={api.getImageUrl(category.image)}
                                alt={category.name}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <h2 className="text-white text-2xl font-bold tracking-wider uppercase">
                                {category.name}
                            </h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

'use client';

import { Heart } from 'lucide-react';
import ProductCard from '@/src/components/product/ProductCard';
import { useWishlistStore } from '@/src/lib/store';
import Link from 'next/link';

export default function WishlistPage() {
  const { items } = useWishlistStore();

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
        <p className="text-dark-600">
          {items.length} {items.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-24 h-24 bg-dark-100 rounded-full flex items-center justify-center mx-auto">
                <Heart size={48} className="text-dark-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-dark-600 mb-6">
              Start adding items you love to keep track of them!
            </p>
            <Link
              href="/products"
              className="group relative overflow-hidden px-8 py-3 font-semibold text-white bg-black border border-black transition-colors inline-block"
            >
              <span className="relative z-10 font-extralight transition-colors duration-300 group-hover:text-black">
                Continue Shopping
              </span>
              <span className="absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
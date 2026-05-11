'use client';

import { useState, useEffect } from 'react';
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  ShoppingBag,
  Plus,
  ChevronRight,
  Star,
  ExternalLink,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { useWishlistStore, useCartStore } from '@/src/lib/store';
import { api } from '@/src/lib/api';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: any) => {
    addItemToCart(product, 1);
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-dark-900 uppercase tracking-tight">Curated Wishlist</h1>
          <p className="text-dark-400 text-sm font-medium mt-1">Manage your elite collection and priority acquisitions.</p>
        </div>
        
        {items.length > 0 && (
          <button 
            onClick={clearWishlist}
            className="h-12 px-8 bg-white border-2 border-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 hover:border-red-100 transition-all"
          >
            <Trash2 size={16} /> Purge Collection
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((product) => (
            <div key={product.product_id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-gold-500/5 transition-all duration-700 flex flex-col relative">
              {/* Image Section */}
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                <img 
                  src={api.getImageUrl(product.image)} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                   <Link 
                    href={`/products/${product.product_id}`}
                    className="w-12 h-12 rounded-full bg-white text-dark-900 flex items-center justify-center shadow-2xl hover:bg-gold-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75"
                  >
                    <ExternalLink size={20} />
                  </Link>
                </div>

                <button 
                  onClick={() => removeItem(product.product_id)}
                  className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-xl"
                  title="Remove from wishlist"
                >
                  <Trash2 size={20} />
                </button>
                
                {product.discount > 0 && (
                  <div className="absolute top-6 left-6 bg-dark-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase">
                    -{product.discount}% Priority Offer
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] text-dark-300 font-black uppercase tracking-widest">{product.category_name || 'Premium Selection'}</p>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="fill-gold-500 text-gold-500" />
                    <span className="text-[10px] font-black text-dark-900">4.8</span>
                  </div>
                </div>

                <Link href={`/products/${product.product_id}`}>
                  <h3 className="text-lg font-black text-dark-900 line-clamp-1 group-hover:text-gold-600 transition-colors mb-2 uppercase tracking-tight">{product.name}</h3>
                </Link>

                <div className="flex items-baseline gap-3 mb-8">
                  <span className="text-xl font-black text-dark-900 tracking-tight">Rs. {product.price?.toLocaleString()}</span>
                  {product.discount > 0 && (
                    <span className="text-xs text-dark-300 line-through font-bold">
                      Rs. {(product.price * (1 + product.discount / 100)).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 flex gap-4">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 h-14 bg-dark-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-dark-900/10"
                  >
                    <ShoppingCart size={18} className="text-gold-500" /> Add to Collection
                  </button>
                  <Link 
                    href={`/products/${product.product_id}`}
                    className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-dark-300 hover:text-dark-900 hover:bg-gold-50 transition-all border border-gray-100"
                  >
                    <ArrowUpRight size={24} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200 p-24 text-center">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm relative group">
            <Heart className="text-gray-100 group-hover:text-rose-100 transition-colors duration-700" size={56} />
            <Plus className="absolute -top-1 -right-1 text-gold-500 animate-bounce" size={32} />
          </div>
          <h2 className="text-3xl font-black text-dark-900 uppercase tracking-tight">Gallery is Empty</h2>
          <p className="text-dark-400 text-sm font-medium mt-3 max-w-sm mx-auto leading-relaxed">
            Your personal collection awaits selection. Curate your favorite items from our latest high-fashion drops.
          </p>
          <Link 
            href="/products" 
            className="mt-12 inline-flex items-center gap-4 bg-dark-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-dark-900/20"
          >
            Start Curating <ArrowRight size={20} className="text-gold-500" />
          </Link>
        </div>
      )}
    </div>
  );
}

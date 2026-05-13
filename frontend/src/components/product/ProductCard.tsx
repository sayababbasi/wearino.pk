
'use client';

import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import { useWishlistStore, useCartStore } from '@/src/lib/store';
import { useToast } from '@/src/components/common/Toast';
import { useState } from 'react';
import CartDrawer from '@/src/components/cart/CartDrawer';
import { api, getImageUrl } from '@/src/lib/api';
import { formatPrice } from '@/src/lib/utils';
import type { Product } from '@/src/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const { showToast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const inWishlist = isInWishlist(product.product_id);

  // Extract unique sizes from variants or sizes array
  const extractedSizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : product.variants && product.variants.length > 0
      ? Array.from(new Set(product.variants.filter(v => v.isActive).map(v => v.size)))
      : [];

  const displaySizes = extractedSizes.length > 0 ? extractedSizes : ['One Size'];

  // Initialize selectedSize with the first available option
  const [selectedSize, setSelectedSize] = useState(displaySizes[0]);

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(product.product_id);
      showToast('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      showToast('Added to favorites! ', 'success');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock !== undefined && product.stock <= 0) {
      showToast('Sorry, this product is currently out of stock.', 'info');
      return;
    }

    const defaultColor = product.variants && product.variants.length > 0
      ? (product.variants.find(v => v.size === selectedSize)?.color || product.variants[0].color || 'Default')
      : 'Default';

    // Add to cart with dynamic size and color
    addToCart(product, 1, selectedSize, defaultColor);
    showToast(`Added ${product.name} (${selectedSize}) to cart!`, 'success');
    setIsCartOpen(true);
  };

  const productImage = product.images?.[0] || product.image;
  const imageUrl = productImage ? getImageUrl(productImage) : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800';

  return (
    <>
      <div className="group relative flex flex-col h-full bg-white transition-all duration-300">
        {/* Image Container */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F5F5F5] shrink-0">
          <Link href={`/products/${product.product_id}`} className="block w-full h-full relative">
            <img
              src={imageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            />
          </Link>

          {/* Action Overlay Block - Premium Slide Up */}
          <div className="absolute inset-x-0 bottom-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out p-4 space-y-3 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-black/5 hidden md:block">
            <button
              onClick={handleQuickAdd}
              disabled={product.stock !== undefined && product.stock <= 0}
              className={`w-full py-3.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 ${product.stock !== undefined && product.stock <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-dark-900 text-white hover:bg-black'
                }`}
            >
              {product.stock !== undefined && product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlistToggle}
              className="w-full flex items-center justify-center gap-2.5 py-1.5 group/wishlist"
            >
              <Heart
                size={14}
                className={`transition-all duration-300 ${inWishlist ? 'text-red-500 fill-red-500 scale-110' : 'text-dark-900 group-hover/wishlist:text-red-500 group-hover/wishlist:scale-110'}`}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-900 group-hover/wishlist:text-red-500 transition-colors">
                {inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </span>
            </button>
          </div>

          {/* Luxury Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.discount && product.discount > 0 && (
              <span className="bg-[#FF4D4D] text-white text-[10px] font-black tracking-[0.2em] uppercase px-3.5 py-1.5 shadow-xl">
                -{product.discount}%
              </span>
            )}
            {product.stock !== undefined && product.stock <= 0 && (
              <span className="bg-white/95 backdrop-blur-sm text-red-600 text-[10px] font-black tracking-[0.2em] uppercase px-3.5 py-1.5 border border-red-500/10 shadow-lg">
                Sold Out
              </span>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-3 md:hidden">
            <button
              className={`p-2.5 rounded-full shadow-xl backdrop-blur-md transition-all duration-300 active:scale-90 ${inWishlist ? 'bg-red-500 text-white' : 'bg-white/95 text-dark-900'
                }`}
              onClick={handleWishlistToggle}
            >
              <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              className="p-2.5 rounded-full shadow-xl bg-dark-900 text-white backdrop-blur-md transition-all duration-300 active:scale-95"
              onClick={handleQuickAdd}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Product Details Section - Professional & Clean */}
        <div className="flex flex-col flex-1 px-4 pb-4 pt-3 text-center bg-white">
          <div className="flex flex-col justify-start min-h-[52px] mb-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">
              {product.category_name || 'Collection'}
            </span>
            <h3 className="text-[13px] font-medium text-black tracking-[0.05em] line-clamp-2 leading-[1.3] group-hover:underline decoration-black/30 underline-offset-4 decoration-1 h-[34px] flex items-start justify-center">
              <Link href={`/products/${product.product_id}`}>{product.name}</Link>
            </h3>
          </div>

          <div className="flex flex-col mt-auto gap-3">
            {/* Price Display */}
            <div className="flex items-center justify-center gap-2 h-[24px]">
              {(product.discount || 0) > 0 ? (
                <>
                  <span className="text-[15px] font-bold text-[#D93025]">
                    Rs {discountedPrice.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-gray-400 line-through font-medium">
                    Rs {product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-[15px] font-bold text-black">
                  Rs {product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Size Selection - Always Valid */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 min-h-[28px] w-full">
              {displaySizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`min-w-[28px] h-[26px] px-2 flex items-center justify-center text-[10px] font-medium border transition-all duration-200 ${selectedSize === size
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 text-gray-500 hover:border-black hover:text-black bg-transparent'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Wishlist Button (Mobile Only) */}
            <button
              onClick={handleWishlistToggle}
              className="mt-0.5 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 hover:text-[#D93025] transition-colors md:hidden h-[20px]"
            >
              <Heart size={12} className={inWishlist ? 'text-[#D93025] fill-[#D93025]' : ''} />
              {inWishlist ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

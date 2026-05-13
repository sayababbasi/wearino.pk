'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/src/lib/store';
import { formatPrice } from '@/src/lib/utils';
import { api, getImageUrl } from '@/src/lib/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CTA_BUTTON_CLASS =
  'group relative overflow-hidden px-8 py-3 font-semibold text-white bg-black border border-black transition-colors';
const CTA_BUTTON_TEXT_CLASS =
  'relative z-10 font-extralight transition-colors duration-300 group-hover:text-black';
const CTA_BUTTON_OVERLAY_CLASS =
  'absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100';

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 75 ? 0 : 10;

  useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  return (
    <>
      {/* Backdrop - Semi-transparent*/}
      <div
        className="fixed inset-0 bg-black/30 z-60 animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer - Slides from right */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white z-70 shadow-2xl animate-slideInRight">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-100">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-dark-900" />
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-dark-900">
                Shopping Bag ({items.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:rotate-90 transition-transform duration-300"
            >
              <X size={24} strokeWidth={1} />
            </button>
          </div>

          {/* Cart Items */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-16 h-16 border border-dark-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={30} strokeWidth={1} className="text-dark-300" />
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3">Your Bag is Empty</h3>
              <p className="text-[11px] text-dark-400 uppercase tracking-widest mb-8 leading-loose">
                Explore our collections and <br /> find your perfect look.
              </p>
              <button
                onClick={onClose}
                className="bg-dark-900 text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all"
              >
                Go Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {items.map((item) => {
                  const itemPrice = item.discount
                    ? item.price * (1 - item.discount / 100)
                    : item.price;

                  return (
                    <div
                      key={item.product_id}
                      className="flex gap-5 bg-white relative"
                    >
                      {/* Image */}
                      <Link
                        href={`/products/${item.product_id}`}
                        onClick={onClose}
                        className="shrink-0 w-24 aspect-[3/4] bg-dark-50 overflow-hidden"
                      >
                        <img
                          src={getImageUrl(item.image || (item.images && item.images[0]))}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 flex flex-col pt-1">
                        <div className="flex justify-between items-start mb-2">
                          <Link
                            href={`/products/${item.product_id}`}
                            onClick={onClose}
                          >
                            <h3 className="text-[11px] font-black uppercase tracking-widest hover:text-dark-500 transition-colors line-clamp-1">
                              {item.name}
                            </h3>
                          </Link>
                          <button
                            onClick={() => removeItem(item.product_id, item.selectedSize, item.selectedColor)}
                            className="text-dark-300 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Size & Color */}
                        <div className="flex gap-3 mb-3">
                          {item.selectedSize && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-dark-400 px-2 py-0.5 border border-dark-100">
                              Size: {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-dark-400 px-2 py-0.5 border border-dark-100">
                              Color: {item.selectedColor}
                            </span>
                          )}
                        </div>

                        {/* Pricing and Qty */}
                        <div className="mt-auto flex items-end justify-between">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-black text-dark-900 leading-none">
                                Rs {itemPrice.toLocaleString()}
                              </span>
                              {(item.discount || 0) > 0 && (
                                <span className="text-[10px] text-dark-300 line-through leading-none">
                                  Rs {item.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {item.quantity > 1 && (
                              <span className="text-[9px] text-dark-400 font-bold uppercase tracking-widest">
                                Unit: Rs {itemPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center border border-dark-100 bg-white">
                            <button
                              onClick={() => {
                                if (item.quantity === 1) {
                                  removeItem(item.product_id, item.selectedSize, item.selectedColor);
                                } else {
                                  updateQuantity(item.product_id, item.quantity - 1, item.selectedSize, item.selectedColor);
                                }
                              }}
                              className="w-8 h-8 flex items-center justify-center hover:bg-dark-50 transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-8 text-[11px] font-black text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product_id, item.quantity + 1, item.selectedSize, item.selectedColor)
                              }
                              className="w-8 h-8 flex items-center justify-center hover:bg-dark-50 transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-8 bg-white border-t border-dark-100">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.15em] text-dark-400">
                    <span>Subtotal</span>
                    <span className="text-dark-900">Rs {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.15em] text-dark-400">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-600" : "text-dark-900"}>
                      {shipping === 0 ? "Complimentary" : `Rs ${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] font-black uppercase tracking-[0.2em] text-dark-900 pt-4 border-t border-dark-50">
                    <span>Grand Total</span>
                    <span>Rs {(totalPrice + shipping).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="w-full bg-dark-900 text-white py-4 text-[11px] font-black uppercase tracking-[0.25em] text-center hover:bg-black transition-all shadow-xl"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="w-full bg-white text-dark-900 border border-dark-900 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-center hover:bg-dark-50 transition-all mb-4"
                  >
                    View Shopping Bag
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
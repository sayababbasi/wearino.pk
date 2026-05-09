'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/src/lib/store';
import { useToast } from '@/src/components/common/Toast';
import { formatPrice } from '@/src/lib/utils';
import { api } from '@/src/lib/api';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { showToast } = useToast();
  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 75 ? 0 : 10;
  const finalTotal = totalPrice + shipping;

  const handleRemove = (productId: string, productName: string) => {
    removeItem(productId);
    showToast(`${productName} removed from cart`, 'info');
  };

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-24 h-24 bg-dark-100 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={48} className="text-dark-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-dark-600 mb-8">
            Looks like you haven't added anything to your cart yet.
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
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemPrice = item.discount
              ? item.price * (1 - item.discount / 100)
              : item.price;

            return (
              <div key={item.product_id} className="card p-6">
                <div className="flex gap-6">
                  {/* Image */}
                  <Link
                    href={`/products/${item.product_id}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={api.getImageUrl(item.image)}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <Link href={`/products/${item.product_id}`}>
                          <h3 className="font-semibold text-lg hover:underline">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-dark-600 mt-1">
                          {item.category_name}
                        </p>
                        {item.selectedSize && (
                          <p className="text-sm text-dark-600 mt-1">
                            Size: <span className="font-medium">{item.selectedSize}</span>
                          </p>
                        )}
                        {item.selectedColor && (
                          <p className="text-sm text-dark-600 mt-1">
                            Color: <span className="font-medium">{item.selectedColor}</span>
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {formatPrice(itemPrice * item.quantity)}
                        </p>
                        {item.discount && (
                          <p className="text-sm text-dark-500 line-through">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product_id, item.quantity, -1)
                          }
                          className="w-8 h-8 border border-dark-300 rounded hover:bg-dark-50 flex items-center justify-center"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product_id, item.quantity, 1)
                          }
                          className="w-8 h-8 border border-dark-300 rounded hover:bg-dark-50 flex items-center justify-center"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.product_id, item.name)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={18} />
                        <span className="text-sm font-medium">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Clear Cart */}
          <button
            onClick={() => {
              clearCart();
              showToast('Cart cleared', 'info');
            }}
            className="btn-secondary w-full"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-dark-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-600">Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {totalPrice < 75 && (
                <p className="text-sm text-dark-600">
                  Add {formatPrice(75 - totalPrice)} more for free shipping!
                </p>
              )}
              <div className="border-t border-dark-200 pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="group relative overflow-hidden px-8 py-3 font-semibold text-white bg-black border border-black transition-colors w-full text-center block mb-4"
            >
              <span className="relative z-10 font-extralight transition-colors duration-300 group-hover:text-black">
                Proceed to Checkout
              </span>
              <span className="absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
            </Link>

            <Link
              href="/products"
              className="btn-secondary w-full text-center block"
            >
              Continue Shopping
            </Link>

            {/* Security Icons */}
            <div className="mt-6 pt-6 border-t border-dark-200">
              <p className="text-sm text-dark-600 text-center mb-3">
                Secure Checkout
              </p>
              <div className="flex justify-center gap-4 opacity-50">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                  alt="Visa"
                  className="h-6"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                  alt="Mastercard"
                  className="h-6"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                  alt="PayPal"
                  className="h-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Lock, MapPin, User, Check, ChevronRight, Tag, X } from 'lucide-react';
import { useCartStore, useOrderStore } from '@/src/lib/store';
import { useToast } from '@/src/components/common/Toast';
import { formatPrice } from '@/src/lib/utils';
import { apiClient, api } from '@/src/lib/api';
import Link from 'next/link';

const CTA_BUTTON_CLASS =
  'group relative overflow-hidden px-8 py-3 font-semibold text-white bg-black border border-black transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed';
const CTA_BUTTON_TEXT_CLASS =
  'relative z-10 font-extralight transition-colors duration-300 group-hover:text-black';
const CTA_BUTTON_OVERLAY_CLASS =
  'absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { setOrder } = useOrderStore();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Contact Information
    email: '',
    phone: '',

    // Shipping Information
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',

    // Payment Information
    paymentMethod: 'cod', // cod, card
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 75 ? 0 : 10;
  const tax = totalPrice * 0.08; // 8% tax
  const discount = appliedCoupon?.discountAmount || 0;
  const finalTotal = totalPrice + shipping + tax - discount;

  const generateOrderNumber = () => {
    return Math.random().toString(36).substring(2, 11).toUpperCase();
  };

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5); // 5 days from now

    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const startDate = deliveryDate.toLocaleDateString('en-US', options);
    deliveryDate.setDate(deliveryDate.getDate() + 2);
    const endDate = deliveryDate.toLocaleDateString('en-US', options);

    return `${startDate} - ${endDate}`;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const productIds = items.map(item => item.product_id || (item as any).id);
      const response = await api.post('/coupons/validate', {
        code: couponCode,
        cartTotal: totalPrice,
        productIds
      });

      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        showToast(`Coupon applied! You save ${formatPrice(response.data.coupon.discountAmount)}`, 'success');
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Prepare shipping address
      const shippingAddress = {
        name: `${formData.firstName} ${formData.lastName}`,
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
      };

      // Prepare order items for backend
      const orderItems = items.map(item => ({
        productId: (item.product_id || (item as any).id)?.toString(),
        quantity: item.quantity,
        price: item.discount
          ? item.price * (1 - item.discount / 100)
          : item.price,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      }));

      // Handle payment method
      if (formData.paymentMethod === 'card') {
        // Stripe payment - create checkout session
        try {
          const stripeResponse = await apiClient.post('/payment/create-checkout-session', {
            items: orderItems,
            shippingAddress,
          });

          const sessionId = (stripeResponse.data as any)?.id;
          if (sessionId) {
            // Redirect to Stripe Checkout
            const stripe = (window as any).Stripe;
            if (!stripe) {
              throw new Error('Stripe not loaded');
            }

            const stripeInstance = stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
            const { error } = await stripeInstance.redirectToCheckout({
              sessionId: sessionId,
            });

            if (error) {
              throw error;
            }
            return; // Redirect will happen
          }
        } catch (stripeError: any) {
          console.error('Stripe error:', stripeError);
          showToast(stripeError.message || 'Payment processing failed', 'error');
          setIsProcessing(false);
          return;
        }
      } else {
        // Cash on Delivery - create order directly
        // Backend will auto-generate order number in #W-XXX format

        const orderResponse = await api.createOrder({
          shippingAddress,
          paymentMethod: 'cod',
          items: orderItems,
          couponCode: appliedCoupon?.code || null,
          couponDiscount: discount,
          subtotal: totalPrice,
        } as any);

        // Check if orderResponse exists and has error
        if (!orderResponse) {
          throw new Error('Failed to create order: No response from server');
        }

        if (orderResponse.error) {
          throw new Error(orderResponse.error);
        }

        const order = orderResponse.data || orderResponse;
        const orderNumber = (order as any).order?.orderNumber || (order as any).orderNumber || "PENDING";

        // Generate order data for receipt
        const orderDate = new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        const estimatedDelivery = getEstimatedDelivery();

        const orderData = {
          orderNumber,
          orderDate,
          estimatedDelivery,
          customerName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          shippingAddress,
          paymentMethod: 'Cash on Delivery (COD)',
          items: items,
          subtotal: totalPrice,
          shipping: shipping,
          tax: tax,
          discount: discount,
          couponCode: appliedCoupon?.code,
          total: finalTotal,
        };

        // Save order data to store
        setOrder(orderData);
        setIsOrderComplete(true);

        showToast('Order placed successfully! 🎉', 'success');
        clearCart();
        // Redirect to dynamic route with proper ID (remove # if present)
        router.push(`/orderReceipt/${orderNumber.toString().replace('#', '')}`);
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      showToast(error.message || 'Failed to place order. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
      if (!formData.phone || formData.phone.trim() === '') {
        showToast('Please enter a phone number', 'error');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.firstName || !formData.lastName || !formData.address || !formData.city) {
        showToast('Please fill in all required fields', 'error');
        return;
      }
      setCurrentStep(3);
    }
  };

  // Redirect if cart is empty and order is not being processed
  useEffect(() => {
    if (items.length === 0 && !isOrderComplete) {
      router.push('/cart');
    }
  }, [items.length, isOrderComplete, router]);

  // Return null if cart is empty to prevent rendering
  if (items.length === 0 && !isOrderComplete) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-50">
      <div className="container-custom py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'bg-black text-white border-black' : 'bg-white border-dark-300 text-dark-600'
                }`}>
                {currentStep > 1 ? <Check size={20} /> : '1'}
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= 1 ? 'text-black' : 'text-dark-600'}`}>
                Contact
              </span>
            </div>
            <ChevronRight size={20} className="text-dark-400" />
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'bg-black text-white border-black' : 'bg-white border-dark-300 text-dark-600'
                }`}>
                {currentStep > 2 ? <Check size={20} /> : '2'}
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= 2 ? 'text-black' : 'text-dark-600'}`}>
                Shipping
              </span>
            </div>
            <ChevronRight size={20} className="text-dark-400" />
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'bg-black text-white border-black' : 'bg-white border-dark-300 text-dark-600'
                }`}>
                {currentStep > 3 ? <Check size={20} /> : '3'}
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= 3 ? 'text-black' : 'text-dark-600'}`}>
                Payment
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <div className="bg-white p-6 rounded-lg border border-dark-200">
                  <div className="flex items-center gap-3 mb-6">
                    <User size={24} className="text-black" />
                    <h2 className="text-2xl font-light">Contact Information</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-dark-700">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        onInvalid={(e) => {
                          e.preventDefault();
                          showToast('Please enter a valid email address', 'error');
                        }}
                        className="w-full px-4 py-3 border border-dark-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-dark-700">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        onInvalid={(e) => {
                          (e.target as HTMLInputElement).setCustomValidity('Please enter a valid phone number');
                        }}
                        onInput={(e) => {
                          (e.target as HTMLInputElement).setCustomValidity('');
                        }}
                        className="w-full px-4 py-3 border border-dark-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className={CTA_BUTTON_CLASS.replace('w-full', 'w-full mt-6')}
                  >
                    <span className={CTA_BUTTON_TEXT_CLASS}>Continue to Shipping</span>
                    <span className={CTA_BUTTON_OVERLAY_CLASS}></span>
                  </button>
                </div>
              )}

              {/* Step 2: Shipping Information */}
              {currentStep === 2 && (
                <div className="bg-white p-6 rounded-lg border border-dark-200">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin size={24} className="text-black" />
                    <h2 className="text-2xl font-light">Shipping Address</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-dark-700">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-dark-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-dark-700">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-dark-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2 text-dark-700">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-dark-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Street address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-dark-700">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-dark-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-dark-700">
                        State *
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-dark-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-dark-700">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-dark-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 border border-dark-300 bg-white text-dark-900 hover:bg-dark-50 transition-colors rounded"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className={CTA_BUTTON_CLASS.replace('w-full', 'flex-1')}
                    >
                      <span className={CTA_BUTTON_TEXT_CLASS}>Continue to Payment</span>
                      <span className={CTA_BUTTON_OVERLAY_CLASS}></span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <div className="bg-white p-6 rounded-lg border border-dark-200">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard size={24} className="text-black" />
                    <h2 className="text-2xl font-light">Payment Method</h2>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center p-4 border-2 border-dark-300 rounded cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={(e) =>
                          setFormData({ ...formData, paymentMethod: e.target.value })
                        }
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Cash on Delivery (COD)</div>
                        <div className="text-sm text-dark-600">Pay when you receive your order</div>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border-2 border-dark-300 rounded cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={(e) =>
                          setFormData({ ...formData, paymentMethod: e.target.value })
                        }
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-sm text-dark-600">Secure payment processing</div>
                      </div>
                    </label>
                  </div>

                  {/* Card Details (if card selected) */}
                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4 border-t border-dark-200 pt-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-dark-700">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          value={formData.cardNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, cardNumber: e.target.value })
                          }
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-dark-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          maxLength={19}
                          required={formData.paymentMethod === 'card'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-dark-700">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          value={formData.cardName}
                          onChange={(e) =>
                            setFormData({ ...formData, cardName: e.target.value })
                          }
                          placeholder="John Doe"
                          className="w-full px-4 py-3 border border-dark-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          required={formData.paymentMethod === 'card'}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-dark-700">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            value={formData.expiryDate}
                            onChange={(e) =>
                              setFormData({ ...formData, expiryDate: e.target.value })
                            }
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border border-dark-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            maxLength={5}
                            required={formData.paymentMethod === 'card'}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-dark-700">
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={formData.cvv}
                            onChange={(e) =>
                              setFormData({ ...formData, cvv: e.target.value })
                            }
                            placeholder="123"
                            className="w-full px-4 py-3 border border-dark-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            maxLength={4}
                            required={formData.paymentMethod === 'card'}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-6 text-sm text-dark-600">
                    <Lock size={16} />
                    <span>Your payment information is secure and encrypted</span>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 border border-dark-300 bg-white text-dark-900 hover:bg-dark-50 transition-colors rounded"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={CTA_BUTTON_CLASS.replace('w-full', 'flex-1')}
                    >
                      <span className={CTA_BUTTON_TEXT_CLASS}>
                        {isProcessing ? 'Processing...' : 'Place Order'}
                      </span>
                      <span className={CTA_BUTTON_OVERLAY_CLASS}></span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg border border-dark-200 sticky top-24">
                <h2 className="text-xl font-light mb-6 uppercase tracking-wide">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {items.map((item) => {
                    const itemPrice = item.discount
                      ? item.price * (1 - item.discount / 100)
                      : item.price;

                    return (
                      <div key={item.product_id} className="flex gap-4 pb-4 border-b border-dark-200 last:border-0">
                        <img
                          src={api.getImageUrl(item.images?.[0] || (item as any).image)}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2 mb-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-dark-600 mb-2">
                            Qty: {item.quantity}
                            {item.selectedSize && ` • Size: ${item.selectedSize}`}
                            {item.selectedColor && ` • ${item.selectedColor}`}
                          </p>
                          <p className="text-sm font-semibold">
                            {formatPrice(itemPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Input */}
                <div className="border-t border-dark-200 pt-4 mb-4">
                  {!appliedCoupon ? (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-dark-700">Coupon Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          placeholder="Enter code"
                          className="flex-1 px-3 py-2 border border-dark-300 rounded text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                          className="px-4 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                        >
                          {couponLoading ? 'Checking...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-600 mt-1">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-green-600" />
                          <span className="text-sm font-medium text-green-900">{appliedCoupon.code}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-dark-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600">Tax</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-dark-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Continue Shopping Link */}
                <Link
                  href="/products"
                  className="block text-center text-sm text-dark-600 hover:text-black mt-6 pt-6 border-t border-dark-200 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

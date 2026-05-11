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

  // Logistics & Financial state
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [globalTax, setGlobalTax] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
    paymentMethod: 'cod',
    transactionId: '',
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zonesRes, methodsRes, settingsRes] = await Promise.all([
          api.getDeliveryZones(),
          api.getPaymentMethods(),
          api.getSettings()
        ]) as [any, any, any];
        
        setDeliveryZones(zonesRes.zones || []);
        setPaymentMethods(methodsRes.methods?.filter((m: any) => m.isActive) || []);
        const taxSetting = settingsRes.settings?.find((s: any) => s.key === 'global_tax_percent');
        if (taxSetting) setGlobalTax(parseFloat(taxSetting.value));
      } catch (error) {
        console.error('Failed to load checkout config:', error);
      }
    };
    fetchData();
  }, []);

  const totalPrice = getTotalPrice();
  const subtotal = totalPrice; // Alias for compatibility
  const discount = appliedCoupon?.discountAmount || 0;

  // Real-time Calculations
  useEffect(() => {
    // 1. Calculate Shipping
    const zone = deliveryZones.find(z => z.name.toLowerCase() === (formData.city || '').toLowerCase());
    let fee = zone ? parseFloat(zone.charge) : 150; 
    if (zone?.freeDeliveryThreshold && totalPrice >= zone.freeDeliveryThreshold) {
      fee = 0;
    }
    setShippingFee(fee);

    // 2. Calculate Tax
    let totalTax = 0;
    items.forEach(item => {
      const taxRate = (item as any).taxOverride !== undefined ? (item as any).taxOverride : globalTax;
      totalTax += (item.price * item.quantity * taxRate) / 100;
    });
    setTaxAmount(totalTax);

  }, [formData.city, formData.paymentMethod, deliveryZones, paymentMethods, totalPrice, globalTax, items]);

  const shipping = shippingFee;
  const tax = taxAmount;
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
      setCouponError(error.message || 'Invalid coupon code');
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
      const orderResponse = await api.createOrder({
        shippingAddress,
        paymentMethod: formData.paymentMethod,
        items: orderItems,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: discount,
        subtotal: subtotal,
        shippingCharges: shipping,
        taxAmount: tax,
        paymentInfo: {
          transactionId: formData.transactionId || null,
        }
      } as any);

      if (!orderResponse || orderResponse.error) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      const order = (orderResponse as any).data?.order || (orderResponse as any).order;
      const orderNumber = order?.orderNumber || "PENDING";

      // Prepare data for store/receipt
      const orderData = {
        orderNumber,
        orderDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        estimatedDelivery: getEstimatedDelivery(),
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        shippingAddress,
        paymentMethod: paymentMethods.find(m => m.type === formData.paymentMethod)?.providerName || formData.paymentMethod,
        items: items,
        subtotal: subtotal,
        shipping: shippingFee,
        tax: taxAmount,
        discount: discount,
        couponCode: appliedCoupon?.code,
        total: finalTotal,
      };

      setOrder(orderData);
      setIsOrderComplete(true);
      showToast('Order placed successfully! 🎉', 'success');
      clearCart();
      
      // Redirect to dynamic receipt route
      router.push(`/orderReceipt/${orderNumber.toString().replace('#', '')}`);

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
                    {/* Dynamic Payment Methods */}
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="space-y-4">
                          <div
                            className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === method.type ? 'border-black bg-gray-50' : 'border-gray-100'
                              }`}
                            onClick={() => setFormData({ ...formData, paymentMethod: method.type })}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${formData.paymentMethod === method.type ? 'border-black' : 'border-gray-300'
                              }`}>
                              {formData.paymentMethod === method.type && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                            </div>
                            <div className="ml-4 flex-1">
                              <span className="block text-sm font-bold text-gray-900">{method.providerName}</span>
                              <span className="block text-xs text-gray-500 mt-1 leading-relaxed">{method.instructions}</span>
                              
                              {/* Bank Details Section */}
                              {formData.paymentMethod === method.type && (method.accountNumber || method.iban) && (
                                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-dark-400 mb-2">Transfer Details</p>
                                  {method.accountTitle && (
                                    <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                      <span className="text-[11px] text-gray-500">Account Title</span>
                                      <span className="text-[11px] font-bold text-black">{method.accountTitle}</span>
                                    </div>
                                  )}
                                  {method.accountNumber && (
                                    <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                      <span className="text-[11px] text-gray-500">Account Number</span>
                                      <span className="text-[11px] font-bold text-black font-mono">{method.accountNumber}</span>
                                    </div>
                                  )}
                                  {method.iban && (
                                    <div className="flex flex-col py-1">
                                      <span className="text-[11px] text-gray-500 mb-1">IBAN</span>
                                      <span className="text-[11px] font-bold text-black font-mono break-all">{method.iban}</span>
                                    </div>
                                  )}
                                  <p className="text-[10px] text-amber-600 mt-2 font-medium italic">
                                    * Please transfer the amount before placing the order.
                                  </p>
                                </div>
                              )}

                              {method.extraFee > 0 && (
                                <span className="inline-block mt-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest">+ {formatPrice(method.extraFee)} Surcharge</span>
                              )}
                            </div>
                          </div>

                          {/* Transaction ID Input for Manual Payments */}
                          {formData.paymentMethod === method.type && method.type !== 'cod' && (
                            <div className="ml-9 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Transaction ID / Reference Number</label>
                              <input
                                type="text"
                                value={formData.transactionId}
                                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                placeholder="Enter your payment reference"
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black text-sm"
                              />
                              <p className="text-[9px] text-gray-400 italic">Optional: You can also upload the screenshot on the next page.</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

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
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                  {items.map((item) => {
                    const itemPrice = item.discount
                      ? item.price * (1 - item.discount / 100)
                      : item.price;

                    return (
                      <div key={item.product_id || (item as any).id} className="flex gap-4">
                        <div className="relative w-16 h-16 bg-dark-50 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={api.getImageUrl(item.image || item.images?.[0])}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-dark-900 truncate">{item.name}</h4>
                          <p className="text-xs text-dark-500 mt-1">
                            {item.selectedSize && `Size: ${item.selectedSize}`}
                            {item.selectedColor && ` / Color: ${item.selectedColor}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatPrice(itemPrice * item.quantity)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code */}
                <div className="py-6 border-t border-dark-200">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon Code"
                        className="w-full pl-10 pr-4 py-2 border border-dark-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        disabled={!!appliedCoupon || couponLoading}
                      />
                    </div>
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="p-2 text-dark-400 hover:text-red-500 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2 bg-black text-white text-sm font-medium rounded disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {couponError && (
                    <p className="mt-2 text-xs text-red-500">{couponError}</p>
                  )}
                  {appliedCoupon && (
                    <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                      <Check size={12} />
                      Coupon "{appliedCoupon.code}" applied
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-6 border-t border-dark-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : ''}`}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600">Tax</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-dark-200 pt-4 mt-4">
                    <div className="flex justify-between text-lg font-semibold uppercase tracking-tight">
                      <span>Total</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/products"
                  className="block text-center text-sm text-dark-600 hover:text-black mt-6 pt-6 border-t border-dark-200 transition-colors uppercase tracking-widest text-[10px] font-bold"
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

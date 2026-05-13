'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Mail, Truck, Package, CreditCard, MapPin, Download, Printer, Clock, Check, ShieldCheck, MessageSquare } from 'lucide-react';
import { useOrderStore } from '@/src/lib/store';
import { useToast } from '@/src/components/common/Toast';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { api, getImageUrl } from '@/src/lib/api';

const CTA_BUTTON_CLASS =
  'group relative overflow-hidden px-8 py-3 font-semibold text-white bg-black border border-black transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed';
const CTA_BUTTON_TEXT_CLASS =
  'relative z-10 font-extralight transition-colors duration-300 group-hover:text-black';
const CTA_BUTTON_OVERLAY_CLASS =
  'absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100';

export default function OrderReceiptPage() {
  const router = useRouter();
  const params = useParams();
  const { currentOrder } = useOrderStore();
  const { showToast } = useToast();
  const [isClient, setIsClient] = useState(false);

  // Handle order ID from params safely
  const rawId = params?.id;
  const orderId = rawId ? decodeURIComponent(Array.isArray(rawId) ? rawId[0] : rawId) : 'UNKNOWN';

  const [fetchedOrder, setFetchedOrder] = useState<any>(null);
  const [transactionId, setTransactionId] = useState('');
  const [isProofSubmitted, setIsProofSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Poll for valid data
  useEffect(() => {
    setIsClient(true);

    const fetchOrder = async () => {
      if (!orderId || orderId === 'UNKNOWN') return;
      try {
        const data = await api.getOrder(orderId);
        if (data) {
          setFetchedOrder(data);
          // Update store if needed, or just local state
        }
      } catch (e) {
        console.error("Failed to fetch order", e);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 4000); // 4s polling
    return () => clearInterval(interval);
  }, [orderId]);

  // Transform backend data to display format
  const transformedOrder = fetchedOrder ? {
    customerName: typeof fetchedOrder.shippingAddress === 'string' ? JSON.parse(fetchedOrder.shippingAddress).name : fetchedOrder.shippingAddress?.name || "Customer",
    orderNumber: fetchedOrder.orderNumber || fetchedOrder.id,
    estimatedDelivery: "3-5 Business Days", // Static for now, or calc from date
    items: fetchedOrder.OrderItems?.map((item: any) => ({
      product_id: item.productId,
      name: item.Product?.name || "Product",
      price: item.price,
      quantity: item.quantity,
      image: getImageUrl(item.Product?.images?.[0] || item.Product?.image),
      description: item.Product?.description,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor
    })) || [],
    subtotal: Number(fetchedOrder.subtotal || 0),
    shipping: Number(fetchedOrder.deliveryCharges || fetchedOrder.delivery_charges || fetchedOrder.shippingCharges || 0),
    discount: Number(fetchedOrder.couponDiscount || fetchedOrder.coupon_discount || 0),
    couponCode: fetchedOrder.couponCode || fetchedOrder.coupon_code,
    tax: Number(fetchedOrder.taxAmount || fetchedOrder.tax_amount || 0),
    total: Number(fetchedOrder.total || fetchedOrder.total_amount || 0),
    shippingAddress: typeof fetchedOrder.shippingAddress === 'string' ? JSON.parse(fetchedOrder.shippingAddress) : fetchedOrder.shippingAddress,
    paymentMethod: fetchedOrder.paymentMethod || fetchedOrder.payment_method || fetchedOrder.paymentInfo?.method || "Online",
    email: typeof fetchedOrder.shippingAddress === 'string' ? JSON.parse(fetchedOrder.shippingAddress).email : fetchedOrder.shippingAddress?.email || "",
    phone: typeof fetchedOrder.shippingAddress === 'string' ? JSON.parse(fetchedOrder.shippingAddress).phone : fetchedOrder.shippingAddress?.phone || "",
    orderDate: new Date(fetchedOrder.createdAt).toLocaleDateString(),
    status: fetchedOrder.status, // Include status for UI
  } : null;

  const displayOrder = transformedOrder || currentOrder;

  // Loading state if no order data is available yet
  if (!displayOrder && !isClient) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Clock className="animate-spin text-dark-200 mb-4" size={48} />
        <p className="text-dark-400 font-light uppercase tracking-widest text-xs">Authenticating Order...</p>
      </div>
    );
  }

  // Final check for missing data
  if (!displayOrder) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <Package className="text-dark-100 mb-6" size={64} />
        <h2 className="text-2xl font-light mb-2 uppercase tracking-tight">Order Not Found</h2>
        <p className="text-dark-500 mb-8 max-w-md">We couldn't locate your order details. Please verify the link or contact support if the problem persists.</p>
        <Link href="/products" className="px-8 py-3 bg-black text-white font-semibold uppercase tracking-widest text-xs">Return to Store</Link>
      </div>
    );
  }

  const orderData = displayOrder as any;
  const formatPrice = (price: number) => `Rs ${price.toLocaleString('en-PK')}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) return;

    // Use toast instead of loading state for now
    showToast('Generating PDF...', 'success');

    try {
      // html-to-image avoids "lab" color separation issues
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: '#ffffff', // Ensure white background
        pixelRatio: 4, // Higher resolution for clear text
        quality: 1.0,
        style: {
          color: '#000000',
        }
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${orderData.orderNumber}.pdf`);
      showToast('Invoice downloaded successfully!', 'success');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      showToast('Failed to generate PDF. Please try "Print" -> "Save as PDF".', 'error');
    }
  };

  // Prevent hydration mismatch by rendering null until client load if strictly needed, 
  // but here we handled the date so we should be okay to render.
  if (!isClient) return null;

  return (

    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { margin: 0; size: portrait; }
          body { background-color: white; }
          .print-hidden { display: none !important; }
          /* Hide the main page UI completely */
          .min-h-screen { display: none !important; }
          /* Show only the invoice */
          #invoice-wrapper {
            position: static !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            height: auto !important;
            display: block !important;
            visibility: visible !important;
          }
          #printable-invoice {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 2rem !important;
            box-sizing: border-box !important;
            font-size: 0.88rem !important;
          }
          #printable-invoice svg {
            display: block !important;
            visibility: visible !important;
          }
        }

        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(0.99); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
        .animate-in {
          animation-fill-mode: forwards;
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .zoom-in {
          animation: zoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />

      <div className="min-h-screen bg-dark-50 print-hidden">
        {/* Success Header */}
        <div className="bg-white border-b border-dark-200">
          <div className="container-custom py-12 md:py-16">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center mb-10">
                <img src="/logo.png" alt="WEARINO" className="h-32 w-auto object-contain" />
              </div>
              <h1 className="text-4xl md:text-5xl font-light mb-4 uppercase tracking-wide">
                {currentOrder ? "Order Confirmed!" : "Order Status"}
              </h1>
              <p className="text-xl text-dark-600 mb-2">
                {currentOrder ? "Thank you," : "Hello,"} <span className="font-medium">{orderData.customerName.split(' ')[0]}</span>! {currentOrder && "🎉"}
              </p>
              <div className="bg-black text-white px-6 py-2 inline-block rounded-full text-sm font-bold tracking-widest mb-6">
                ORDER {orderData.orderNumber.toString().startsWith('#') ? orderData.orderNumber : `#${orderData.orderNumber}`}
              </div>
              <p className="text-dark-600 mb-8">
                Your order details and receipt are provided below.
              </p>

              {/* Quick Info Cards */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-3 bg-dark-50 px-6 py-3 rounded border border-dark-200">
                  <Mail size={18} className="text-black" />
                  <span className="text-sm font-medium">Confirmation sent to email</span>
                </div>
                <div className="flex items-center gap-3 bg-dark-50 px-6 py-3 rounded border border-dark-200">
                  <Truck size={18} className="text-black" />
                  <span className="text-sm font-medium">Delivery by {orderData.estimatedDelivery.split(',')[0]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div id="invoice-content" className="container-custom py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-lg border border-dark-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-dark-200 bg-dark-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-light uppercase tracking-wide flex items-center gap-3">
                      <Package size={20} />
                      Order Items
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-white rounded transition-colors"
                        title="Download Invoice PDF"
                      >
                        <Download size={18} className="text-dark-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-dark-200">
                  {orderData.items.map((item: any) => {
                    const itemPrice = item.discount
                      ? item.price * (1 - item.discount / 100)
                      : item.price;

                    return (
                      <div key={`${item.product_id}-${item.selectedSize || 'default'}-${item.selectedColor || 'default'}`} className="p-6 hover:bg-dark-50 transition-colors">
                        <div className="flex gap-4">
                          <div className="relative shrink-0">
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="w-24 h-24 object-cover rounded border border-dark-200"
                            />
                            <div className="absolute -top-2 -right-2 bg-black text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-dark-900 mb-2 line-clamp-2">{item.name}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-dark-600 mb-3">
                              {item.selectedSize && <span>Size: <span className="font-medium">{item.selectedSize}</span></span>}
                              {item.selectedColor && <span>Color: <span className="font-medium">{item.selectedColor}</span></span>}
                              <span>Qty: <span className="font-medium">{item.quantity}</span></span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-dark-600">Unit Price</span>
                              <span className="font-semibold text-lg">{formatPrice(itemPrice * item.quantity)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {orderData.items.length === 0 && (
                    <div className="p-12 text-center text-dark-400 italic font-light tracking-wide uppercase text-xs">
                      No items found for this order.
                    </div>
                  )}
                </div>
              </div>

              {/* Info Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shipping Address */}
                <div className="bg-white rounded-lg border border-dark-200 p-6">
                  <h3 className="font-light text-lg mb-4 uppercase tracking-wide flex items-center gap-3">
                    <MapPin size={20} />
                    Shipping Address
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-dark-900">{orderData.shippingAddress.name}</p>
                    <p className="text-dark-600">{orderData.shippingAddress.street}</p>
                    <p className="text-dark-600">
                      {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}
                    </p>
                    <p className="text-dark-600">{orderData.shippingAddress.country}</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg border border-dark-200 p-6">
                  <h3 className="font-light text-lg mb-4 uppercase tracking-wide flex items-center gap-3">
                    <CreditCard size={20} />
                    Payment Method
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-dark-900">{orderData.paymentMethod}</p>
                    <p className="text-dark-600">{orderData.email}</p>
                    <p className="text-dark-600">{orderData.phone}</p>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-lg border border-dark-200 p-6">
                <h3 className="font-light text-lg mb-6 uppercase tracking-wide">Order Status: <span className="font-semibold text-black">{orderData.status}</span></h3>
                <div className="space-y-6">
                  {/* Step 1: Confirmed */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['pending', 'paid', 'confirmed', 'processing', 'shipped', 'delivered'].includes(orderData.status || '') ? 'bg-black' : 'bg-dark-200'
                        }`}>
                        <Check size={20} className="text-white" />
                      </div>
                      <div className="w-0.5 h-full bg-dark-200 mt-2"></div>
                    </div>
                    <div className="pb-8 flex-1">
                      <p className="font-medium text-dark-900 mb-1">Order Confirmed</p>
                      <p className="text-sm text-dark-600">{orderData.orderDate}</p>
                    </div>
                  </div>

                  {/* Step 2: Processing */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['processing', 'shipped', 'delivered'].includes(orderData.status || '') ? 'bg-black' : 'bg-dark-200'
                        }`}>
                        <Package className="text-white" size={20} />
                      </div>
                      <div className="w-0.5 h-full bg-dark-200 mt-2"></div>
                    </div>
                    <div className="pb-8 flex-1">
                      <p className={`font-medium mb-1 ${['processing', 'shipped', 'delivered'].includes(orderData.status || '') ? 'text-black' : 'text-dark-400'}`}>Processing</p>
                    </div>
                  </div>

                  {/* Step 3: Delivered */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['delivered'].includes(orderData.status || '') ? 'bg-black' : 'bg-dark-200'
                        }`}>
                        <Truck className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium mb-1 ${['delivered'].includes(orderData.status || '') ? 'text-black' : 'text-dark-400'}`}>Delivered</p>
                      <p className="text-sm text-dark-500">Estimated: {orderData.estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Order Summary Card */}
                <div className="bg-white rounded-lg border border-dark-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-dark-200 bg-dark-50">
                    <h2 className="text-xl font-light uppercase tracking-wide">Order Summary</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(orderData.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-600">Shipping</span>
                      <span className="font-medium text-green-600">
                        {orderData.shipping === 0 ? 'FREE' : formatPrice(orderData.shipping)}
                      </span>
                    </div>
                    {orderData.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-600">
                          Discount {orderData.couponCode ? `(Coupon: ${orderData.couponCode})` : ''}
                        </span>
                        <span className="font-medium text-green-600">-{formatPrice(orderData.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-600">Tax</span>
                      <span className="font-medium">{formatPrice(orderData.tax)}</span>
                    </div>
                    <div className="border-t border-dark-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-semibold">{formatPrice(orderData.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/products"
                    className={CTA_BUTTON_CLASS.replace('w-full', 'w-full block text-center')}
                  >
                    <span className={CTA_BUTTON_TEXT_CLASS}>Continue Shopping</span>
                    <span className={CTA_BUTTON_OVERLAY_CLASS}></span>
                  </Link>
                  <Link
                    href={`/track-order?id=${encodeURIComponent(orderData.orderNumber)}`}
                    className="w-full px-8 py-3 border-2 border-black text-black bg-white hover:bg-black hover:text-white transition-colors font-extralight block text-center"
                  >
                    Track Your Order
                  </Link>
                </div>

                {/* Order Info Card */}
                <div className="bg-dark-50 rounded-lg border border-dark-200 p-6">
                  <h3 className="font-medium mb-4 text-dark-900">Order Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-600">Order Number</span>
                      <span className="font-medium text-dark-900">
                        {orderData.orderNumber.toString().startsWith('#')
                          ? orderData.orderNumber
                          : `#${orderData.orderNumber}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-600">Order Date</span>
                      <span className="font-medium text-dark-900">{orderData.orderDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-600">Estimated Delivery</span>
                      <span className="font-medium text-dark-900">{orderData.estimatedDelivery}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Proof Section (for manual payments) */}
                {['bank_transfer', 'easypaisa', 'jazzcash', 'Bank Transfer', 'Easypaisa', 'JazzCash'].includes(fetchedOrder?.paymentMethod || orderData.paymentMethod) && 
                 ['pending', 'pending_payment'].includes(orderData.status) && (
                  <div className="bg-white rounded-lg border-2 border-amber-200 overflow-hidden animate-pulse-subtle shadow-lg shadow-amber-500/10 transition-all duration-500">
                    <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
                      <h2 className="text-xl font-bold text-amber-900 uppercase tracking-tight flex items-center gap-3">
                        <ShieldCheck size={24} className="text-amber-600" />
                        {isProofSubmitted ? 'Payment Proof Received' : 'Action Required: Payment Verification'}
                      </h2>
                    </div>
                    
                    <div className="p-8 relative min-h-[300px] flex flex-col justify-center">
                      {!isProofSubmitted ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <p className="text-amber-800 text-sm mb-8 leading-relaxed font-medium">
                            To process your order, please enter your <span className="font-bold underline">Transaction ID</span> and either upload a screenshot or send it via WhatsApp.
                          </p>

                          <div className="mb-8 max-w-md">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 mb-3">Transaction ID / Reference Number</label>
                            <input 
                              type="text"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              placeholder="Enter your payment reference ID"
                              className="w-full px-5 py-4 bg-white border-2 border-amber-100 rounded-2xl text-base focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all placeholder:text-amber-200"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Upload Option */}
                            <div className="space-y-4">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Option 1: Upload Screenshot</p>
                              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl transition-all group ${
                                !transactionId || uploading ? 'border-gray-100 cursor-not-allowed opacity-50' : 'border-amber-200 cursor-pointer hover:bg-amber-50'
                              }`}>
                                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                  {uploading ? (
                                    <Clock size={24} className="text-amber-400 animate-spin mb-2" />
                                  ) : (
                                    <Download size={24} className={`${!transactionId ? 'text-gray-200' : 'text-amber-400 group-hover:text-amber-600'} transition-colors mb-2`} />
                                  )}
                                  <p className={`text-xs font-bold uppercase tracking-widest ${!transactionId ? 'text-gray-400' : 'text-amber-800'}`}>
                                    {uploading ? 'Uploading...' : (!transactionId ? 'Enter ID First' : 'Select Screenshot')}
                                  </p>
                                </div>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  disabled={!transactionId || uploading}
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      setUploading(true);
                                      const formData = new FormData();
                                      formData.append('orderId', fetchedOrder.id.toString());
                                      formData.append('screenshot', file);
                                      if (transactionId) formData.append('transactionId', transactionId);
                                      
                                      await api.uploadPaymentProof(formData);
                                      setIsProofSubmitted(true);
                                      showToast('Proof uploaded successfully!', 'success');
                                    } catch (error: any) {
                                      showToast(error.message || 'Upload failed', 'error');
                                    } finally {
                                      setUploading(false);
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {/* WhatsApp Option */}
                            <div className="space-y-4">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Option 2: Submit via WhatsApp</p>
                              <a 
                                href={`https://wa.me/923160513841?text=${encodeURIComponent(
                                  `*WEARINO.PK PAYMENT PROOF*\n\n` +
                                  `*Order:* ${orderData.orderNumber}\n` +
                                  `*Method:* ${orderData.paymentMethod}\n` +
                                  `*Amount:* ${formatPrice(orderData.total)}\n` +
                                  `*Transaction ID:* ${transactionId || 'WILL ATTACH SCREENSHOT'}\n` +
                                  `*Customer:* ${orderData.customerName}\n\n` +
                                  `I have completed the payment. Attached is my screenshot for verification.`
                                )}`}
                                target="_blank"
                                onClick={() => setIsProofSubmitted(true)}
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-emerald-500 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-all group shadow-sm"
                              >
                                <MessageSquare size={32} className="text-emerald-600 mb-3" />
                                <p className="mb-2 text-xs text-emerald-800 font-bold uppercase tracking-widest">Send via WhatsApp</p>
                                <p className="text-[10px] text-emerald-600 font-medium italic">Click to send details + screenshot</p>
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in duration-700">
                          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 animate-bounce-subtle">
                            <Check size={48} className="text-white" strokeWidth={3} />
                          </div>
                          <h3 className="text-2xl font-bold text-dark-900 mb-2 uppercase tracking-tight">Submission Received</h3>
                          <p className="text-dark-500 text-sm mb-8 text-center max-w-xs">
                            We have received your payment proof. Our team will verify it within 1-2 hours during business hours.
                          </p>
                          <button 
                            onClick={() => setIsProofSubmitted(false)}
                            className="px-6 py-2 border-2 border-dark-900 text-dark-900 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-full"
                          >
                            Re-upload Screenshot
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Help Section */}
                <div className="bg-white rounded-lg border border-dark-200 p-6">
                  <h3 className="font-medium mb-4 text-dark-900">Need Help?</h3>
                  <div className="space-y-3 text-sm text-dark-600">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>support@example.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>Available 24/7</span>
                    </div>
                    <p className="text-xs text-dark-500 mt-4 pt-4 border-t border-dark-200">
                      Our customer service team is here to help with any questions about your order.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Invoice Template for PDF Generation / Print */}
      <div id="invoice-wrapper" className="absolute -left-[9999px] top-0">
        <div id="printable-invoice" className="w-[800px] p-12 text-black font-sans relative" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          {/* Official Stamp Watermark */}
          <div className="absolute bottom-32 right-12 w-44 h-44 pointer-events-none select-none" style={{ opacity: 0.16, transform: 'rotate(-22deg)', zIndex: 10 }}>
            <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
              <circle cx="90" cy="90" r="86" fill="none" stroke="#1a3a5c" strokeWidth="5"/>
              <circle cx="90" cy="90" r="79" fill="none" stroke="#1a3a5c" strokeWidth="1.5"/>
              <defs>
                <path id="topArcR" d="M 20,90 A 70,70 0 0,1 160,90" />
                <path id="bottomArcR" d="M 28,90 A 62,62 0 0,0 152,90" />
              </defs>
              <text fill="#1a3a5c" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="3">
                <textPath href="#topArcR" startOffset="10%">WEARINO.PK ★ OFFICIAL</textPath>
              </text>
              <text fill="#1a3a5c" fontSize="11" fontFamily="Arial, sans-serif" letterSpacing="2">
                <textPath href="#bottomArcR" startOffset="12%">VERIFIED INVOICE • PAKISTAN</textPath>
              </text>
              <text x="90" y="78" textAnchor="middle" fill="#1a3a5c" fontSize="22" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="1">W</text>
              <text x="90" y="96" textAnchor="middle" fill="#1a3a5c" fontSize="11" fontFamily="Arial, sans-serif" letterSpacing="4">.PK STORE</text>
              <line x1="50" y1="103" x2="130" y2="103" stroke="#1a3a5c" strokeWidth="1"/>
              <text x="90" y="117" textAnchor="middle" fill="#1a3a5c" fontSize="9" fontFamily="monospace" letterSpacing="1">AUTHORIZED ONLY</text>
            </svg>
          </div>
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
            <div>
              <img src="/logo.png" alt="WEARINO" className="h-28 w-auto mb-6 object-contain" />
              <p className="text-black text-lg font-medium tracking-wide">Define Your Style, Wear Confidence.</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold uppercase tracking-wider mb-2 text-black">Invoice</h2>
              <p className="font-bold text-xl">#{orderData.orderNumber.toString().replace('#', '')}</p>
              <p className="text-black text-sm font-bold mt-1">{orderData.orderDate}</p>
            </div>
          </div>

          {/* Billing & Shipping */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-1 mb-4 inline-block">Billed To</h3>
              <div className="text-sm space-y-1.5 text-black font-medium leading-relaxed">
                <p className="font-bold text-lg mb-2">{orderData.shippingAddress.name}</p>
                <p>{orderData.shippingAddress.street}</p>
                <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}</p>
                <p>{orderData.shippingAddress.country}</p>
                <p className="mt-3 font-bold">{orderData.email}</p>
                <p className="font-bold">{orderData.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-1 mb-4 inline-block">Payment Details</h3>
              <div className="text-sm space-y-2 text-black font-medium leading-relaxed">
                <p><span className="font-bold">Method:</span> {orderData.paymentMethod}</p>
                <p><span className="font-bold">Status:</span> <span className="capitalize">{orderData.status}</span></p>
                <p><span className="font-bold">Delivery:</span> {orderData.estimatedDelivery}</p>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-3 text-sm font-black uppercase tracking-wider">Item</th>
                <th className="text-center py-3 text-sm font-black uppercase tracking-wider">Size</th>
                <th className="text-center py-3 text-sm font-black uppercase tracking-wider">Qty</th>
                <th className="text-right py-3 text-sm font-black uppercase tracking-wider">Price</th>
                <th className="text-right py-3 text-sm font-black uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {orderData.items.map((item: any, index: number) => {
                const itemPrice = item.discount
                  ? item.price * (1 - item.discount / 100)
                  : item.price;
                return (
                  <tr key={`${item.product_id}-${index}`}>
                    <td className="py-4 pr-4">
                      <p className="font-bold text-sm text-black">{item.name}</p>
                      <p className="text-xs text-black font-medium mt-1">{item.description || item.product_id}</p>
                    </td>
                    <td className="py-4 text-center text-sm font-bold text-black">{item.selectedSize || '-'}</td>
                    <td className="py-4 text-center text-sm font-bold text-black">{item.quantity}</td>
                    <td className="py-4 text-right text-sm font-medium text-black">{formatPrice(itemPrice)}</td>
                    <td className="py-4 text-right text-sm font-black text-black">{formatPrice(itemPrice * item.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Summary */}
          <div className="flex justify-end border-t-2 border-black pt-8">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-base font-bold text-black">
                <span>Subtotal</span>
                <span>{formatPrice(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-black">
                <span>Shipping</span>
                <span>
                  {orderData.shipping === 0 ? 'FREE' : formatPrice(orderData.shipping)}
                </span>
              </div>
              {orderData.discount > 0 && (
                <div className="flex justify-between text-base font-bold text-black">
                  <span>Discount</span>
                  <span>-{formatPrice(orderData.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-black">
                <span>Tax</span>
                <span>{formatPrice(orderData.tax)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-black mt-4">
                <span className="text-2xl font-black text-black uppercase">Total</span>
                <span className="text-3xl font-black text-black">{formatPrice(orderData.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t-2 border-black text-center text-sm font-bold text-black">
            <p className="mb-2 uppercase tracking-wide">Thank you for shopping with WEARINO!</p>
            <p className="text-xs font-medium">For any questions, please contact support@wearino.com</p>
          </div>
        </div>
      </div>
    </>
  );
}

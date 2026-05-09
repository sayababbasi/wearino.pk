'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Mail, Truck, Package, CreditCard, MapPin, Download, Printer, Clock, Check } from 'lucide-react';
import { useOrderStore } from '@/src/lib/store';
import { useToast } from '@/src/components/common/Toast';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { api } from '@/src/lib/api';

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
      image: api.getImageUrl(item.Product?.images?.[0] || item.Product?.image),
      description: item.Product?.description,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor
    })) || [],
    subtotal: fetchedOrder.subtotal || fetchedOrder.total + (fetchedOrder.couponDiscount || 0),
    shipping: 0, // Simplified
    discount: fetchedOrder.couponDiscount || 0,
    couponCode: fetchedOrder.couponCode,
    tax: 0,
    total: fetchedOrder.total,
    shippingAddress: typeof fetchedOrder.shippingAddress === 'string' ? JSON.parse(fetchedOrder.shippingAddress) : fetchedOrder.shippingAddress,
    paymentMethod: fetchedOrder.paymentInfo?.method || "Online",
    email: typeof fetchedOrder.shippingAddress === 'string' ? JSON.parse(fetchedOrder.shippingAddress).email : fetchedOrder.shippingAddress?.email || "",
    phone: typeof fetchedOrder.shippingAddress === 'string' ? JSON.parse(fetchedOrder.shippingAddress).phone : fetchedOrder.shippingAddress?.phone || "",
    orderDate: new Date(fetchedOrder.createdAt).toLocaleDateString(),
    status: fetchedOrder.status, // Include status for UI
  } : null;

  const displayOrder = transformedOrder || currentOrder || {
    customerName: "Valued Customer",
    orderNumber: orderId.replace('#', ''),
    estimatedDelivery: "3-5 Business Days",
    items: [],
    subtotal: 0,
    shipping: 0,
    discount: 0,
    tax: 0,
    total: 0,
    shippingAddress: { name: "N/A", street: "", city: "", state: "", zipCode: "", country: "" },
    paymentMethod: "Online (Verified)",
    email: "",
    phone: "",
    orderDate: isClient ? new Date().toLocaleDateString() : "Processing...",
    status: "pending"
  };

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
      `}} />

      <div className="min-h-screen bg-dark-50 print-hidden">
        {/* Success Header */}
        <div className="bg-white border-b border-dark-200">
          <div className="container-custom py-12 md:py-16">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-full mb-6">
                <CheckCircle2 className="text-white" size={48} strokeWidth={2} />
              </div>
              <h1 className="text-4xl md:text-5xl font-light mb-4 uppercase tracking-wide">
                {currentOrder ? "Order Confirmed!" : "Order Status"}
              </h1>
              <p className="text-xl text-dark-600 mb-2">
                {currentOrder ? "Thank you," : "Hello,"} <span className="font-medium">{orderData.customerName.split(' ')[0]}</span>! {currentOrder && "🎉"}
              </p>
              <p className="text-dark-600 mb-8">
                Order <span className="font-semibold text-black">{orderData.orderNumber}</span> details are below.
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
                      <div key={item.product_id} className="p-6 hover:bg-dark-50 transition-colors">
                        <div className="flex gap-4">
                          <div className="relative shrink-0">
                            <img
                              src={api.getImageUrl(item.image)}
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
                </div>
              </div>

              {/* Shipping & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <button
                    className="w-full px-8 py-3 border-2 border-black text-black bg-white hover:bg-black hover:text-white transition-colors font-extralight"
                  >
                    Track Your Order
                  </button>
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
              <text x="90" y="78" textAnchor="middle" fill="#1a3a5c" fontSize="22" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="1">WEARINO</text>
              <text x="90" y="96" textAnchor="middle" fill="#1a3a5c" fontSize="11" fontFamily="Arial, sans-serif" letterSpacing="4">.PK STORE</text>
              <line x1="50" y1="103" x2="130" y2="103" stroke="#1a3a5c" strokeWidth="1"/>
              <text x="90" y="117" textAnchor="middle" fill="#1a3a5c" fontSize="9" fontFamily="monospace" letterSpacing="1">AUTHORIZED ONLY</text>
            </svg>
          </div>
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">WEARINO</h1>
              <p className="text-black text-base font-medium tracking-wide">Define Your Style, Wear Confidence.</p>
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
                  <tr key={index}>
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

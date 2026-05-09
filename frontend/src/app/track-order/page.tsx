'use client';

import { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, ChevronRight, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/src/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Tracking Status Configuration
const STATUS_STEPS = [
  { id: 'pending', label: 'Order Placed', icon: Clock, description: 'We have received your order' },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2, description: 'Your order has been confirmed' },
  { id: 'processing', label: 'Processing', icon: Package, description: 'We are preparing your package' },
  { id: 'shipped', label: 'Shipped', icon: Truck, description: 'Your package is on the way' },
  { id: 'delivered', label: 'Delivered', icon: MapPin, description: 'Order has been delivered' }
];

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams?.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams?.get('id');
    if (id) {
      setOrderId(id);
      handleTrack(undefined, id);
    }
  }, [searchParams]);

  const handleTrack = async (e?: React.FormEvent, manualId?: string) => {
    if (e) e.preventDefault();
    const targetId = manualId || orderId;
    if (!targetId.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await api.trackOrder(targetId.trim());
      if (response.success) {
        setOrder(response.order);
      } else {
        setError(response.message || 'Order not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time polling for active orders
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (order && !['delivered', 'cancelled'].includes(order.status)) {
      interval = setInterval(async () => {
        try {
          const response = await api.trackOrder(order.orderNumber);
          if (response.success) {
            setOrder(response.order);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 10000); // Poll every 10 seconds
    }
    return () => clearInterval(interval);
  }, [order?.orderNumber, order?.status]);

  // Status mapping to step index
  const getCurrentStepIndex = (status: string) => {
    const statusMap: Record<string, number> = {
      'pending': 0,
      'paid': 0,
      'confirmed': 1,
      'processing': 2,
      'shipped': 3,
      'delivered': 4,
      'cancelled': -1
    };
    return statusMap[status] ?? 0;
  };

  const currentStep = order ? getCurrentStepIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container-custom max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter text-black">
            Track Your Order
          </h1>
          <p className="text-gray-600 text-lg max-w-lg mx-auto">
            Enter your Order ID to see real-time updates on your package's journey.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-xl shadow-black/5 mb-12 transform transition-all hover:scale-[1.01]">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g. #W-001)"
                className="w-full pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-black outline-none text-lg font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Track Now
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-start gap-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle className="text-red-500 shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Tracking Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {order && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Quick Summary Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-8">
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">Order Number</p>
                <h2 className="text-3xl font-black text-black">{order.orderNumber}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${order.status === 'delivered' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="font-bold uppercase text-sm tracking-wide">{order.status}</span>
                </div>
              </div>
              <div className="flex flex-col md:items-end">
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">Estimated Delivery</p>
                <p className="text-xl font-bold text-black">{order.estimatedDelivery}</p>
                <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Visual Tracking Timeline */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-hidden">
              <h3 className="text-xl font-black mb-8 uppercase">Delivery Progress</h3>
              
              <div className="relative">
                {/* Progress Bar Line */}
                <div className="absolute top-6 left-8 right-8 h-1 bg-gray-100 hidden md:block">
                  <div 
                    className="h-full bg-black transition-all duration-1000 ease-out"
                    style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex md:flex-col items-center gap-4 text-center md:text-center group">
                        {/* Icon Node */}
                        <div className={`
                          w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                          ${isCompleted ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}
                          ${isCurrent ? 'ring-4 ring-black/10 scale-110 shadow-lg' : ''}
                        `}>
                          <Icon size={24} strokeWidth={isCurrent ? 2.5 : 2} />
                        </div>

                        {/* Text Label */}
                        <div className="flex-1 md:mt-2">
                          <p className={`font-black uppercase text-sm tracking-tight ${isCompleted ? 'text-black' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-500 hidden md:block mt-1 leading-tight px-2">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Detailed Status History */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black mb-6 uppercase flex items-center gap-2">
                  <Clock size={20} />
                  Tracking History
                </h3>
                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                  {order.statusHistory && order.statusHistory.length > 0 ? (
                    order.statusHistory.slice().reverse().map((entry: any, index: number) => (
                      <div key={index} className="relative pl-8 group">
                        <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm transition-colors ${index === 0 ? 'bg-black' : 'bg-gray-200'}`} />
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                          <p className="font-bold text-black uppercase text-sm mb-1">{entry.status}</p>
                          <p className="text-gray-600 text-sm">{entry.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 italic">No detailed history available yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items Summary */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black mb-6 uppercase flex items-center gap-2">
                  <Package size={20} />
                  Items & Summary
                </h3>
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        <img 
                          src={api.getImageUrl(item.image)} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-black truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} • {item.size || 'Default'} / {item.color || 'Default'}</p>
                        <p className="font-bold text-sm mt-1">Rs {item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-100 pt-6 space-y-3">
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <span>Total Amount</span>
                    <span className="text-black font-black text-2xl">Rs {order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 text-sm">
                    <span>Payment Status</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Call to Action */}
            <div className="bg-black rounded-3xl p-8 text-center text-white overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2 uppercase">Need help with your order?</h3>
                <p className="text-gray-400 mb-6">Our support team is available 24/7 to assist you with any questions.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/contact" className="bg-white text-black px-8 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
                    Contact Us
                  </Link>
                  <button className="border border-white/30 px-8 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-white/10 transition-colors">
                    FAQ Section
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Empty State / Initial View */}
        {!order && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-in fade-in zoom-in duration-500">
            {[
              { icon: Loader2, title: "Real-time Tracking", desc: "Get live updates from our warehouse to your doorstep." },
              { icon: Clock, title: "History Logs", desc: "Detailed timestamps for every stage of your delivery." },
              { icon: Truck, title: "Delivery Estimator", desc: "Know exactly when to expect your premium package." }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-black">
                  <feature.icon size={32} />
                </div>
                <h4 className="font-black uppercase mb-2 tracking-tight">{feature.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

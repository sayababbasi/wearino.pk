'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Eye,
  ChevronDown,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/src/lib/api';

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 pb-20">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500">Loading your orders...</p>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdParam = searchParams.get('id');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [userReviews, setUserReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [ordersData, reviewsData]: [any, any] = await Promise.all([
          api.getOrders(),
          api.getMyReviews()
        ]);
        
        const allOrders = ordersData?.orders || [];
        setOrders(allOrders);
        setUserReviews(reviewsData?.reviews || []);
        
        if (orderIdParam) {
          const found = allOrders.find((o: any) => o.id.toString() === orderIdParam);
          if (found) setSelectedOrder(found);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orderIdParam]);

  const isProductReviewed = (productId: number) => {
    return userReviews.some(r => Number(r.productId) === Number(productId));
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    let style = "bg-gray-100 text-gray-600";
    if (s === 'delivered') style = "bg-green-100 text-green-700";
    if (s === 'pending') style = "bg-orange-100 text-orange-700";
    if (s === 'shipped') style = "bg-blue-100 text-blue-700";
    if (s === 'cancelled') style = "bg-red-100 text-red-700";

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style}`}>
        {status}
      </span>
    );
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || order.id.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'pending' && ['pending', 'processing'].includes(order.status?.toLowerCase())) ||
        order.status?.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });

  if (selectedOrder) {
    return (
      <div className="space-y-6 animate-fadeIn pb-20">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => { setSelectedOrder(null); router.push('/account/orders'); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" /> Back to Orders
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Order {selectedOrder.orderNumber}</h2>
              <p className="text-sm text-gray-500">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            {getStatusBadge(selectedOrder.status)}
          </div>

          <div className="divide-y divide-gray-100">
            {selectedOrder.OrderItems?.map((item: any, idx: number) => (
              <div key={idx} className="p-6 flex items-center gap-6">
                <div className="w-20 h-24 bg-gray-50 rounded border border-gray-100 overflow-hidden flex-shrink-0">
                  <img src={api.getImageUrl(item.Product?.images?.[0])} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{item.Product?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Size: {item.selectedSize} • Color: {item.selectedColor}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">Rs. {item.price?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col items-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>Rs. {selectedOrder.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>Rs. {selectedOrder.shipping?.toLocaleString() || '250'}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>Rs. {selectedOrder.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500">View and track your order history</p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative w-full lg:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-md text-sm outline-none focus:border-black transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-md overflow-hidden">
            {['all', 'delivered', 'pending', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-r border-gray-200 last:border-0 transition-all ${
                  statusFilter === status ? 'bg-black text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 pl-4 pr-10 border border-gray-200 rounded-md text-[10px] font-bold uppercase tracking-wider appearance-none cursor-pointer bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Products</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Total</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Loading...</span>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => { setSelectedOrder(order); router.push(`/account/orders?id=${order.id}`); }}
                        className="text-sm font-bold text-gray-900"
                      >
                        {order.orderNumber}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-3">
                          {order.OrderItems?.slice(0, 2).map((item: any, i: number) => (
                            <div key={i} className="w-8 h-10 rounded bg-gray-100 border border-white overflow-hidden shadow-sm">
                              <img src={api.getImageUrl(item.Product?.images?.[0])} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                        {order.OrderItems?.length > 2 && (
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">+{order.OrderItems.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-gray-900">Rs. {order.total?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <button 
                          onClick={() => { setSelectedOrder(order); router.push(`/account/orders?id=${order.id}`); }}
                          className="text-gray-400 hover:text-black transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <Link 
                          href={`/account/track-order?id=${order.id}`}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Track Order"
                        >
                          <Truck size={18} />
                        </Link>
                        {order.status?.toLowerCase() === 'delivered' && (
                          <Link 
                            href="/account/reviews"
                            className="text-gray-400 hover:text-gold-500 transition-colors"
                            title="Write Review"
                          >
                            <Star size={18} className={isProductReviewed(order.OrderItems?.[0]?.productId) ? 'fill-current text-gold-500' : ''} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingBag size={24} className="text-gray-200" />
                      <p className="text-sm text-gray-500">No orders found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

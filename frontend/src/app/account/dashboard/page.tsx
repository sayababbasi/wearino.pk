'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Heart, 
  ShoppingBag, 
  ArrowRight,
  Truck,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api';
import { useWishlistStore } from '@/src/lib/store';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    reviewsCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const ordersData = await api.getOrders() as any;
        const allOrders = Array.isArray(ordersData) ? ordersData : (ordersData?.orders || []);
        
        const pending = allOrders.filter((o: any) => 
          ['pending', 'processing', 'shipped'].includes(o.status?.toLowerCase())
        ).length;

        const reviewsData = await api.getMyReviews() as any;
        const allReviews = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.reviews || []);
        
        setStats({
          totalOrders: allOrders.length,
          pendingOrders: pending,
          reviewsCount: allReviews.length,
        });
        
        setRecentOrders(allOrders.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: Package, href: '/account/orders', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Shipments', value: stats.pendingOrders, icon: Truck, href: '/account/orders', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'My Wishlist', value: wishlistCount, icon: Heart, href: '/account/wishlist', color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Product Reviews', value: stats.reviewsCount, icon: MessageSquare, href: '/account/reviews', color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="space-y-8 pb-20 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Quick summary of your activity and recent orders.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Link 
            key={idx} 
            href={stat.href}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <stat.icon size={24} />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Syncing...</div>
            ) : recentOrders.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/account/orders?id=${order.id}`)}>
                      <td className="px-6 py-4 text-xs font-bold text-black">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          order.status?.toLowerCase() === 'delivered' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-bold">Rs. {order.total?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-sm text-gray-500">No recent orders found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links / Support */}
        <div className="space-y-6">
          <div className="bg-black text-white rounded-xl p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Track Your Package</h3>
              <p className="text-xs text-gray-400 mb-6">Enter your order ID to see real-time updates.</p>
              <Link 
                href="/account/track-order"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-gray-100 transition-all"
              >
                Track Now <ExternalLink size={14} />
              </Link>
            </div>
            <Truck size={120} className="absolute -right-8 -bottom-8 opacity-10 -rotate-12 transform group-hover:scale-110 transition-transform duration-700" />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Need Assistance?</h3>
            <div className="space-y-3">
              <Link href="/contact" className="block p-4 bg-white border border-gray-100 rounded-lg hover:border-black transition-all">
                <p className="text-xs font-bold text-gray-900">Customer Support</p>
                <p className="text-[10px] text-gray-500 mt-1">Average response time: 2 hours</p>
              </Link>
              <Link href="/faq" className="block p-4 bg-white border border-gray-100 rounded-lg hover:border-black transition-all">
                <p className="text-xs font-bold text-gray-900">Return Policy</p>
                <p className="text-[10px] text-gray-500 mt-1">30-day hassle-free returns</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

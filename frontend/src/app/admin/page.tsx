'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import StatsCard from '@/src/components/admin/StatsCard';
import RecentOrders from '@/src/components/admin/RecentOrders';
import TopProducts from '@/src/components/admin/TopProducts';
import { SalesLineChart } from '@/src/components/admin/AnalyticsChart';
import { api } from '@/src/lib/api';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('year');

  useEffect(() => {
    // Get user from local storage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch admin stats
        const stats = ((await api.getAdminStats()) || {}) as any;

        // Fetch analytics counts for accurate Revenue and Orders
        try {
          const counts = await api.getAnalyticsCounts() as any;
          setDashboardStats({
            totalRevenue: counts?.totalRevenue || 0,
            totalOrders: counts?.totalOrders || stats.totalOrders || 0,
            totalCustomers: stats.totalUsers || 0,
            totalProducts: stats.totalProducts || 0,
          });
        } catch (err) {
          console.error('Error fetching analytics counts:', err);
          // Fallback if analytics fails
          setDashboardStats({
            totalRevenue: 0,
            totalOrders: 0,
            totalCustomers: stats.totalUsers || 0,
            totalProducts: stats.totalProducts || 0,
          });
        }

        // Fetch chart data
        try {
          const stats = ((await api.getMonthlyStats(timeRange)) || []) as any[];

          let filledData = [];
          if (timeRange === 'year') {
            // Ensure all 12 months are represented
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            filledData = months.map(month => {
              const found = stats.find(s => s.month === month);
              return {
                month,
                sales: found ? parseFloat(found.sales) : 0,
                orders: found ? parseInt(found.orders) : 0,
              };
            });
          } else {
            // For 7days/30days - use returned data directly
            filledData = stats.map(s => ({
              month: s.date,
              sales: parseFloat(s.sales),
              orders: parseInt(s.orders),
            }));
          }

          setSalesData(filledData);
        } catch (err) {
          console.error('Error fetching chart data:', err);
          setSalesData([]);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch dashboard data immediately
    fetchDashboardData();

    // Set up polling for orders (refresh every 30 seconds)
    const fetchOrders = async () => {
      try {
        const ordersResponse = (await api.getOrders()) as any;
        const orders = ordersResponse?.orders || [];
        // Transform to match RecentOrders component format
        const transformedOrders = orders.slice(0, 5).map((order: any) => ({
          id: order.id?.toString(),
          orderNumber: order.orderNumber || `#ORD-${order.id}`,
          customer: order.shippingAddress?.name || order.User?.name || 'Guest',
          product: order.OrderItems?.[0]?.Product?.name || 'Multiple items',
          amount: `Rs ${order.total?.toFixed(2) || '0.00'}`,
          status: order.status || 'pending',
          date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }));
        setRecentOrders(transformedOrders);

        setDashboardStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
        }));
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };

    const fetchTopProducts = async () => {
      try {
        const topProductsResponse = (await api.getTopSellingProducts()) as any;
        if (topProductsResponse && topProductsResponse.products) {
          setTopProducts(topProductsResponse.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            sales: p.totalSold || 0,
            revenue: p.revenue,
            image: api.getImageUrl(p.images?.[0]) || '/placeholder.jpg'
          })));
        }
      } catch (err) {
        console.error("Error fetching top products:", err);
      }
    };

    // Fetch data immediately
    fetchOrders();
    fetchTopProducts();

    // Poll for new orders every 30 seconds
    const intervalId = setInterval(() => {
      fetchOrders();
      fetchTopProducts();
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [timeRange]);

  const canViewFinancials = user?.role === 'admin';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {canViewFinancials && (
          <StatsCard
            label="Total Revenue"
            value={`Rs ${dashboardStats.totalRevenue.toLocaleString()}`}
            change="+18.7%"
            isPositive={true}
            icon={DollarSign}
            color="bg-green-500"
          />
        )}
        <StatsCard
          label="Total Orders"
          value={dashboardStats.totalOrders.toLocaleString()}
          change="+12.3%"
          isPositive={true}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        {canViewFinancials && (
          <StatsCard
            label="Total Customers"
            value={dashboardStats.totalCustomers.toLocaleString()}
            change="+8.1%"
            isPositive={true}
            icon={Users}
            color="bg-purple-500"
          />
        )}
        <StatsCard
          label="Active Products"
          value={dashboardStats.totalProducts}
          change="-2.4%"
          isPositive={false}
          icon={Package}
          color="bg-orange-500"
        />
      </div>

      {/* Sales Chart */}
      {canViewFinancials && (
        <SalesLineChart data={salesData} title="Sales & Orders Overview" height={350} />
      )}

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>
          <RecentOrders orders={recentOrders} />
        </div>

        {/* Top Products */}
        {canViewFinancials && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Top Products</h2>
              <Link
                href="/admin/products"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            <TopProducts products={topProducts} />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products/add"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <Package size={24} className="mx-auto mb-2 text-blue-600" />
            <span className="text-sm font-medium">Add Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <ShoppingCart size={24} className="mx-auto mb-2 text-green-600" />
            <span className="text-sm font-medium">View Orders</span>
          </Link>
          <Link
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <Users size={24} className="mx-auto mb-2 text-purple-600" />
            <span className="text-sm font-medium">Manage Users</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <TrendingUp size={24} className="mx-auto mb-2 text-orange-600" />
            <span className="text-sm font-medium">View Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
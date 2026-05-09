'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Eye, ShoppingCart, Users, DollarSign,
  Calendar, Download, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { RevenueAreaChart, CategoryBarChart, SalesLineChart, GenericLineChart, CategoryPieChart } from '@/src/components/admin/AnalyticsChart';
import { api } from '@/src/lib/api';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('year');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    counts: {
      productsCount: 0,
      inquiriesCount: 0,
      totalViews: 0,
      totalRevenue: 0,
      revenueGrowth: 0,
      inquiriesGrowth: 0,
      usersGrowth: 0
    },
    topViewed: [] as any[],
    monthlyUsers: [] as any[],
    monthlyProducts: [] as any[],
    revenueAnalytics: [] as any[],
    topSelling: [] as any[],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          api.getAnalyticsCounts(),
          api.getTopViewedProducts(),
          api.getMonthlyUserStats(),
          api.getMonthlyProductStats(),
          api.getRevenueAnalytics(dateRange),
          api.getTopSellingProducts()
        ]);

        const counts = results[0].status === 'fulfilled' ? results[0].value : null;
        const topViewed = results[1].status === 'fulfilled' ? results[1].value : [];
        const monthlyUsers = results[2].status === 'fulfilled' ? results[2].value : [];
        const monthlyProducts = results[3].status === 'fulfilled' ? results[3].value : [];
        const revenueData = results[4].status === 'fulfilled' ? results[4].value : [];
        const topSellingData = results[5].status === 'fulfilled' ? results[5].value : { products: [] };

        if (results[4].status === 'rejected') {
          console.error('Revenue Analytics failed:', results[4].reason);
        }

        console.log('Analytics Debug - counts:', counts);
        console.log('Analytics Debug - revenueData:', revenueData);

        setAnalyticsData({
          counts: (counts && (counts as any).productsCount !== undefined) ? (counts as any) : {
            productsCount: 0, inquiriesCount: 0, totalViews: 0, totalRevenue: 0,
            revenueGrowth: 0, inquiriesGrowth: 0, usersGrowth: 0
          },
          topViewed: Array.isArray(topViewed) ? topViewed : [],
          monthlyUsers: Array.isArray(monthlyUsers) ? monthlyUsers : [],
          monthlyProducts: Array.isArray(monthlyProducts) ? monthlyProducts : [],
          revenueAnalytics: Array.isArray(revenueData) ? revenueData : [],
          topSelling: (topSellingData as any).products || [],
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  // Transform data for charts with padding for empty dates
  const revenueChartData = (() => {
    const rawData = analyticsData.revenueAnalytics;
    if (dateRange === 'year') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(month => {
        const found = rawData.find(item => item.date === month);
        return {
          date: month,
          revenue: found ? parseFloat(found.revenue) : 0,
          orders: found ? parseInt(found.orders) : 0,
        };
      });
    } else {
      // For 7days/30days - we trust the returned sequence but ensure they are numeric
      return rawData.map(item => ({
        date: item.date,
        revenue: parseFloat(item.revenue) || 0,
        orders: parseInt(item.orders) || 0,
      }));
    }
  })();

  const topProducts = analyticsData.topViewed.slice(0, 5).map((product: any) => ({
    name: product.name || product.title || 'Unknown',
    revenue: 0,
    units: product.view || 0, // Fixed: use view instead of views
    avgPrice: product.price || 0,
  }));

  // Helper to format ISO month strings (e.g., "2024-12-01T00:00:00.000Z" -> "Dec")
  const formatMonth = (monthStr: string) => {
    try {
      const date = new Date(monthStr);
      return date.toLocaleString('default', { month: 'short' });
    } catch (e) {
      return monthStr;
    }
  };

  // Helper for growth badge
  const GrowthBadge = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span>{isPositive ? '+' : ''}{value}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Overview</h1>
          <p className="text-gray-600">Track your store performance and insights</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <DollarSign size={24} className="text-blue-600" />
                </div>
                <GrowthBadge value={analyticsData.counts.revenueGrowth || 0} />
              </div>
              <h3 className="text-2xl font-bold mb-1">Rs {(analyticsData.counts.totalRevenue || 0).toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>

            {/* Inquiries */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <ShoppingCart size={24} className="text-green-600" />
                </div>
                <GrowthBadge value={analyticsData.counts.inquiriesGrowth || 0} />
              </div>
              <h3 className="text-2xl font-bold mb-1">{analyticsData.counts.inquiriesCount || 0}</h3>
              <p className="text-sm text-gray-600">Total Inquiries</p>
            </div>

            {/* Views */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Eye size={24} className="text-purple-600" />
                </div>
                {/* Views growth not tracked historically yet, show 0 or N/A */}
                <div className="flex items-center gap-1 text-sm font-medium text-gray-400">
                  <span>-</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{analyticsData.counts.totalViews || 0}</h3>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>

            {/* Monthly Users */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Users size={24} className="text-yellow-600" />
                </div>
                <GrowthBadge value={analyticsData.counts.usersGrowth || 0} />
              </div>
              <h3 className="text-2xl font-bold mb-1">{analyticsData.monthlyUsers.reduce((sum, item) => sum + parseInt(item.count || 0), 0)}</h3>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <RevenueAreaChart data={revenueChartData} height={400} />

          {/* Category Performance & Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Category Pie Chart */}
            <CategoryPieChart
              data={(() => {
                const categoryStats: Record<string, number> = {};
                analyticsData.topSelling.forEach((product: any) => {
                  const cat = product.category || 'Uncategorized';
                  categoryStats[cat] = (categoryStats[cat] || 0) + (product.revenue || 0);
                });
                return Object.entries(categoryStats)
                  .map(([name, value]) => ({ name, value }))
                  .sort((a, b) => b.value - a.value);
              })()}
              title="Revenue by Category"
              height={300}
            />

            {/* Monthly Product Growth */}
            <GenericLineChart
              data={(() => {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return months.map(month => {
                  const found = analyticsData.monthlyProducts.find((p: any) => formatMonth(p.month) === month);
                  return {
                    month,
                    count: found ? parseInt(found.count) : 0,
                  };
                });
              })()}
              dataKey="count"
              name="Products Added"
              title="Monthly Product Growth"
              height={300}
            />
          </div>

          {/* Top Products & Category Performance Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Top Selling Products</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analyticsData.topSelling && analyticsData.topSelling.length > 0 ? (
                      analyticsData.topSelling.slice(0, 5).map((product: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name || product.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{(product.totalSold || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                            Rs {(product.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No sales data available yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Growth Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Category Performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales (Units)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(() => {
                      // Aggregate Top Selling by Category
                      const categoryStats: Record<string, { sales: number; revenue: number }> = {};

                      analyticsData.topSelling.forEach((product: any) => {
                        const cat = product.category || 'Uncategorized';
                        if (!categoryStats[cat]) {
                          categoryStats[cat] = { sales: 0, revenue: 0 };
                        }
                        categoryStats[cat].sales += (product.totalSold || 0);
                        categoryStats[cat].revenue += (product.revenue || 0);
                      });

                      const sortedCategories = Object.entries(categoryStats)
                        .map(([name, stats]) => ({ name, ...stats }))
                        .sort((a, b) => b.revenue - a.revenue);

                      if (sortedCategories.length === 0) {
                        return (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                              No data available
                            </td>
                          </tr>
                        );
                      }

                      return sortedCategories.slice(0, 5).map((cat, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{cat.sales.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-green-600">
                            Rs {cat.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
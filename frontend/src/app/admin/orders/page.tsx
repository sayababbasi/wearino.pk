'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar } from 'lucide-react';
import OrdersTable, { Order } from '@/src/components/admin/OrdersTable';
import OrderStatusBadge, { OrderStatus } from '@/src/components/admin/OrderStatusBadge';
import StatsCard from '@/src/components/admin/StatsCard';
import ConfirmationModal from '@/src/components/admin/ConfirmationModal';
import { ShoppingCart, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { api, apiClient } from '@/src/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.getOrders() as any;
        const ordersData = response?.orders || [];

        // Transform API response to match Order interface
        const transformedOrders: Order[] = ordersData.map((order: any) => ({
          id: order.id?.toString() || '',
          orderNumber: order.orderNumber || `ORD-${order.id}`,
          customer: {
            name: order.shippingAddress?.name || order.User?.name || 'Guest',
            email: order.shippingAddress?.email || order.User?.email || '',
            avatar: order.User?.email
              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(order.shippingAddress?.name || order.User?.name || 'Guest')}&background=random`
              : undefined,
          },
          items: order.items?.length || order.OrderItems?.length || 0,
          firstItem: (order.OrderItems && order.OrderItems.length > 0) ? {
            name: order.OrderItems[0].Product?.name || 'Unknown Product',
            image: order.OrderItems[0].Product?.images && order.OrderItems[0].Product.images.length > 0
              ? (order.OrderItems[0].Product.images[0].startsWith('http') ? order.OrderItems[0].Product.images[0] : `http://localhost:5001${order.OrderItems[0].Product.images[0].startsWith('/') ? '' : '/'}${order.OrderItems[0].Product.images[0]}`)
              : order.OrderItems[0].Product?.image
                ? (order.OrderItems[0].Product.image.startsWith('http') ? order.OrderItems[0].Product.image : `http://localhost:5001${order.OrderItems[0].Product.image.startsWith('/') ? '' : '/'}${order.OrderItems[0].Product.image}`)
                : undefined,
            size: order.OrderItems[0].selectedSize,
            color: order.OrderItems[0].selectedColor
          } : undefined,
          total: parseFloat(order.total || 0),
          status: (order.status || 'pending') as OrderStatus,
          paymentStatus: (order.paymentStatus || (order.paymentMethod === 'stripe' ? 'paid' : 'pending')) as 'paid' | 'pending' | 'failed' | 'refunded',
          date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          shippingAddress: order.shippingAddress ?
            `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.country}` :
            undefined,
        }));

        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch orders immediately on mount
    fetchOrders();

    // Poll for new orders every 30 seconds (auto-refresh)
    const intervalId = setInterval(fetchOrders, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Update order status via API
      await apiClient.put(`/order/${orderId}/status`, { status: newStatus });

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, paymentStatus: newStatus === 'refunded' ? 'refunded' : order.paymentStatus }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (selectedOrderId) {
      try {
        // Update order status to cancelled via API
        await apiClient.put(`/order/${selectedOrderId}/status`, { status: 'cancelled' });

        // Update local state
        setOrders(orders.map(order =>
          order.id === selectedOrderId
            ? { ...order, status: 'cancelled' as OrderStatus }
            : order
        ));
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. Please try again.');
      }
    }
    setShowCancelModal(false);
    setSelectedOrderId(null);
  };

  const exportOrders = () => {
    // Export logic - convert to CSV
    const headers = ['Order Number', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date'];
    const csvData = filteredOrders.map(o => [
      o.orderNumber,
      o.customer.name,
      o.items,
      o.total,
      o.status,
      o.paymentStatus,
      o.date
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order Management</h1>
          <p className="text-gray-600">View and manage customer orders</p>
        </div>
        <button
          onClick={exportOrders}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Download size={20} />
          Export Orders
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Orders"
          value={stats.total}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <StatsCard
          label="Pending Orders"
          value={stats.pending}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatsCard
          label="In Progress"
          value={stats.processing}
          icon={ShoppingCart}
          color="bg-purple-500"
        />
        <StatsCard
          label="Total Revenue"
          value={`Rs ${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by order number, customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTable
        orders={filteredOrders}
        onStatusChange={handleStatusChange}
        onCancelOrder={handleCancelOrder}
      />

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-sm px-6 py-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
            Previous
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded text-sm">
            1
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
            Next
          </button>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone and the customer will be notified."
        confirmText="Cancel Order"
        cancelText="Keep Order"
        variant="danger"
      />
    </div>
  );
}
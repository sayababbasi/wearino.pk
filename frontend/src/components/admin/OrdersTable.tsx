'use client';

import Link from 'next/link';
import { Eye, MoreVertical, Truck, XCircle, RefreshCw, Package } from 'lucide-react';
import { useState } from 'react';
import OrderStatusBadge, { OrderStatus } from './OrderStatusBadge';

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  items: number;
  // New field for preview
  firstItem?: {
    image?: string;
    name: string;
    size?: string;
    color?: string;
  };
  total: number;
  status: OrderStatus;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  date: string;
  shippingAddress?: string;
}

interface OrdersTableProps {
  orders: Order[];
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
  onCancelOrder?: (orderId: string) => void;
}

export default function OrdersTable({
  orders,
  onStatusChange,
  onCancelOrder
}: OrdersTableProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    onStatusChange?.(orderId, newStatus);
    setOpenDropdown(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {order.orderNumber.startsWith('#') ? order.orderNumber : `#${order.orderNumber}`}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {order.customer.avatar ? (
                      <img
                        src={order.customer.avatar}
                        alt={order.customer.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                        {order.customer.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{order.customer.name}</p>
                      <p className="text-xs text-gray-500">{order.customer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {order.firstItem?.image ? (
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={order.firstItem.image}
                          alt={order.firstItem.name}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=img';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={order.firstItem?.name}>{order.firstItem?.name || 'No items'}</span>
                      <div className="flex gap-2 text-xs text-gray-500">
                        {order.firstItem?.size && <span>Size: {order.firstItem.size}</span>}
                        {order.firstItem?.color && <span>Color: {order.firstItem.color}</span>}
                      </div>
                      {order.items > 1 && (
                        <span className="text-xs text-blue-600 font-medium">+ {order.items - 1} more items</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold">
                  Rs {order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPaymentBadge(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 relative">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openDropdown === order.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            {order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'shipped')}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Truck size={16} />
                                Mark as Shipped
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'delivered')}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Truck size={16} />
                                Mark as Delivered
                              </button>
                            )}
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <button
                                onClick={() => onCancelOrder?.(order.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <XCircle size={16} />
                                Cancel Order
                              </button>
                            )}
                            {order.paymentStatus === 'paid' && order.status !== 'refunded' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'refunded')}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <RefreshCw size={16} />
                                Issue Refund
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
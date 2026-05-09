interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  product: string;
  amount: string;
  status: 'Completed' | 'Processing' | 'Shipped' | 'Pending' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  date: string;
}

interface RecentOrdersProps {
  orders: Order[];
  title?: string;
}

export default function RecentOrders({ orders, title = 'Recent Orders' }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    const lowStatus = status.toLowerCase();
    switch (lowStatus) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-dark-200">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-dark-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium">
                  {order.orderNumber.startsWith('#') ? order.orderNumber : `#${order.orderNumber}`}
                </td>
                <td className="px-6 py-4 text-sm">{order.customer}</td>
                <td className="px-6 py-4 text-sm font-semibold">{order.amount}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
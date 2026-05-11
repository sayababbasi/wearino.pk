'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCcw, 
  ChevronRight, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Search,
  ArrowRight,
  AlertCircle,
  Truck,
  ArrowLeft,
  X,
  ImageIcon
} from 'lucide-react';
import { api } from '@/src/lib/api';
import Link from 'next/link';

export default function ReturnsPage() {
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [returnReason, setReturnReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, returnsData]: [any, any] = await Promise.all([
        api.getOrders(),
        api.getReturnRequests()
      ]);

      const orders = ordersData?.orders || [];
      const delivered = orders.filter((o: any) => o.status?.toLowerCase() === 'delivered');
      
      setDeliveredOrders(delivered);
      setReturnRequests(returnsData?.requests || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedProduct || !returnReason) return;

    setSubmitting(true);
    try {
      await api.createReturnRequest({
        orderId: selectedOrder.id,
        productId: selectedProduct.id,
        reason: returnReason,
        description,
        images: [] // Future implementation
      });
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (error: any) {
      alert(error.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    let config = { bg: 'bg-gray-100', text: 'text-gray-600', icon: <Clock size={12} /> };
    
    if (s === 'approved') config = { bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle2 size={12} /> };
    if (s === 'rejected') config = { bg: 'bg-red-50', text: 'text-red-600', icon: <XCircle size={12} /> };
    if (s === 'completed') config = { bg: 'bg-blue-50', text: 'text-blue-600', icon: <CheckCircle2 size={12} /> };
    if (s === 'pending') config = { bg: 'bg-orange-50', text: 'text-orange-600', icon: <Clock size={12} /> };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${config.bg} ${config.text} text-[10px] font-bold uppercase tracking-wider`}>
        {config.icon} {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-20 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Returns & Cancellations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your return requests and refund status.</p>
        </div>
        <button 
          onClick={() => {
            if (deliveredOrders.length > 0) {
              const firstOrder = deliveredOrders[0];
              setSelectedOrder(firstOrder);
              setSelectedProduct(firstOrder.OrderItems?.[0]?.Product);
              setIsModalOpen(true);
            }
          }}
          disabled={deliveredOrders.length === 0}
          className="px-6 py-3 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <RefreshCcw size={16} /> New Return Request
        </button>
      </div>

      {/* Return Requests Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Request History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Order Ref</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing...</td>
                </tr>
              ) : returnRequests.length > 0 ? (
                returnRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-black">#RET-{req.id?.toString().padStart(4, '0')}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-600">{req.order?.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-gray-50 rounded overflow-hidden flex-shrink-0 border border-gray-100">
                          <img src={api.getImageUrl(req.product?.images?.[0])} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-gray-900 truncate max-w-[150px]">{req.product?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RefreshCcw className="text-gray-300" size={32} />
                    </div>
                    <p className="text-sm text-gray-500">No return requests found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Request Return</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleReturnSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Order</label>
                  <select 
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black transition-all"
                    onChange={(e) => {
                      const order = deliveredOrders.find((o: any) => o.id === Number(e.target.value));
                      setSelectedOrder(order);
                      setSelectedProduct(order.OrderItems?.[0]?.Product);
                    }}
                    value={selectedOrder?.id}
                  >
                    {deliveredOrders.map((o: any) => (
                      <option key={o.id} value={o.id}>{o.orderNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Product</label>
                  <select 
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black transition-all"
                    onChange={(e) => setSelectedProduct(selectedOrder.OrderItems.find((item: any) => item.Product.id === Number(e.target.value)).Product)}
                    value={selectedProduct?.id}
                  >
                    {selectedOrder?.OrderItems?.map((item: any) => (
                      <option key={item.Product.id} value={item.Product.id}>{item.Product.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Return Reason</label>
                <select 
                  required
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black transition-all"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                >
                  <option value="">Select a reason</option>
                  <option value="Size Issue">Size Doesn't Fit</option>
                  <option value="Damaged Product">Damaged Product</option>
                  <option value="Wrong Item">Wrong Item Received</option>
                  <option value="Quality Issue">Quality Not as Expected</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description (Optional)</label>
                <textarea 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black transition-all min-h-[100px]"
                  placeholder="Tell us more about the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full h-14 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCcw, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreVertical,
  ArrowRight,
  MessageSquare,
  DollarSign,
  X,
  Truck
} from 'lucide-react';
import { api } from '@/src/lib/api';

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const data = await api.getAllReturns();
      setReturns(data?.requests || []);
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      setUpdating(true);
      await api.updateReturnStatus(id, status, adminNote);
      setSelectedReturn(null);
      setAdminNote('');
      fetchReturns();
    } catch (error: any) {
      alert(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleRefundUpdate = async (id: number, refundStatus: string) => {
    try {
      setUpdating(true);
      await api.updateRefundStatus(id, refundStatus);
      fetchReturns();
    } catch (error: any) {
      alert(error.message || 'Failed to update refund');
    } finally {
      setUpdating(false);
    }
  };

  const filteredReturns = returns.filter(req => {
    const matchesSearch = 
      req.id.toString().includes(searchQuery) || 
      req.order?.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    let style = "bg-gray-100 text-gray-600";
    if (s === 'approved') style = "bg-green-100 text-green-700";
    if (s === 'rejected') style = "bg-red-100 text-red-700";
    if (s === 'completed') style = "bg-blue-100 text-blue-700";
    if (s === 'pending') style = "bg-orange-100 text-orange-700";

    return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${style}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Returns Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review and process customer return requests.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, Order # or User..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-900 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-900 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Return ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Order Ref</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Refund</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">Loading requests...</td>
                </tr>
              ) : filteredReturns.length > 0 ? (
                filteredReturns.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold">#RET-{req.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">{req.user?.name}</span>
                        <span className="text-[10px] text-gray-500">{req.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-gray-50 rounded overflow-hidden flex-shrink-0 border border-gray-100">
                          <img src={api.getImageUrl(req.product?.images?.[0])} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{req.product?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-600">{req.order?.orderNumber}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-600">{req.reason}</td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        req.refundStatus === 'processed' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500'
                      }`}>
                        {req.refundStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedReturn(req)}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-sm text-gray-500">No return requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Return Details #RET-{selectedReturn.id}</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-0.5">Order: {selectedReturn.order?.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedReturn(null)} className="text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
              {/* User Info & Product */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Customer Information</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{selectedReturn.user?.name}</p>
                    <p className="text-xs text-gray-600">{selectedReturn.user?.email}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Product to Return</h4>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="w-16 h-20 bg-white rounded overflow-hidden border border-gray-100 flex-shrink-0">
                      <img src={api.getImageUrl(selectedReturn.product?.images?.[0])} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedReturn.product?.name}</p>
                      <p className="text-xs text-gray-500">Rs. {selectedReturn.product?.price?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason & Action */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Return Reason</h4>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-sm font-bold text-orange-900">{selectedReturn.reason}</p>
                    <p className="text-xs text-orange-700 mt-1">{selectedReturn.description || 'No additional details provided.'}</p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Administrative Note</h4>
                  <textarea 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black transition-all min-h-[80px]"
                    placeholder="Add internal notes for this return..."
                    value={adminNote || selectedReturn.adminNote || ''}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusUpdate(selectedReturn.id, 'approved')}
                      disabled={updating}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedReturn.id, 'rejected')}
                      disabled={updating}
                      className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusUpdate(selectedReturn.id, 'completed')}
                      disabled={updating}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Truck size={14} /> Received
                    </button>
                    <button 
                      onClick={() => handleRefundUpdate(selectedReturn.id, 'processed')}
                      disabled={updating}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      <DollarSign size={14} /> Refunded
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

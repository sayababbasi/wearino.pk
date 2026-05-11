'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText,
  ExternalLink,
  Check,
  X,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useToast } from '@/src/components/common/Toast';
import { formatPrice, formatDate } from '@/src/lib/utils';
import Image from 'next/image';

export default function PaymentVerificationPage() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProofs();
  }, []);

  const fetchProofs = async () => {
    try {
      setLoading(true);
      const response = await api.getPaymentProofs();
      setProofs(response.proofs || []);
    } catch (error) {
      showToast('Failed to fetch payment proofs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number, status: 'approved' | 'rejected') => {
    try {
      setIsVerifying(true);
      await api.verifyPaymentProof(id, { status, adminNote });
      showToast(`Payment ${status === 'approved' ? 'approved' : 'rejected'}`, 'success');
      setSelectedProof(null);
      setAdminNote('');
      fetchProofs();
    } catch (error: any) {
      showToast(error.message || 'Verification failed', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredProofs = proofs.filter(p => {
    const matchesSearch = p.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.orderId.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-gray-400" size={32} />
            Payment Verification
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review and verify manual payment screenshots from customers.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Transaction ID or Order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black font-bold text-gray-700"
          >
            <option value="all">All Proofs</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Order #</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="w-8 h-8 border-2 border-gray-100 border-t-black rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredProofs.length > 0 ? (
                filteredProofs.map((proof) => (
                  <tr key={proof.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{formatDate(proof.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">#{proof.orderId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-600">{proof.transactionId || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {proof.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                          <Clock size={12} /> Pending
                        </span>
                      ) : proof.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedProof(proof)}
                        className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center gap-2 ml-auto"
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">
                    No payment proofs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto animate-slideUp">
            {/* Screenshot Side */}
            <div className="md:w-1/2 bg-gray-100 flex items-center justify-center relative p-4 group">
              <div className="relative w-full h-full min-h-[300px]">
                <img
                  src={api.getImageUrl(selectedProof.screenshot)}
                  alt="Payment Screenshot"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <a 
                href={api.getImageUrl(selectedProof.screenshot)} 
                target="_blank" 
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink size={20} />
              </a>
            </div>

            {/* Details Side */}
            <div className="md:w-1/2 p-10 overflow-y-auto">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Review Payment</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Order #{selectedProof.orderId}</p>
                </div>
                <button onClick={() => setSelectedProof(null)} className="text-gray-400 hover:text-black p-2 rounded-lg hover:bg-gray-50">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block italic">Transaction ID</label>
                    <p className="text-sm font-mono font-bold text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedProof.transactionId || 'None'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block italic">User Date</label>
                    <p className="text-sm font-bold text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{formatDate(selectedProof.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block italic">User Note</label>
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 italic">
                    <MessageSquare className="text-amber-600 flex-shrink-0" size={18} />
                    <p className="text-sm text-amber-800 leading-relaxed">{selectedProof.note || 'No note provided.'}</p>
                  </div>
                </div>

                {selectedProof.status === 'pending' ? (
                  <div className="space-y-6 pt-4 border-t border-gray-100">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 italic">Admin Verification Note</label>
                      <textarea
                        rows={3}
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        placeholder="Add a reason if rejecting, or a confirmation note..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleVerify(selectedProof.id, 'rejected')}
                        disabled={isVerifying}
                        className="flex-1 px-6 py-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <X size={18} /> Reject Payment
                      </button>
                      <button
                        onClick={() => handleVerify(selectedProof.id, 'approved')}
                        disabled={isVerifying}
                        className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20"
                      >
                        <Check size={18} /> Approve Payment
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-8 border-t border-gray-100">
                    <div className={`p-6 rounded-2xl flex items-center gap-4 ${
                      selectedProof.status === 'approved' ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
                    }`}>
                      {selectedProof.status === 'approved' ? (
                        <CheckCircle2 className="text-emerald-600" size={32} />
                      ) : (
                        <XCircle className="text-red-600" size={32} />
                      )}
                      <div>
                        <p className={`text-sm font-bold uppercase tracking-widest ${
                          selectedProof.status === 'approved' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          Payment {selectedProof.status.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 font-medium mt-1">{selectedProof.adminNote || 'No admin note provided.'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex gap-3">
                  <AlertTriangle className="text-gray-400 flex-shrink-0" size={20} />
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">
                    Approving this payment will automatically update the order status to <strong>PAID</strong> and notify the customer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

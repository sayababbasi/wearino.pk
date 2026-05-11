'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  CheckCircle2, 
  XCircle,
  Save,
  X,
  Wallet,
  Landmark,
  Coins,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useToast } from '@/src/components/common/Toast';
import { formatPrice } from '@/src/lib/utils';

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    type: 'cod',
    providerName: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
    instructions: '',
    extraFee: 0,
    isActive: true
  });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const response = await api.getPaymentMethods();
      setMethods(response.methods || []);
    } catch (error) {
      showToast('Failed to fetch payment methods', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (method: any) => {
    setEditingMethod(method);
    setFormData({
      type: method.type,
      providerName: method.providerName,
      accountTitle: method.accountTitle || '',
      accountNumber: method.accountNumber || '',
      iban: method.iban || '',
      instructions: method.instructions || '',
      extraFee: method.extraFee || 0,
      isActive: method.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updatePaymentMethod(editingMethod.id, formData);
      showToast('Payment method updated', 'success');
      setIsModalOpen(false);
      fetchMethods();
    } catch (error: any) {
      showToast(error.message || 'Operation failed', 'error');
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'cod': return <Coins size={20} />;
      case 'bank_transfer': return <Landmark size={20} />;
      case 'easypaisa': 
      case 'jazzcash': return <Wallet size={20} />;
      default: return <CreditCard size={20} />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <CreditCard className="text-gray-400" size={32} />
            Payment Methods
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure and manage available checkout payment options.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-64"></div>
          ))
        ) : methods.map((method) => (
          <div key={method.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:border-black transition-all duration-300">
            <div className="p-8 flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  method.isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {getIcon(method.type)}
                </div>
                {method.isActive ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                    <XCircle size={12} /> Disabled
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{method.providerName}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Type: {method.type.replace('_', ' ')}
              </p>
              
              <div className="space-y-3">
                {method.accountTitle && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium italic">Title</span>
                    <span className="font-bold text-gray-700">{method.accountTitle}</span>
                  </div>
                )}
                {method.accountNumber && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium italic">Account</span>
                    <span className="font-bold text-gray-700">{method.accountNumber}</span>
                  </div>
                )}
                {method.extraFee > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium italic">Surcharge</span>
                    <span className="font-bold text-amber-600">{formatPrice(method.extraFee)}</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => handleOpenModal(method)}
              className="w-full p-4 bg-gray-50 border-t border-gray-100 text-xs font-bold text-gray-600 hover:bg-black hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Edit2 size={14} /> Configure Method
            </button>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Configure {formData.providerName}
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Update account details and rules</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm font-bold text-gray-900">{formData.isActive ? 'Enabled for Checkout' : 'Hidden from Customers'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? 'bg-black' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Provider Name</label>
                  <input
                    type="text"
                    required
                    value={formData.providerName}
                    onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Extra Fee / Surcharge</label>
                  <input
                    type="number"
                    value={formData.extraFee}
                    onChange={(e) => setFormData({ ...formData, extraFee: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
              </div>

              {formData.type !== 'cod' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Title</label>
                      <input
                        type="text"
                        value={formData.accountTitle}
                        onChange={(e) => setFormData({ ...formData, accountTitle: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Number</label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm font-bold"
                      />
                    </div>
                  </div>
                  {formData.type === 'bank_transfer' && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">IBAN (Optional)</label>
                      <input
                        type="text"
                        value={formData.iban}
                        onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm font-bold"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Customer Instructions</label>
                <textarea
                  rows={3}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm font-medium leading-relaxed"
                  placeholder="e.g. Please send the payment to the above account and upload the screenshot..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-xs uppercase tracking-widest"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-6 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                >
                  <Save size={18} /> Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

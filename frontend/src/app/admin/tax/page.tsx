'use client';

import { useState, useEffect } from 'react';
import { 
  Percent, 
  Save, 
  Settings2, 
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Info
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useToast } from '@/src/components/common/Toast';

export default function TaxSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [taxPercent, setTaxPercent] = useState('10');
  const [freeThreshold, setFreeThreshold] = useState('2500');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.getSettings();
      const data = response.settings || [];
      setSettings(data);
      
      const tax = data.find((s: any) => s.key === 'global_tax_percent');
      if (tax) setTaxPercent(tax.value);

      const threshold = data.find((s: any) => s.key === 'free_delivery_threshold');
      if (threshold) setFreeThreshold(threshold.value);

    } catch (error) {
      showToast('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: string, group: string) => {
    try {
      setSaving(true);
      await api.updateSetting(key, value, group);
      showToast(`${key.replace(/_/g, ' ')} updated`, 'success');
      fetchSettings();
    } catch (error: any) {
      showToast(error.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Settings2 className="text-gray-400" size={32} />
          Financial & Global Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage global tax rates, shipping rules, and financial configurations.</p>
      </div>

      <div className="space-y-8">
        {/* Tax Configuration */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
                <Percent size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tax System</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Global tax percentage configuration</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="max-w-md">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Global Tax Rate (%)</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    className="w-full pl-4 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-lg font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                </div>
                <button
                  onClick={() => handleSave('global_tax_percent', taxPercent, 'finance')}
                  disabled={saving}
                  className="px-8 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : <><Save size={18} /> Apply</>}
                </button>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                <Info className="text-blue-600 flex-shrink-0" size={20} />
                <p className="text-sm text-blue-800 leading-relaxed">
                  This rate applies to all products unless a <strong>Tax Override</strong> is set on a specific product page. Tax is calculated based on the subtotal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Logistics Rules */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Global Shipping Rules</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Site-wide logistics thresholds</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="max-w-md">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Default Free Shipping Threshold (PKR)</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                  <input
                    type="number"
                    value={freeThreshold}
                    onChange={(e) => setFreeThreshold(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-lg font-bold"
                  />
                </div>
                <button
                  onClick={() => handleSave('free_delivery_threshold', freeThreshold, 'logistics')}
                  disabled={saving}
                  className="px-8 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : <><Save size={18} /> Apply</>}
                </button>
              </div>
              <p className="mt-4 text-xs text-gray-400 italic">
                Orders with subtotal above this amount will qualify for free shipping globally, unless overridden by city-specific rules.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3 text-emerald-800 font-bold mb-2">
              <CheckCircle2 size={20} />
              <h3 className="text-sm uppercase tracking-widest">Best Practice</h3>
            </div>
            <p className="text-sm text-emerald-700 leading-relaxed">
              Always update tax rates before the start of a fiscal quarter to ensure accurate reporting and customer invoicing.
            </p>
          </div>
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-3 text-amber-800 font-bold mb-2">
              <AlertCircle size={20} />
              <h3 className="text-sm uppercase tracking-widest">Warning</h3>
            </div>
            <p className="text-sm text-amber-700 leading-relaxed">
              Changing the free shipping threshold will immediately affect all carts in progress. Consider announcing changes via your newsletter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

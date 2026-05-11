'use client';

import { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MapPin, 
  Globe, 
  Package, 
  CheckCircle2, 
  XCircle,
  Save,
  X
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useToast } from '@/src/components/common/Toast';
import { formatPrice } from '@/src/lib/utils';

export default function DeliveryManagementPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    charge: 0,
    freeDeliveryThreshold: 0,
    estimatedDays: '3-5 Days',
    isActive: true
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await api.getDeliveryZones();
      setZones(response.zones || []);
    } catch (error) {
      showToast('Failed to fetch delivery zones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (zone: any = null) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        charge: zone.charge,
        freeDeliveryThreshold: zone.freeDeliveryThreshold || 0,
        estimatedDays: zone.estimatedDays,
        isActive: zone.isActive
      });
    } else {
      setEditingZone(null);
      setFormData({
        name: '',
        charge: 0,
        freeDeliveryThreshold: 0,
        estimatedDays: '3-5 Days',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await api.updateDeliveryZone(editingZone.id, formData);
        showToast('Delivery zone updated successfully', 'success');
      } else {
        await api.createDeliveryZone(formData);
        showToast('New delivery zone added', 'success');
      }
      setIsModalOpen(false);
      fetchZones();
    } catch (error: any) {
      showToast(error.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this zone?')) return;
    try {
      await api.deleteDeliveryZone(id);
      showToast('Zone deleted', 'success');
      fetchZones();
    } catch (error: any) {
      showToast(error.message || 'Delete failed', 'error');
    }
  };

  const filteredZones = zones.filter(zone => 
    zone.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Truck className="text-gray-400" size={32} />
            Delivery Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure shipping zones, charges, and delivery rules.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-900 transition-all text-sm uppercase tracking-widest shadow-lg shadow-black/5"
        >
          <Plus size={18} /> Add New Zone
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <Globe size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Zones</p>
              <p className="text-2xl font-bold text-gray-900">{zones.filter(z => z.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Free Shipping Zones</p>
              <p className="text-2xl font-bold text-gray-900">{zones.filter(z => z.freeDeliveryThreshold > 0).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Coverage</p>
              <p className="text-2xl font-bold text-gray-900">Domestic</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by city or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Zone / City</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Charge</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Free Above</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">ETA</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 text-sm font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-gray-100 border-t-black rounded-full animate-spin"></div>
                      Fetching logistics data...
                    </div>
                  </td>
                </tr>
              ) : filteredZones.length > 0 ? (
                filteredZones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                          {zone.name.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900">{zone.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(zone.charge)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {zone.freeDeliveryThreshold > 0 ? (
                        <span className="text-sm font-bold text-emerald-600">Above {formatPrice(zone.freeDeliveryThreshold)}</span>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Limit</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{zone.estimatedDays}</span>
                    </td>
                    <td className="px-6 py-4">
                      {zone.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                          <XCircle size={12} /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(zone)}
                          className="p-2 hover:bg-black hover:text-white rounded-lg transition-colors text-gray-400"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(zone.id)}
                          className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-gray-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 text-sm font-medium">
                    No delivery zones found. Click "Add New Zone" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                {editingZone ? 'Edit Delivery Zone' : 'Add New Delivery Zone'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Zone Name (City/Province)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lahore, Punjab"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Delivery Charge</label>
                  <input
                    type="number"
                    required
                    value={formData.charge}
                    onChange={(e) => setFormData({ ...formData, charge: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Free Above Threshold</label>
                  <input
                    type="number"
                    value={formData.freeDeliveryThreshold}
                    onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Estimated Days</label>
                <input
                  type="text"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                  placeholder="e.g. 2-3 Days"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Zone is Active</label>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Save size={16} /> {editingZone ? 'Update Zone' : 'Save Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

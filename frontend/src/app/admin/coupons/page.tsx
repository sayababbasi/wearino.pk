'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, TrendingUp, Tag } from 'lucide-react';
import { api } from '@/src/lib/api';
import { useToast } from '@/src/components/common/Toast';
import ConfirmationModal from '@/src/components/admin/ConfirmationModal';

export default function CouponsManagementPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentEditId, setCurrentEditId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchase: '',
        maxDiscount: '',
        startDate: '',
        expiryDate: '',
        usageLimit: '',
        description: '',
        isActive: true
    });
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; couponId: string | null }>({
        isOpen: false,
        couponId: null
    });
    const { showToast } = useToast();

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/coupons');
            if (response.data) {
                setCoupons(response.data.coupons || []);
            } else {
                setCoupons([]);
                if (response.error) {
                    console.error('Failed to fetch coupons:', response.error);
                }
            }
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            code: formData.code.toUpperCase(),
            discountType: formData.discountType,
            discountValue: parseFloat(formData.discountValue),
            minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
            maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
            startDate: formData.startDate || null,
            expiryDate: formData.expiryDate || null,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
            description: formData.description || null,
            isActive: formData.isActive
        };

        try {
            if (modalMode === 'create') {
                await api.post('/admin/coupons', data);
                showToast('Coupon created successfully', 'success');
            } else if (currentEditId) {
                await api.put(`/admin/coupons/${currentEditId}`, data);
                showToast('Coupon updated successfully', 'success');
            }
            setShowModal(false);
            resetForm();
            fetchCoupons();
        } catch (error: any) {
            console.error('Failed to save coupon:', error);
            showToast(error.response?.data?.message || 'Failed to save coupon', 'error');
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({ isOpen: true, couponId: id });
    };

    const confirmDelete = async () => {
        if (!confirmModal.couponId) return;

        try {
            await api.delete(`/admin/coupons/${confirmModal.couponId}`);
            fetchCoupons();
            showToast('Coupon deleted successfully', 'success');
            setConfirmModal({ isOpen: false, couponId: null });
        } catch (error) {
            console.error('Failed to delete coupon:', error);
            showToast('Failed to delete coupon', 'error');
        }
    };

    const openEditModal = (coupon: any) => {
        setModalMode('edit');
        setCurrentEditId(coupon.id);
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue.toString(),
            minPurchase: coupon.minPurchase?.toString() || '',
            maxDiscount: coupon.maxDiscount?.toString() || '',
            startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
            expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
            usageLimit: coupon.usageLimit?.toString() || '',
            description: coupon.description || '',
            isActive: coupon.isActive
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discountType: 'percentage',
            discountValue: '',
            minPurchase: '',
            maxDiscount: '',
            startDate: '',
            expiryDate: '',
            usageLimit: '',
            description: '',
            isActive: true
        });
        setCurrentEditId(null);
        setModalMode('create');
    };

    const filteredCoupons = coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDiscountDisplay = (coupon: any) => {
        if (coupon.discountType === 'percentage') {
            return `${coupon.discountValue}% OFF`;
        }
        return `$${coupon.discountValue} OFF`;
    };

    const isExpired = (expiryDate: string) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    if (loading) {
        return <div className="p-12 text-center text-gray-500">Loading coupons...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Coupon Management</h1>
                    <p className="text-gray-600">Create and manage discount coupons</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Create Coupon
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search coupons by code or description..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredCoupons.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    {searchQuery ? 'No coupons match your search' : 'No coupons created yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredCoupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-bold text-gray-900">{coupon.code}</div>
                                            {coupon.description && (
                                                <div className="text-sm text-gray-500 mt-1">{coupon.description}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-green-600">{getDiscountDisplay(coupon)}</div>
                                        {coupon.minPurchase && (
                                            <div className="text-xs text-gray-500 mt-1">Min: ${coupon.minPurchase}</div>
                                        )}
                                        {coupon.maxDiscount && coupon.discountType === 'percentage' && (
                                            <div className="text-xs text-gray-500">Max: ${coupon.maxDiscount}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {coupon.startDate && (
                                            <div className="text-gray-600">
                                                From: {new Date(coupon.startDate).toLocaleDateString()}
                                            </div>
                                        )}
                                        {coupon.expiryDate && (
                                            <div className={isExpired(coupon.expiryDate) ? 'text-red-600' : 'text-gray-600'}>
                                                Until: {new Date(coupon.expiryDate).toLocaleDateString()}
                                            </div>
                                        )}
                                        {!coupon.startDate && !coupon.expiryDate && (
                                            <div className="text-gray-400">No expiry</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="text-gray-900">
                                            {coupon.usageCount} / {coupon.usageLimit || '∞'}
                                        </div>
                                        {coupon.usageLimit && coupon.usageCount >= coupon.usageLimit && (
                                            <div className="text-xs text-red-600 mt-1">Limit reached</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isExpired(coupon.expiryDate) ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Expired
                                            </span>
                                        ) : coupon.isActive ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Disabled
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(coupon)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {modalMode === 'create' ? 'Create New Coupon' : 'Edit Coupon'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Coupon Code */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Coupon Code *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent uppercase"
                                    placeholder="e.g., SAVE20"
                                />
                            </div>

                            {/* Discount Type & Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Discount Type *</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">
                                        {formData.discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'} *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                                        placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
                                    />
                                </div>
                            </div>

                            {/* Min Purchase & Max Discount */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Minimum Purchase ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.minPurchase}
                                        onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                                        placeholder="Optional"
                                    />
                                </div>
                                {formData.discountType === 'percentage' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700">Max Discount ($)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.maxDiscount}
                                            onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                                            placeholder="Optional"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Start & Expiry Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Usage Limit */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Usage Limit</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Description (Internal)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                                    rows={3}
                                    placeholder="Internal notes about this coupon"
                                />
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                    Active (coupon can be used)
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    {modalMode === 'create' ? 'Create Coupon' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, couponId: null })}
                onConfirm={confirmDelete}
                title="Delete Coupon"
                message="Are you sure you want to delete this coupon? This action cannot be undone."
                confirmText="Delete Coupon"
                variant="danger"
            />
        </div>
    );
}

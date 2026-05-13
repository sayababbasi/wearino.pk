'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Package, Truck, CreditCard, User,
    MapPin, Calendar, Mail, Phone, ChevronDown, Printer, ShieldCheck
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useToast } from '@/src/components/common/Toast';
import OrderStatusBadge, { OrderStatus } from '@/src/components/admin/OrderStatusBadge';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
    const [isPaymentMenuOpen, setIsPaymentMenuOpen] = useState(false);

    // Helper to safely get the ID
    const orderId = (Array.isArray(params?.id) ? params?.id[0] : params?.id) as string;

    useEffect(() => {
        const fetchOrder = async (isInitial = false) => {
            if (!orderId) return;
            try {
                if (isInitial) setLoading(true);
                const data = await api.getOrder(orderId);
                if (data) {
                    setOrder(data);
                } else {
                    showToast('Order not found', 'error');
                    router.push('/admin/orders');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
                showToast('Failed to load order details', 'error');
            } finally {
                if (isInitial) setLoading(false);
            }
        };

        fetchOrder(true);
    }, [orderId, router, showToast]);

    const handleStatusChange = async (newStatus: OrderStatus, force = false) => {
        if (!orderId) return;

        try {
            setUpdating(true);
            await api.updateOrderStatus(orderId, newStatus, { force });

            // Re-fetch order to get updated stock/status/etc
            const data = await api.getOrder(orderId);
            setOrder(data);

            showToast(`Order status updated to ${newStatus}${force ? ' (Forced)' : ''}`, 'success');
            setIsMenuOpen(false);
        } catch (error: any) {
            console.error('Error updating status:', error);
            const msg = error.message || '';

            if (msg.includes('Insufficient stock')) {
                const confirmed = window.confirm(`${msg}\n\nDo you want to confirm this order anyway and set stock to 0 for this item?`);
                if (confirmed) {
                    handleStatusChange(newStatus, true);
                }
            } else {
                showToast(msg || 'Failed to update status', 'error');
            }
        } finally {
            setUpdating(false);
        }
    };

    const handlePaymentStatusChange = async (newStatus: 'pending' | 'paid' | 'verified' | 'failed' | 'rejected' | 'refunded') => {
        if (!orderId) return;

        try {
            setUpdating(true);
            await api.updateOrderPaymentStatus(orderId, newStatus);
            setOrder({ ...order, paymentStatus: newStatus });
            showToast(`Payment status updated to ${newStatus}`, 'success');
            setIsPaymentMenuOpen(false);
        } catch (error) {
            console.error('Error updating payment status:', error);
            showToast('Failed to update payment status', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelItem = async (itemId: string) => {
        if (!orderId) return;

        const confirmed = window.confirm('Are you sure you want to cancel this item? The order total will be recalculated.');
        if (!confirmed) return;

        try {
            setUpdating(true);
            const response: any = await api.cancelOrderItem(orderId, itemId);
            if (response.success && response.order) {
                setOrder(response.order);
                showToast('Item cancelled successfully', 'success');
            }
        } catch (error: any) {
            console.error('Error cancelling item:', error);
            showToast(error.message || 'Failed to cancel item', 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price: number) => `Rs ${price.toLocaleString()}`;

    // Parse shipping address if it's stored as JSON
    const shippingAddress = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;

    const customerName = shippingAddress?.name || order.User?.name || 'Guest';
    const customerEmail = shippingAddress?.email || order.User?.email || 'N/A';
    const customerPhone = shippingAddress?.phone || 'N/A';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/orders')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        title="Back to Orders"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">Order {order.orderNumber || `#${order.id}`}</h1>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 font-medium">
                            <p className="flex items-center gap-1.5 capitalize">
                                <Calendar size={14} className="text-gray-400" />
                                {formatDate(order.createdAt)}
                            </p>
                            <span className="text-gray-300">|</span>
                            <p className="tracking-wider">ID: <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">{order.id}</span></p>
                            {updating && (
                                <>
                                    <span className="text-gray-300">|</span>
                                    <span className="flex items-center gap-2 text-blue-600 animate-pulse">
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
                                        Updating...
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* New: Prominent Verify Button in Header */}
                    {order.paymentStatus === 'pending' && order.PaymentProofs?.some((p: any) => p.status === 'pending') && (
                        <button
                            onClick={() => {
                                const proofElement = document.getElementById('verification-log');
                                if (proofElement) {
                                    proofElement.scrollIntoView({ behavior: 'smooth' });
                                    proofElement.classList.add('ring-4', 'ring-blue-500/20');
                                    setTimeout(() => proofElement.classList.remove('ring-4', 'ring-blue-500/20'), 2000);
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all animate-bounce-subtle"
                        >
                            <ShieldCheck size={18} />
                            <span className="font-bold text-sm uppercase tracking-wider">Verify Payment</span>
                        </button>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            <span className="font-medium">Update Status</span>
                            <ChevronDown size={16} />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-0"
                                    onClick={() => setIsMenuOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status as OrderStatus)}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize ${order.status === status ? 'font-semibold text-black' : 'text-gray-600'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg shadow-sm hover:bg-gray-800 transition-colors"
                        >
                            <Printer size={18} />
                            <span className="font-medium">Print</span>
                            <ChevronDown size={16} />
                        </button>

                        {isPrintMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-0"
                                    onClick={() => setIsPrintMenuOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                    <button
                                        onClick={() => {
                                            setIsPrintMenuOpen(false);
                                            window.open(`/admin/orders/${orderId}/invoice`, '_blank');
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex flex-col"
                                    >
                                        <span className="font-semibold text-black">Detailed Invoice</span>
                                        <span className="text-xs text-gray-500">For internal records & bookkeeping</span>
                                    </button>
                                    <div className="h-px bg-gray-100 mx-2"></div>
                                    <button
                                        onClick={() => {
                                            setIsPrintMenuOpen(false);
                                            window.open(`/admin/orders/${orderId}/shipping-label`, '_blank');
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex flex-col"
                                    >
                                        <span className="font-semibold text-black">Courier Label</span>
                                        <span className="text-xs text-gray-500">Compact label for the shipment box</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold flex items-center gap-2">
                                <Package size={20} />
                                Order Items
                            </h2>
                            <span className="text-sm text-gray-500">{order.OrderItems?.length || 0} items</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.OrderItems?.map((item: any) => {
                                const isCancelled = item.status === 'cancelled';
                                return (
                                    <div key={item.id} className={`p-6 flex gap-4 ${isCancelled ? 'bg-gray-50/50' : ''}`}>
                                        <div className={`w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden border border-gray-100 relative group/img ${isCancelled ? 'opacity-50 grayscale' : ''}`}>
                                            <img
                                                src={api.getImageUrl(item.Product?.images?.[0] || item.Product?.image)}
                                                alt={item.Product?.name || 'Product'}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                                loading="lazy"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=No+Image';
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex flex-col">
                                                    <h3 className={`font-medium truncate pr-4 ${isCancelled ? 'line-through text-gray-400' : ''}`}>
                                                        {item.Product?.name || 'Unknown Product'}
                                                    </h3>
                                                    {isCancelled && (
                                                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Cancelled Item</span>
                                                    )}
                                                </div>
                                                <span className={`font-semibold ${isCancelled ? 'text-gray-400 line-through' : ''}`}>
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                                                {(item.selectedSize || item.selectedColor) ? (
                                                    <div className="flex gap-2">
                                                        {item.selectedSize && (
                                                            <span className={`bg-gray-100 px-2 py-0.5 rounded border border-gray-200 ${isCancelled ? 'opacity-50' : ''}`}>
                                                                Size: <span className="font-semibold text-black">{item.selectedSize}</span>
                                                            </span>
                                                        )}
                                                        {item.selectedColor && (
                                                            <span className={`bg-gray-100 px-2 py-0.5 rounded border border-gray-200 ${isCancelled ? 'opacity-50' : ''}`}>
                                                                Color: <span className="font-semibold text-black">{item.selectedColor}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No variants selected</span>
                                                )}
                                                <span className={isCancelled ? 'text-gray-400' : ''}>Qty: <span className={`font-medium ${isCancelled ? 'text-gray-400' : 'text-black'}`}>{item.quantity}</span></span>
                                                {item.Product?.sku && (
                                                    <span className="text-gray-400">SKU: {item.Product.sku}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-xs text-gray-500">Unit Price: {formatPrice(item.price)}</p>
                                                    {item.Product && (
                                                        <p className={`text-[11px] font-bold ${item.Product.stock <= 0 ? 'text-red-500' : (item.Product.stock < 5 ? 'text-orange-500' : 'text-green-600')}`}>
                                                            Available Stock: {item.Product.stock}
                                                        </p>
                                                    )}
                                                </div>

                                                {!isCancelled && order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleCancelItem(item.id)}
                                                        className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors uppercase tracking-wider border border-red-200"
                                                        disabled={updating}
                                                    >
                                                        Cancel Item
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 space-y-3">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal || order.OrderItems?.filter((i: any) => i.status !== 'cancelled').reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || order.total)}</span>
                            </div>

                            {order.shippingCharges > 0 && (
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Shipping</span>
                                    <span>{formatPrice(order.shippingCharges)}</span>
                                </div>
                            )}

                            {order.taxAmount > 0 && (
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Tax</span>
                                    <span>{formatPrice(order.taxAmount)}</span>
                                </div>
                            )}

                            {order.couponCode && (
                                <div className="flex justify-between items-center text-sm text-green-600 font-medium bg-green-50/50 px-2 py-1 rounded">
                                    <span className="flex items-center gap-1.5">
                                        <Package size={14} className="rotate-12 text-green-600" />
                                        Coupon ({order.couponCode})
                                    </span>
                                    <span>-{formatPrice(order.couponDiscount || 0)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-xl font-bold pt-3 border-t border-gray-200">
                                <span>Total Amount</span>
                                <span className="text-gray-900">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Activity - Placeholder for future */}
                    {/* <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold mb-4">Order Activity</h2>
            <p className="text-gray-500 text-sm">No activity recorded yet.</p>
          </div> */}
                    
                    {/* Payment Verification Proofs */}
                    {order.PaymentProofs && order.PaymentProofs.length > 0 && (
                        <div id="verification-log" className="bg-white rounded-lg shadow-sm border-2 border-blue-100 p-6 overflow-hidden transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-semibold flex items-center gap-2 text-dark-800">
                                    <ShieldCheck size={20} className="text-blue-600" />
                                    Verification Log
                                </h2>
                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-500 uppercase tracking-widest">
                                    {order.PaymentProofs.length} Submission{order.PaymentProofs.length > 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="divide-y divide-gray-100 -mx-6">
                                {order.PaymentProofs.map((proof: any) => (
                                    <div key={proof.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            {/* Thumbnail */}
                                            {proof.screenshot && (
                                                <div 
                                                    className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 cursor-zoom-in shrink-0 relative group"
                                                    onClick={() => window.open(api.getImageUrl(proof.screenshot!), '_blank')}
                                                >
                                                    <img 
                                                        src={api.getImageUrl(proof.screenshot!)} 
                                                        alt="Proof" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Package size={14} className="text-white" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                                                        TxID: <span className="text-black font-mono">{proof.transactionId || 'N/A'}</span>
                                                    </p>
                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-tighter border ${
                                                        proof.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        proof.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                    }`}>
                                                        {proof.status}
                                                    </span>
                                                </div>
                                                
                                                {proof.note && (
                                                    <p className="text-[10px] text-gray-600 italic line-clamp-1 mb-1">"{proof.note}"</p>
                                                )}
                                                
                                                <p className="text-[9px] text-gray-400">
                                                    Submitted {new Date(proof.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-3 flex items-center gap-2">
                                            {proof.status === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                setUpdating(true);
                                                                await api.verifyPaymentProof(proof.id, { status: 'approved' });
                                                                const data = await api.getOrder(orderId);
                                                                setOrder(data);
                                                                showToast('Payment verified', 'success');
                                                            } catch (err: any) {
                                                                showToast(err.message || 'Error', 'error');
                                                            } finally {
                                                                setUpdating(false);
                                                            }
                                                        }}
                                                        className="flex-1 py-1.5 bg-black text-white text-[9px] font-bold rounded uppercase tracking-widest hover:bg-gray-800 transition-colors"
                                                        disabled={updating}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            const reason = window.prompt('Reason for rejection:');
                                                            if (reason === null) return;
                                                            try {
                                                                setUpdating(true);
                                                                await api.verifyPaymentProof(proof.id, { status: 'rejected', adminNote: reason });
                                                                const data = await api.getOrder(orderId);
                                                                setOrder(data);
                                                                showToast('Rejected', 'info');
                                                            } catch (err: any) {
                                                                showToast(err.message || 'Error', 'error');
                                                            } finally {
                                                                setUpdating(false);
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 bg-white text-red-600 text-[9px] font-bold rounded border border-red-100 uppercase tracking-widest hover:bg-red-50 transition-colors"
                                                        disabled={updating}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={async () => {
                                                        const confirmed = window.confirm('Revert this proof to pending?');
                                                        if (!confirmed) return;
                                                        try {
                                                            setUpdating(true);
                                                            await api.verifyPaymentProof(proof.id, { status: 'pending' });
                                                            // If we were paid, maybe revert to pending
                                                            if (order.paymentStatus === 'paid') {
                                                                await api.updateOrderPaymentStatus(orderId, 'pending');
                                                            }
                                                            const data = await api.getOrder(orderId);
                                                            setOrder(data);
                                                            showToast('Reverted to pending', 'info');
                                                        } catch (err: any) {
                                                            showToast(err.message || 'Error', 'error');
                                                        } finally {
                                                            setUpdating(false);
                                                        }
                                                    }}
                                                    className="text-[10px] text-gray-500 hover:text-blue-700 font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 py-1.5 px-3 bg-gray-50 rounded border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                                                    disabled={updating}
                                                >
                                                    <ArrowLeft size={12} className="shrink-0" /> REVERT TO PENDING
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Customer & Shipping */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold mb-4 flex items-center gap-2">
                            <User size={20} />
                            Customer Details
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-600">
                                    {customerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium">{customerName}</p>
                                    <p className="text-xs text-gray-500">Customer</p>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-gray-100 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail size={16} />
                                    <a href={`mailto:${customerEmail}`} className="hover:text-black hover:underline">
                                        {customerEmail}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone size={16} />
                                    <span>{customerPhone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold mb-4 flex items-center gap-2">
                            <MapPin size={20} />
                            Shipping Address
                        </h2>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-medium text-black">{shippingAddress?.name}</p>
                            <p>{shippingAddress?.street || shippingAddress?.address}</p>
                            <p>{shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zipCode}</p>
                            <p>{shippingAddress?.country}</p>
                        </div>
                    </div>


                    {/* Payment Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold flex items-center gap-2">
                                <CreditCard size={20} />
                                Payment Info
                            </h2>
                            <div className="relative">
                                <button
                                    onClick={() => setIsPaymentMenuOpen(!isPaymentMenuOpen)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    Update
                                    <ChevronDown size={14} />
                                </button>
                                {isPaymentMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-0"
                                            onClick={() => setIsPaymentMenuOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                            {['pending', 'verified', 'paid', 'rejected', 'failed', 'refunded'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handlePaymentStatusChange(status as any)}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize ${(order.paymentStatus || 'pending') === status ? 'font-semibold text-black' : 'text-gray-600'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Method</span>
                                <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase text-[10px] tracking-wider">
                                    {(order.paymentMethod || order.paymentInfo?.method || 'COD').replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className={`font-medium capitalize ${['paid', 'verified'].includes(order.paymentStatus) ? 'text-green-600' :
                                    ['failed', 'rejected'].includes(order.paymentStatus || 'pending') ? 'text-red-600' : 'text-yellow-600'
                                    }`}>
                                    {order.paymentStatus || 'pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

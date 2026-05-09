'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/src/lib/api';
import { Printer, Download, MapPin, Phone, Mail, Globe } from 'lucide-react';
import InvoiceStamp from './InvoiceStamp';

export default function AdminInvoicePage() {
    const params = useParams();
    const orderId = params?.id as string;
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await api.getOrder(orderId);
                setOrder(data);
            } catch (err) {
                console.error("Failed to fetch order", err);
            } finally {
                setLoading(false);
            }
        };
        if (orderId) fetchOrder();
    }, [orderId]);

    if (loading) return <div className="p-10 text-center">Loading Invoice...</div>;
    if (!order) return <div className="p-10 text-center">Order not found.</div>;

    const formatPrice = (price: number) => `Rs ${price.toLocaleString('en-PK')}`;

    const shipping = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : (order.shippingAddress || {});

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0 print:px-0">
            {/* Control Bar - Hidden when printing */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold text-gray-800">Order Invoice</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                    >
                        <Printer size={18} /> Print Invoice
                    </button>
                </div>
            </div>

            {/* Invoice Document */}
            <div id="invoice-bill" className="max-w-4xl mx-auto bg-white shadow-lg p-8 md:p-12 print:shadow-none print:p-6 print:max-w-full print:text-sm relative">
            {/* Official Stamp Watermark */}
                <InvoiceStamp />
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-gray-900 pb-8 mb-8 print:pb-4 print:mb-4">
                    <div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Wearino.pk STORE</h2>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="flex items-center gap-2"><Globe size={14} /> www.wearino.pk</p>
                            <p className="flex items-center gap-2"><Mail size={14} /> support@wearino.pk</p>
                            <p className="flex items-center gap-2"><Phone size={14} /> +92 316 0513841</p>
                        </div>
                    </div>
                    <div className="mt-6 md:mt-0 text-right">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">INVOICE</h3>
                        <p className="text-gray-600 font-medium">Order {order.orderNumber.startsWith('#') ? order.orderNumber : `#${order.orderNumber}`}</p>
                        <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Billing/Shipping Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10 print:gap-6 print:mb-6">
                    <div>
                        <h4 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest">BILL TO:</h4>
                        <div className="space-y-1">
                            <p className="font-bold text-lg">{order.User?.name || shipping.name || 'Guest Customer'}</p>
                            <p className="text-gray-600">{order.User?.email || shipping.email}</p>
                            {shipping.phone && <p className="text-gray-600">Tel: {shipping.phone}</p>}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest">SHIP TO:</h4>
                        <div className="space-y-1 text-gray-700">
                            <p className="font-bold">{shipping.name}</p>
                            <p>{shipping.street || shipping.address}</p>
                            <p>{shipping.city}, {shipping.state} {shipping.zipCode}</p>
                            <p className="font-medium text-black underline underline-offset-4">{shipping.country}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-10 overflow-x-auto print:mb-4">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-4 font-bold text-gray-900 uppercase text-xs tracking-wider">Item Details</th>
                                <th className="py-4 font-bold text-gray-900 uppercase text-xs tracking-wider text-center">Qty</th>
                                <th className="py-4 font-bold text-gray-900 uppercase text-xs tracking-wider text-right">Unit Price</th>
                                <th className="py-4 font-bold text-gray-900 uppercase text-xs tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {order.OrderItems?.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="py-5 print:py-3">
                                        <p className="font-bold text-gray-900">{item.Product?.name}</p>
                                        <div className="text-xs text-gray-500 flex gap-3 mt-1 uppercase">
                                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                                            {item.Product?.sku && <span>SKU: {item.Product.sku}</span>}
                                        </div>
                                    </td>
                                    <td className="py-5 print:py-3 text-center text-gray-900 font-medium">{item.quantity}</td>
                                    <td className="py-5 print:py-3 text-right text-gray-600 font-medium">{formatPrice(item.price)}</td>
                                    <td className="py-5 print:py-3 text-right text-gray-900 font-bold">{formatPrice(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Calculation Table */}
                <div className="flex justify-end border-t-2 border-gray-900 pt-8 mt-4 print:pt-4 print:mt-2">
                    <div className="w-full md:w-64 space-y-4">
                        <div className="flex justify-between items-center text-gray-600">
                            <span className="font-medium uppercase text-xs">Subtotal</span>
                            <span className="font-bold">{formatPrice(order.subtotal || (order.total + (order.couponDiscount || 0)))}</span>
                        </div>
                        {order.couponCode && (
                            <div className="flex justify-between items-center text-green-600">
                                <span className="font-medium uppercase text-xs">Discount ({order.couponCode})</span>
                                <span className="font-bold">-{formatPrice(order.couponDiscount || 0)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-gray-600">
                            <span className="font-medium uppercase text-xs">Shipping</span>
                            <span className="font-bold">FREE</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <span className="text-xl font-black uppercase text-gray-900">Total</span>
                            <span className="text-2xl font-black text-gray-900 underline decoration-4 underline-offset-8 decoration-black">{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-12 pt-8 print:mt-4 print:pt-4 border-t border-gray-100 print:break-inside-avoid">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-4">
                            <h5 className="font-bold text-gray-900 text-sm">PAYMENT INFORMATION</h5>
                            <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded border border-gray-100 print:bg-white">
                                <p><span className="font-medium">Method:</span> {order.paymentInfo?.method?.toUpperCase() || 'ONLINE'}</p>
                                <p><span className="font-medium">Status:</span> {order.paymentStatus?.toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                            <p>Thank you for choosing Wearino.pk. We appreciate your business!</p>
                            <p className="mt-1">Computer-generated invoice. No signature required.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: portrait;
                    }
                    body {
                        background-color: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-size: 0.9rem;
                    }
                    /* Ensure stamp renders in print */
                    #invoice-bill svg {
                        display: block !important;
                        visibility: visible !important;
                    }
                }
            `}</style>
        </div>
    );
}

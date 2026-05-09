'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/src/lib/api';
import { Printer, MapPin, Phone, Package, Truck } from 'lucide-react';

export default function ShippingLabelPage() {
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

    if (loading) return <div className="p-10 text-center">Loading Label...</div>;
    if (!order) return <div className="p-10 text-center">Order not found.</div>;

    const shipping = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : (order.shippingAddress || {});

    const orderNumber = order.orderNumber.startsWith('#') ? order.orderNumber : `#${order.orderNumber}`;

    return (
        <div className="min-h-screen bg-gray-200 py-10 px-4 print:bg-white print:py-0 print:px-0 flex justify-center items-start">
            {/* Control Bar */}
            <div className="fixed top-6 right-6 print:hidden z-20">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full shadow-2xl hover:scale-105 transition-transform"
                >
                    <Printer size={20} /> <span className="font-bold">PRINT LABEL</span>
                </button>
            </div>

            {/* Shipping Label Box */}
            <div className="w-[400px] h-auto bg-white border-4 border-black p-6 print:border-2 print:p-4 print:w-full print:max-w-[100mm]">
                {/* Header / Brand */}
                <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter">Wearino.pk</h2>
                        <p className="text-[10px] font-bold uppercase">Online Store Logistics</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-gray-400">Ship Date</p>
                        <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Tracking / Order # info */}
                <div className="mb-6 flex justify-between items-center bg-black text-white px-3 py-2">
                    <div>
                        <p className="text-[8px] uppercase font-bold text-gray-300">Order Number</p>
                        <h3 className="text-xl font-black">{orderNumber}</h3>
                    </div>
                    <div className="text-right">
                        <Truck size={24} />
                        <p className="text-[8px] font-bold uppercase">Standard Delivery</p>
                    </div>
                </div>

                {/* Ship To Section - BOLD */}
                <div className="mb-8">
                    <div className="flex items-center gap-1 mb-2 text-gray-400">
                        <MapPin size={12} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">SHIP TO:</p>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black uppercase leading-tight">{shipping.name}</h1>
                        <p className="text-lg font-bold leading-tight uppercase">{shipping.street || shipping.address}</p>
                        <p className="text-xl font-black">{shipping.city}, {shipping.state} {shipping.zipCode}</p>
                        <p className="text-lg font-black border-b-2 border-black inline-block">{shipping.country?.toUpperCase()}</p>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="grid grid-cols-2 gap-4 border-t-2 border-black pt-4 mb-6">
                    <div className="flex items-start gap-2">
                        <Phone size={14} className="mt-1" />
                        <div>
                            <p className="text-[8px] font-bold uppercase text-gray-500">Contact Number</p>
                            <p className="text-sm font-black">{shipping.phone || 'NO PHONE'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-bold uppercase text-gray-500">Weight Est.</p>
                        <p className="text-sm font-black">--- KG</p>
                    </div>
                </div>

                {/* Item Verification - Helper for Packer */}
                <div className="bg-gray-50 p-3 border border-dashed border-gray-400 print:bg-white mb-6">
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-2 flex items-center gap-1">
                        <Package size={10} /> Contents Checklist
                    </p>
                    <ul className="text-[11px] font-medium space-y-1">
                        {order.OrderItems?.map((item: any, idx: number) => (
                            <li key={idx} className="flex justify-between items-center border-b border-gray-200 pb-1">
                                <span className="line-clamp-1 flex-1 pr-2">{item.Product?.name} {item.selectedSize ? `[${item.selectedSize}]` : ''}</span>
                                <span className="font-black bg-gray-200 px-1 rounded">x{item.quantity}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Barcode Placeholder */}
                <div className="border-2 border-black p-2 h-20 flex flex-col items-center justify-center bg-gray-50 print:bg-white overflow-hidden">
                    <div className="text-[8px] font-mono mb-1">{order.orderNumber}</div>
                    <div className="w-full flex justify-center gap-0.5 overflow-hidden h-full">
                        {[...Array(40)].map((_, i) => (
                            <div key={i} className="bg-black" style={{ width: Math.random() > 0.5 ? '2px' : '1px', opacity: Math.random() > 0.2 ? 1 : 0.5 }}></div>
                        ))}
                    </div>
                    <div className="text-[10px] font-bold mt-1 uppercase tracking-[0.5em]">{order.id?.toString().padStart(6, '0')}</div>
                </div>

                <p className="text-[8px] mt-4 text-center font-bold text-gray-400 uppercase italic">Handle with care • High quality apparel</p>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: 105mm 148mm; /* A6-ish */
                    }
                    body {
                        background-color: white !important;
                    }
                }
            `}</style>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Trash2, CheckCircle, EyeOff, Search } from 'lucide-react';
import { api } from '@/src/lib/api';
import { useToast } from '@/src/components/common/Toast';
import ConfirmationModal from '@/src/components/admin/ConfirmationModal';

interface Review {
    id: number;
    rating: number;
    reviewText: string;
    isApproved: boolean;
    isVerifiedPurchase: boolean;
    createdAt: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    product: {
        id: number;
        name: string;
        images: string[];
    };
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; reviewId: string | null }>({
        isOpen: false,
        reviewId: null
    });
    const { showToast } = useToast();
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/reviews?status=${filterStatus === 'all' ? '' : filterStatus}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [filterStatus]);

    const handleToggleStatus = async (id: number) => {
        try {
            const updatedReview = await api.toggleReviewStatus(id.toString());
            setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: updatedReview.isApproved } : r));
            showToast(updatedReview.isApproved ? 'Review approved' : 'Review hidden', 'success');
        } catch (error) {
            console.error('Error updating review status:', error);
            showToast('Failed to update status', 'error');
        }
    };

    const handleDelete = (id: number) => {
        setConfirmModal({ isOpen: true, reviewId: id.toString() });
    };

    const confirmDelete = async () => {
        if (!confirmModal.reviewId) return;

        try {
            await api.deleteReview(confirmModal.reviewId);
            setReviews(reviews.filter(r => r.id !== parseInt(confirmModal.reviewId!)));
            showToast('Review deleted successfully', 'success');
            setConfirmModal({ isOpen: false, reviewId: null }); // Close modal after successful deletion
        } catch (error) {
            console.error('Error deleting review:', error);
            showToast('Failed to delete review', 'error');
        }
    };

    const filteredReviews = reviews.filter(review =>
        review.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.reviewText?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Reviews Management</h1>
                <div className="flex items-center gap-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="border rounded-md px-3 py-2 text-sm bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Hidden/Pending</option>
                    </select>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search reviews..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border rounded-md text-sm w-64 focus:outline-none focus:border-black transition-colors"
                        />
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, reviewId: null })}
                onConfirm={confirmDelete}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
                confirmText="Delete Review"
                variant="danger"
            />

            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500">Product</th>
                                <th className="px-6 py-4 font-medium text-gray-500">User</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Rating</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Comment</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                                <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Loading reviews...
                                    </td>
                                </tr>
                            ) : filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No reviews found.
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {review.product?.images?.[0] ? (
                                                        <Image
                                                            src={review.product.images[0]}
                                                            alt={review.product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                                    )}
                                                </div>
                                                <span className="font-medium truncate max-w-[150px]" title={review.product?.name}>
                                                    {review.product?.name || 'Unknown Product'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{review.user?.name || 'Unknown User'}</span>
                                                <span className="text-xs text-gray-400">{review.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        fill={i < review.rating ? "currentColor" : "none"}
                                                        className={i < review.rating ? "" : "text-gray-300"}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="line-clamp-2 max-w-xs text-gray-600" title={review.reviewText}>
                                                {review.reviewText || <span className="italic text-gray-400">No comment</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${review.isApproved
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {review.isApproved ? (
                                                    <><CheckCircle size={12} /> Approved</>
                                                ) : (
                                                    <><EyeOff size={12} /> Hidden</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(review.id)}
                                                    className={`p-1.5 rounded-md transition-colors ${review.isApproved
                                                        ? 'text-orange-600 hover:bg-orange-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={review.isApproved ? "Hide Review" : "Approve Review"}
                                                >
                                                    {review.isApproved ? <EyeOff size={18} /> : <CheckCircle size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete Review"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

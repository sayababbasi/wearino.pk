'use client';

import { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  ShoppingBag,
  Clock,
  X,
  AlertCircle,
  Camera,
  ThumbsUp,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/src/lib/api';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted'>('pending');
  const [reviews, setReviews] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [myReviewsData, productsToReview]: [any, any] = await Promise.all([
        api.getMyReviews(),
        api.getPendingReviewProducts()
      ]);
      
      // Correctly extract arrays from response objects
      setReviews(Array.isArray(myReviewsData) ? myReviewsData : (myReviewsData?.reviews || []));
      setPendingProducts(Array.isArray(productsToReview) ? productsToReview : (productsToReview?.products || []));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (product: any, review?: any) => {
    setSelectedProduct(product);
    if (review) {
      setEditingReview(review);
      setRating(review.rating);
      setReviewText(review.reviewText || '');
    } else {
      setEditingReview(null);
      setRating(5);
      setReviewText('');
    }
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct && !editingReview) return;

    setIsSubmitting(true);
    try {
      if (editingReview) {
        await api.updateMyReview(editingReview.id, { rating, reviewText });
      } else {
        await api.createReview({
          productId: selectedProduct.id,
          rating,
          reviewText
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.deleteMyReview(id);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">Share your experience with products you've purchased.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-8 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeTab === 'pending' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          To Review ({pendingProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          className={`px-8 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeTab === 'submitted' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          My Reviews ({reviews.length})
        </button>
      </div>

      {activeTab === 'pending' ? (
        <div className="space-y-4">
          {pendingProducts.length > 0 ? (
            pendingProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-24 h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                  <img src={api.getImageUrl(product.images?.[0])} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 size={10} /> Verified Purchase
                    </span>
                  </div>
                  <div className="flex gap-1 mt-4 justify-center md:justify-start">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} className="text-gray-200" fill="currentColor" />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleOpenReviewModal(product)}
                  className="px-8 py-3 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/5"
                >
                  Write Review
                </button>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ShoppingBag className="text-gray-200" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">All Caught Up!</h3>
              <p className="text-sm text-gray-500 mt-1">You've reviewed all your delivered products.</p>
              <Link href="/account/orders" className="mt-6 inline-block px-6 py-3 border border-black text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                View Orders
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm relative group overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                    <img src={api.getImageUrl(review.product?.images?.[0])} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{review.product?.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={14} className={s <= review.rating ? 'text-gold-500' : 'text-gray-200'} fill="currentColor" />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          review.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {review.isApproved ? 'Published' : 'Under Review'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
                      <p className="text-sm text-gray-600 italic">"{review.reviewText}"</p>
                    </div>

                    <div className="flex gap-6 mt-6">
                      <button 
                        onClick={() => handleOpenReviewModal(review.product, review)}
                        className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MessageSquare className="text-gray-200" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Reviews Yet</h3>
              <p className="text-sm text-gray-500 mt-1">Share your feedback on products you've used.</p>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                {editingReview ? 'Edit Review' : 'Write a Review'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="p-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                  <img src={api.getImageUrl(selectedProduct?.images?.[0])} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{selectedProduct?.name}</h4>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                    <CheckCircle2 size={10} /> Verified Purchase
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Overall Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => !editingReview && setRating(s)}
                      onClick={() => setRating(s)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        s <= rating ? 'bg-black text-white' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <Star size={24} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Your Feedback</label>
                <textarea
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you like or dislike? How was the quality?"
                  rows={4}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black transition-all min-h-[120px]"
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-14 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

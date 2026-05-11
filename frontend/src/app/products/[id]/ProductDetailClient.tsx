'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Truck, 
  RotateCcw, 
  Shield, 
  MessageCircle,
  CheckCircle2,
  ThumbsUp,
  ChevronDown,
  Info,
  ArrowRight
} from 'lucide-react';
import ProductCard from '@/src/components/product/ProductCard';
import { useCartStore, useWishlistStore } from '@/src/lib/store';
import { useToast } from '@/src/components/common/Toast';
import CartDrawer from '@/src/components/cart/CartDrawer';
import { api } from '@/src/lib/api';

export default function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { showToast } = useToast();

  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL'];

  useEffect(() => {
    const fetchProductData = async () => {
      if (productId && productId !== 'undefined') {
        try {
          setLoading(true);
          const [productData, reviewsData] = await Promise.all([
            api.getProduct(productId),
            api.getProductReviews(productId)
          ]);

          if (productData) {
            setProduct(productData);
            setReviews(reviewsData.reviews || []);
            setReviewStats(reviewsData.stats || null);

            if (productData.category_id) {
              const allProducts = await api.getProducts({ category: productData.category_id });
              const related = allProducts
                .filter((p: any) => p.product_id !== productId)
                .slice(0, 4);
              setRelatedProducts(related);
            }
          } else {
            router.push('/products');
          }
        } catch (error) {
          console.error('Error fetching product data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProductData();
  }, [productId, router]);

  if (loading) {
    return (
      <div className="container-custom py-20 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading Details...</p>
      </div>
    );
  }

  if (!product) return null;

  const inWishlist = isInWishlist(product.product_id);
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleAddToCart = () => {
    if (product.stock !== undefined && product.stock <= 0) {
      showToast('Sorry, this product is out of stock', 'error');
      return;
    }

    const sizes = product.sizes || defaultSizes;
    const hasSizes = sizes.length > 0;
    const hasColors = product.colors && product.colors.length > 0;

    if (hasSizes && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    if (hasColors && !selectedColor) {
      showToast('Please select a color', 'error');
      return;
    }

    const finalSize = selectedSize || (hasSizes ? sizes[0] : 'Default');
    const finalColor = selectedColor || (hasColors ? '' : 'Default');

    addToCart(product, quantity, finalSize, finalColor);
    showToast('Added to cart!', 'success');
    setIsCartOpen(true);
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.product_id);
      showToast('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      showToast('Added to favorites!', 'success');
    }
  };

  const sizes = (product.sizes && product.sizes.length > 0) ? product.sizes : ['One Size'];

  return (
    <div className="container-custom py-10 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-10">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span className="text-gray-300">/</span>
        <Link href="/products" className="hover:text-black transition-colors">Shop</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
        {/* Left: Gallery (Sticky on Desktop) */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Thumbnails (Left side on desktop) */}
            <div className="hidden md:flex md:col-span-2 flex-col gap-3">
              {Array.isArray(product.images) && product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-[3/4] rounded-lg overflow-hidden border transition-all ${
                    selectedImage === index ? 'border-black ring-1 ring-black' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <img src={api.getImageUrl(image)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="md:col-span-10">
              <div className="aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden relative group border border-gray-100">
                <img
                  src={api.getImageUrl(product.images?.[selectedImage] || product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    {product.discount}% OFF
                  </div>
                )}
              </div>
              
              {/* Mobile Thumbnails (Below on mobile) */}
              <div className="flex md:hidden gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
                {Array.isArray(product.images) && product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <img src={api.getImageUrl(image)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-gray-200 px-3 py-1 rounded-full">
              {product.category?.name || 'Collection'}
            </span>
            <div className="h-4 w-px bg-gray-200"></div>
            {product.stock > 0 ? (
              <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 size={12} /> In Stock
              </span>
            ) : (
              <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Out of Stock</span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight leading-[1.1]">{product.name}</h1>

          <div className="flex items-center gap-4 mb-10">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(reviewStats?.averageRating || product.rating || 0) ? '#000000' : 'none'}
                    className={i < Math.floor(reviewStats?.averageRating || product.rating || 0) ? 'text-black' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900 mt-0.5">
                {(reviewStats?.averageRating || product.rating || 0).toFixed(1)}
              </span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <a href="#reviews" className="text-xs font-medium text-gray-500 hover:text-black underline underline-offset-4 decoration-gray-200">
              {reviewStats?.totalReviews || product.reviews || 0} Reviews
            </a>
          </div>

          <div className="flex items-baseline gap-4 mb-10 pb-10 border-b border-gray-100">
            <span className="text-4xl font-bold text-gray-900">
              Rs. {discountedPrice.toLocaleString()}
            </span>
            {product.discount > 0 && (
              <span className="text-xl text-gray-400 line-through font-medium">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Size Selection */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-900">Select Size</label>
              <button className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors">Size Chart</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`h-12 min-w-[3.5rem] px-4 rounded-lg font-bold text-xs transition-all border ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center font-bold text-gray-400 hover:text-black transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center font-bold text-gray-400 hover:text-black transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">In Stock: {product.stock}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 h-14 rounded-lg flex items-center justify-center gap-3 transition-all ${
                  product.stock <= 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-900 active:scale-[0.98]'
                }`}
              >
                <ShoppingCart size={18} />
                <span className="font-bold uppercase tracking-[0.1em] text-xs">
                  {product.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}
                </span>
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`w-14 h-14 rounded-lg border flex items-center justify-center transition-all ${
                  inWishlist ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 hover:border-black text-gray-400'
                }`}
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Service Highlights */}
          <div className="grid grid-cols-1 gap-4 pt-10 border-t border-gray-100">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 transition-colors group-hover:bg-black group-hover:text-white">
                <Truck size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">Free Shipping</p>
                <p className="text-[10px] text-gray-500 mt-0.5">On all orders above Rs. 2,000</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 transition-colors group-hover:bg-black group-hover:text-white">
                <RotateCcw size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">7 Days Easy Return</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Hassle-free return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Reviews Tabs */}
      <div className="space-y-24 mb-32">
        {/* Editorial Description */}
        <section className="max-w-4xl">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Product Details</h2>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              <p className="text-gray-600 leading-relaxed text-lg mb-10 font-medium">
                {product.description}
              </p>
              {Array.isArray(product.features) && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                  {product.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-gray-500 font-medium pb-3 border-b border-gray-50">
                      <ArrowRight size={12} className="text-black" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-900 uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                  <Info size={14} /> Care Instructions
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  Premium quality materials. Hand wash recommended or machine wash cold on delicate cycle. 
                  Do not bleach. Iron on low heat if necessary.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Reviews</h2>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Stats Summary */}
            <div className="lg:col-span-4 space-y-10">
              <div className="bg-white border border-gray-100 rounded-xl p-10 text-center shadow-sm">
                <div className="text-7xl font-bold text-gray-900 mb-2 tracking-tighter">
                  {(reviewStats?.averageRating || product.rating || 0).toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={i < Math.floor(reviewStats?.averageRating || product.rating || 0) ? '#000000' : 'none'}
                      className={i < Math.floor(reviewStats?.averageRating || product.rating || 0) ? 'text-black' : 'text-gray-200'}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Based on {reviewStats?.totalReviews || reviews.length || 0} customer reviews
                </p>
              </div>

              {/* Star Progress Bars */}
              <div className="space-y-4 px-4">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-4">
                    <span className="text-[11px] font-bold text-gray-900 w-3">{star}</span>
                    <Star size={12} className="text-black fill-black" />
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-black transition-all duration-700" 
                        style={{ width: `${reviewStats?.starPercentages?.[star] || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 w-8">{reviewStats?.starPercentages?.[star] || 0}%</span>
                  </div>
                ))}
              </div>

              <Link 
                href="/account/reviews" 
                className="w-full h-14 bg-black text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-all text-xs uppercase tracking-widest"
              >
                Write a Review
              </Link>
            </div>

            {/* Review List */}
            <div className="lg:col-span-8">
              {reviews.length > 0 ? (
                <div className="space-y-12">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-12 border-b border-gray-50 last:border-0">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {review.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-gray-900">{review.user?.name}</p>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider">
                                <CheckCircle2 size={10} /> Verified
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={10} className={i < review.rating ? 'fill-black text-black' : 'text-gray-200'} />
                                ))}
                              </div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pl-16">
                        <p className="text-gray-600 leading-relaxed text-sm font-medium italic">"{review.reviewText}"</p>
                        <div className="flex items-center gap-6 mt-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          <button className="flex items-center gap-2 hover:text-black transition-colors">
                            <ThumbsUp size={12} /> Helpful
                          </button>
                          <button className="hover:text-black transition-colors">Report</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <MessageCircle size={32} className="text-gray-200 mb-3" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No reviews for this product yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">You May Also Like</h2>
              <div className="h-px flex-1 bg-gray-100"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.product_id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Truck, RotateCcw, Shield, MessageCircle } from 'lucide-react';
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

  // Default sizes if product doesn't have them
  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL'];

  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        try {
          setLoading(true);
          const productData = await api.getProduct(productId);

          if (productData) {
            setProduct(productData);

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
          console.error('Error fetching product:', error);
          router.push('/products');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [productId, router]);

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center py-16">
          <p className="text-dark-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-dark-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/products" className="btn-primary inline-block">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

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
    showToast('Added to cart! 🛍️', 'success');
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
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-dark-600 mb-8">
        <Link href="/" className="hover:text-dark-900">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-dark-900">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-dark-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-dark-50 rounded-lg overflow-hidden mb-4">
            <img
              src={api.getImageUrl(product.images?.[selectedImage] || product.image)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {Array.isArray(product.images) && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-dark-900' : 'border-transparent'
                    }`}
                >
                  <img src={api.getImageUrl(image)} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex gap-2 mb-2">
            {Array.isArray(product.tags) && product.tags.map((tag: string) => (
              <span key={tag} className="text-xs bg-dark-900 text-white px-2 py-1 rounded">{tag}</span>
            ))}
            {product.discount && (
              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">-{product.discount}%</span>
            )}
            {product.stock !== undefined && product.stock <= 0 && (
              <span className="text-xs bg-gray-200 text-red-600 font-bold px-2 py-1 rounded border border-red-200 uppercase tracking-wider">Out of Stock</span>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.floor(product.rating) ? '#000' : 'none'}
                  className={i < Math.floor(product.rating) ? 'text-dark-900' : 'text-dark-300'}
                />
              ))}
              <span className="ml-2 text-sm">
                {product.rating.toFixed(1)} ({product.reviews || 0} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            {(product.discount > 0) ? (
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-[#FF4D4D]">
                  Rs {discountedPrice.toLocaleString()}
                </span>
                <span className="text-xl text-dark-300 line-through font-medium">
                  Rs {product.price.toLocaleString()}
                </span>
                <span className="bg-[#FF4D4D] text-white text-[10px] font-black uppercase tracking-[0.1em] px-2 py-1">
                  SAVE {product.discount}%
                </span>
              </div>
            ) : (
              <span className="text-4xl font-black text-dark-900">
                Rs {product.price.toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-dark-600 mb-6">{product.description}</p>

          {/* Size Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="font-semibold">Select Size</label>
              <button className="text-sm underline">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] px-3 py-2 border rounded font-medium transition-all ${selectedSize === size
                    ? 'border-dark-900 bg-dark-900 text-white'
                    : 'border-dark-300 hover:border-dark-900'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <label className="font-semibold mb-3 block">Color</label>
              <div className="flex gap-2">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded ${selectedColor === color
                      ? 'border-dark-900 bg-dark-900 text-white'
                      : 'border-dark-300 hover:border-dark-900'
                      }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="font-semibold mb-3 block">Quantity</label>
            <div className={`flex items-center gap-4 ${product.stock !== undefined && product.stock <= 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-dark-300 rounded hover:bg-dark-50"
                disabled={product.stock !== undefined && product.stock <= 0}
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-dark-300 rounded hover:bg-dark-50"
                disabled={product.stock !== undefined && product.stock <= 0}
              >
                +
              </button>
              {product.stock !== undefined && (
                <span className={`text-sm ${product.stock <= 0 ? 'text-red-600 font-bold' : 'text-dark-600'}`}>
                  {product.stock <= 0 ? 'Out of stock' : `${product.stock} in stock`}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock !== undefined && product.stock <= 0}
              className={`flex-1 flex items-center justify-center gap-2 ${product.stock !== undefined && product.stock <= 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed py-3 font-bold uppercase tracking-widest'
                : 'btn-primary'
                }`}
            >
              <ShoppingCart size={20} />
              {product.stock !== undefined && product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`w-12 h-12 border rounded flex items-center justify-center transition-all ${inWishlist ? 'bg-red-600 text-white border-red-600' : 'border-dark-300 hover:bg-dark-50'
                }`}
            >
              <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Features */}
          <div className="border-t border-dark-200 pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="text-dark-600" size={24} />
              <div>
                <p className="font-medium">Free Shipping</p>
                <p className="text-sm text-dark-600">On orders over Rs 1500</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="text-dark-600" size={24} />
              <div>
                <p className="font-medium">Easy Returns</p>
                <p className="text-sm text-dark-600">30-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="text-dark-600" size={24} />
              <div>
                <p className="font-medium">Secure Payment</p>
                <p className="text-sm text-dark-600">SSL encrypted checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="border-t border-dark-200 py-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Product Details</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-dark-600">{product.description}</p>
            </div>
            {Array.isArray(product.features) && (
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="list-disc list-inside space-y-1 text-dark-600">
                  {product.features.map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h3 className="font-semibold mb-2">Care Instructions</h3>
              <p className="text-dark-600">
                Machine wash cold with similar colors. Tumble dry low. Do not bleach. Iron on low heat if needed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="border-t border-dark-200 py-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="text-center md:border-r md:border-gray-200 md:pr-8">
                <div className="text-5xl font-bold mb-2">{(product.rating || 0).toFixed(1)}</div>
                <div className="flex items-center gap-1 mb-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < Math.floor(product.rating || 0) ? '#000' : 'none'}
                      className={i < Math.floor(product.rating || 0) ? 'text-dark-900' : 'text-dark-300'}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 font-medium">{product.reviews || 0} reviews</p>
              </div>
              <div className="flex-1">
                <p className="text-gray-700 mb-4 font-medium">Based on verified purchases</p>
                <button className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors text-sm font-medium">
                  ✍️ Write a Review
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
                  className="ml-3 bg-white border border-gray-300 text-gray-900 px-6 py-3 rounded hover:bg-gray-50 transition-colors text-sm font-medium inline-flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  Chat about this Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-dark-200 py-12">
          <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.product_id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

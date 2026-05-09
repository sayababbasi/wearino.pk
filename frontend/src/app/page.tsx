'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/src/components/product/ProductCard';
import type { Product } from '@/src/types';
import { useProductsByTag } from '@/src/hooks/useProductsByTag';
import { useBanners } from '@/src/hooks/useBanners';
import { api, apiClient } from '@/src/lib/api';
import TrendingCategories from '@/src/components/home/TrendingCategories';
import BrandsYouLove from '@/src/components/home/BrandsYouLove';
import LovedAndWornBy from '@/src/components/home/LovedAndWornBy';

// Mock data
// Mock data fallback
const defaultHeroSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
    title: 'New Season Arrivals',
    subtitle: 'Shop the latest trends',
    cta: 'Shop Now',
    link: '/products',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
    title: 'Summer Collection',
    subtitle: 'Fresh styles for sunny days',
    cta: 'Explore',
    link: '/categories/women',
  },
];

// Home page component with backend integration

const CTA_BUTTON_CLASS =
  'group relative overflow-hidden px-8 py-3 font-semibold text-white bg-black border border-black transition-colors';
const CTA_BUTTON_TEXT_CLASS =
  'relative z-10 font-bold tracking-wide transition-colors duration-300 group-hover:text-black uppercase text-sm';
const CTA_BUTTON_OVERLAY_CLASS =
  'absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100';

// Helper for Slider Sections
const ProductSlider = ({ title, products, loading, link, subtitle }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Re-enable smooth scroll for button clicks
      scrollRef.current.style.scrollBehavior = 'smooth';
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    // Disable smooth scroll immediately on drag to prevent "rubber-banding"
    scrollRef.current.style.scrollBehavior = 'auto';
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Adjust sensitivity
    if (Math.abs(walk) > 5) setHasDragged(true);
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Prevent click if we were dragging
  const handleLinkClick = (e: React.MouseEvent) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className="py-20 w-full bg-white overflow-hidden">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-dark-900 mb-2">{title}</h2>
            {subtitle && <p className="text-dark-400 text-sm md:text-base font-medium tracking-wide uppercase opacity-70">{subtitle}</p>}
          </div>
          <Link href={link || '/products'} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-dark-900 pb-1.5 hover:text-dark-500 hover:border-dark-300 transition-all">
            Browse All
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[280px] aspect-[3/4] bg-gray-50 animate-pulse border border-dark-50" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="relative group/slider">
            <div
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              onClickCapture={handleLinkClick}
              className={`flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-4 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {products.map((product: any) => (
                <div key={product.product_id || product.id} className="min-w-[260px] md:min-w-[320px] shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Luxury Navigation Arrows */}
            <div className="hidden lg:block">
              <button
                onClick={() => handleScroll('left')}
                className="absolute -left-6 md:-left-12 top-[40%] -translate-y-1/2 bg-white/90 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-4 rounded-full hover:bg-black hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 z-20 border border-dark-50"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="absolute -right-6 md:-right-12 top-[40%] -translate-y-1/2 bg-white/90 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-4 rounded-full hover:bg-black hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 z-20 border border-dark-50"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-[#FAFAFA] border border-dashed border-dark-200 text-dark-400 font-bold uppercase tracking-widest text-sm">
            Collections Coming Soon
          </div>
        )}
      </div>
    </section>
  );
};

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use new hook for banners
  const { banners, loading: bannersLoading, getBannersByPosition } = useBanners();

  // Fetch products by tags from backend
  const { products: saleProducts, loading: saleLoading } = useProductsByTag('sale');
  const { products: newArrivalProducts, loading: newArrivalLoading } = useProductsByTag('new_arrivals');
  const { products: trendingProducts, loading: trendingLoading } = useProductsByTag('trending');
  const { products: allProducts, loading: allLoading } = useProductsByTag();

  // Category-specific products
  const [menProducts, setMenProducts] = useState<any[]>([]);
  const [womenProducts, setWomenProducts] = useState<any[]>([]);
  const [jacketsProducts, setJacketsProducts] = useState<any[]>([]);
  const [kidsProducts, setKidsProducts] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Featured Products state
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Fetch featured products on mount
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const content = await api.getContent('featured_product');
        setFeaturedProducts(content || []);
      } catch (error) {
        console.error('Failed to fetch featured products', error);
      } finally {
        setFeaturedLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch Category Products
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setCategoriesLoading(true);
        const [men, women, jackets, kids] = await Promise.all([
          api.getProducts({ department: 'Men' }),
          api.getProducts({ department: 'Women' }),
          api.getProducts({ department: 'Jackets' }),
          api.getProducts({ department: 'Kids' })
        ]);
        setMenProducts(men);
        setWomenProducts(women);
        setJacketsProducts(jackets);
        setKidsProducts(kids);
      } catch (error) {
        console.error('Failed to fetch category products', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategoryProducts();
  }, []);

  // Prepare banner data
  const heroBanners = getBannersByPosition('hero');
  const heroSlides = heroBanners.length > 0
    ? heroBanners.map(h => ({
      id: h.id,
      image: h.imageUrl,
      title: h.title,
      label: h.meta?.label || 'New Collection 2024',
      subtitle: h.meta?.subtitle || '',
      cta: h.meta?.buttonText || 'Shop Now',
      link: h.linkUrl || '/products'
    }))
    : defaultHeroSlides.map(s => ({ ...s, label: 'New Collection 2024' }));

  const secondaryBanner = getBannersByPosition('secondary')[0];
  const promotionalBanner = getBannersByPosition('promotional')[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);



  return (
    <div className="bg-white">
      {/* 1. Hero Slider (Awareness) */}
      <section className="relative h-[95vh] min-h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] scale-100"
              style={{
                backgroundImage: `url(${slide.image})`,
                transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            <div className="relative container-custom h-full flex items-center">
              <div className="text-white max-w-2xl">
                <span className="text-xs font-black tracking-[0.4em] uppercase mb-4 block">
                  {slide.label}
                </span>
                <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] uppercase italic">{slide.title}</h1>
                <p className="text-lg md:text-xl mb-10 font-medium opacity-90 max-w-md tracking-wide">{slide.subtitle}</p>
                <Link href={slide.link} className="bg-white text-black px-12 py-5 font-black uppercase text-sm tracking-widest hover:bg-dark-900 hover:text-white transition-all inline-block shadow-2xl">
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <div className="absolute bottom-12 right-12 z-20 flex gap-4">
          <button onClick={prevSlide} className="w-12 h-12 border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"><ChevronLeft size={20} /></button>
          <button onClick={nextSlide} className="w-12 h-12 border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"><ChevronRight size={20} /></button>
        </div>
      </section>

      {/* 2. Trending Categories (Exploration) */}
      <div className="py-4">
        <TrendingCategories />
      </div>

      {/* 3. New Arrivals (Freshness) - SLIDER */}
      <ProductSlider
        title="Curated New Arrivals"
        subtitle="The latest pieces from our design studio"
        products={newArrivalProducts}
        loading={newArrivalLoading}
        link="/products?tag=new_arrivals"
      />

      {/* 4. Brands You Love (Trust - Moved UP) */}
      <div className="bg-white py-12 border-y border-dark-100">
        <BrandsYouLove />
      </div>

      {/* 5. Flash Sale Faves (Urgency) - SLIDER */}
      <div className="bg-[#fcfcfc]">
        <ProductSlider
          title="Flash Sale Favorites"
          subtitle="Limited time offers on our most loved pieces"
          products={saleProducts}
          loading={saleLoading}
          link="/products?tag=sale"
        />
      </div>

      {/* 6. Banner 1 - Promotional (Middle Break) */}
      <section className="relative h-[70vh] flex items-center group overflow-hidden bg-dark-900">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out group-hover:scale-110"
          style={{ backgroundImage: `url(${promotionalBanner?.imageUrl || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200'})` }}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-700"></div>
        <div className="relative container-custom text-white">
          <div className="max-w-2xl px-4 flex flex-col items-center mx-auto text-center">
            <span className="text-[10px] font-black tracking-[0.5em] uppercase mb-8 block md:mb-10 text-white/70">Limited Edition</span>
            <div className="h-[2px] w-12 bg-white mb-10 opacity-50"></div>
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter leading-[0.9] italic">
              {promotionalBanner?.title || 'Free Shipping'}
            </h2>
            <p className="text-xs md:text-sm mb-12 tracking-[0.3em] uppercase font-bold text-white/80 italic">
              {promotionalBanner?.meta?.subtitle || 'On all orders over $75'}
            </p>
            <Link
              href={promotionalBanner?.linkUrl || '/products'}
              className="bg-white text-black px-12 py-5 font-black uppercase text-[10px] tracking-[0.4em] hover:bg-black hover:text-white transition-all shadow-2xl"
            >
              {promotionalBanner?.meta?.buttonText || 'Discover Now'}
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Trending Products (Social Interest) - SLIDER */}
      <ProductSlider
        title="Trending Globally"
        subtitle="What everyone is wearing right now"
        products={trendingProducts}
        loading={trendingLoading}
        link="/products?tag=trending"
      />

      {/* 8. Men's Section (New) */}
      {menProducts.length > 0 && (
        <div className="bg-[#fcfcfc]">
          <ProductSlider
            title="Men's Essentials"
            subtitle="Sharp styles for the modern man"
            products={menProducts}
            loading={categoriesLoading}
            link="/products?category=men"
          />
        </div>
      )}

      {/* 9. Women's Section (New) */}
      {womenProducts.length > 0 && (
        <ProductSlider
          title="Women's Collection"
          subtitle="Elegant pieces for every occasion"
          products={womenProducts}
          loading={categoriesLoading}
          link="/products?category=women"
        />
      )}

      {/* 10. Jackets Section (New) */}
      {jacketsProducts.length > 0 && (
        <div className="bg-[#fcfcfc]">
          <ProductSlider
            title="Luxury Jackets"
            subtitle="Premium outerwear for the season"
            products={jacketsProducts}
            loading={categoriesLoading}
            link="/products?category=jackets"
          />
        </div>
      )}

      {/* 11. Kids' Section (New) */}
      {kidsProducts.length > 0 && (
        <ProductSlider
          title="Kids' Corner"
          subtitle="Playful and comfortable styles"
          products={kidsProducts}
          loading={categoriesLoading}
          link="/products?category=kids"
        />
      )}
      {!featuredLoading && featuredProducts.length > 0 && (
        <div className="bg-[#fcfcfc]">
          <ProductSlider
            title="Editor's Choice"
            subtitle="Hand-picked favorites from our stylists"
            products={featuredProducts.map(f => {
              const p = f.product;
              return {
                product_id: p.id?.toString(),
                id: p.id,
                name: p.name,
                price: p.price,
                image: p.images?.[0] || '',
                rating: 4.8,
                category_name: p.category?.name || 'Collection'
              };
            })}
            loading={featuredLoading}
            link="/products"
          />
        </div>
      )}

      {/* 9. Loved And Worn By (Social Proof - Moved UP) */}
      <div className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black tracking-[0.5em] text-dark-300 uppercase block mb-4">#OurCommunity</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Loved & Worn By You</h2>
          </div>
          <LovedAndWornBy />
        </div>
      </div>

      {/* 10. Banner 2 - Category Highlight */}
      <section className="relative h-[70vh] flex items-center group overflow-hidden bg-dark-900">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out group-hover:scale-110"
          style={{ backgroundImage: `url('${secondaryBanner?.imageUrl || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200'}')` }}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-700"></div>
        <div className="relative container-custom text-white">
          <div className="max-w-xl">
            <div className="h-[2px] w-12 bg-white mb-8 opacity-50"></div>
            <h2 className="text-4xl md:text-6xl font-black leading-[0.85] uppercase tracking-tighter mb-8 whitespace-pre-line italic">
              {secondaryBanner?.title || 'Trending\nNow\nUpdated'}
            </h2>
            <p className="text-xs md:text-sm text-white/80 font-bold tracking-[0.2em] uppercase mb-12 italic opacity-80">
              {secondaryBanner?.meta?.subtitle || "Discover what everyone's talking about"}
            </p>
            <Link
              href={secondaryBanner?.linkUrl || '/products'}
              className="inline-flex items-center gap-4 bg-white text-black font-black px-12 py-5 uppercase text-[10px] tracking-[0.3em] hover:bg-black hover:text-white transition-all shadow-2xl"
            >
              {secondaryBanner?.meta?.buttonText || 'Explore Collection'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Latest Collections (Deep Catalog) - SLIDER */}
      <ProductSlider
        title="Explore Full Catalog"
        subtitle="Our complete range of seasonal essentials"
        products={allProducts.slice(0, 12)}
        loading={allLoading}
        link="/products"
      />

      {/* 12. Newsletter Section */}
      <section className="bg-dark-900 text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
          <h2 className="text-[200px] font-black leading-none uppercase tracking-tighter italic">WEARINO</h2>
        </div>
        <div className="container-custom relative z-10 text-center">
          <span className="text-xs font-bold tracking-[0.6em] text-white/50 uppercase block mb-6">Join The Club</span>
          <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter italic">Get 15% Off Your First Order</h2>
          <p className="text-white/60 mb-12 max-w-2xl mx-auto tracking-wide font-light border-b border-white/10 pb-12">
            Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and the latest trends from our design team.
          </p>

          <form className="max-w-xl mx-auto flex flex-col md:flex-row gap-4">
            <input
              type="email"
              placeholder="YOUR E-MAIL ADDRESS"
              className="flex-1 px-8 py-5 bg-transparent border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white transition-all text-sm tracking-widest font-black"
            />
            <button
              type="submit"
              className="bg-white text-black px-12 py-5 font-black uppercase text-xs tracking-[0.4em] hover:bg-dark-200 transition-all whitespace-nowrap shadow-xl"
            >
              Sign Me Up
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
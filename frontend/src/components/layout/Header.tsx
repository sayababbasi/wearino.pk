'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingBag, Heart, Menu, X, User, ChevronDown, ArrowRight } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/src/lib/store';
import CartDrawer from '@/src/components/cart/CartDrawer';
import { api } from '@/src/lib/api';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  // ... other hooks
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: string | number) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 100);
    setHoverTimeout(timeout);
  };

  // Prevent hydration mismatch by only reading store values after mount
  const cartItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items.length);

  // Track client-side mount to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing user", e);
      }
    }

    // Listen for storage changes (for login/logout)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [categoriesData, contentData] = await Promise.all([
          api.getCategories(),
          api.getContent('announcement')
        ]);

        // Transform backend categories to frontend format
        // Transform backend categories to the EXACT structure requested by the user
        const finalStructure = [
          { name: 'Women', subNames: ['Tops', 'Dresses', 'Bottoms', 'Jackets', 'Beauty', 'Accessories'] },
          { name: 'Men', subNames: ["Men's Fashion", 'Tops', 'Bottoms', 'Jackets', 'Accessories'] },
          { name: 'Kids', subNames: ['Boys', 'Girls', 'Accessories'] },
          { name: 'Electronics & Gadgets', subNames: [] },
          { name: 'Home & Living', subNames: [] },
          { name: 'Trending', subNames: [] }
        ];

        const allCats = categoriesData;
        const transformed: any[] = [];

        finalStructure.forEach(item => {
          // Find the parent category or placeholder
          let parent = allCats.find((c: any) =>
            c.name.toLowerCase().trim() === item.name.toLowerCase() ||
            (item.name === 'Women' && c.name.toLowerCase().includes('women')) ||
            (item.name === 'Men' && (c.name.toLowerCase() === 'men' || c.name.toLowerCase() === 'mens fashion'))
          );

          if (!parent) {
            // Fallback for missing parent
            parent = { id: `temp-${item.name}`, name: item.name, slug: item.name.toLowerCase().replace(/\s+/g, '-') };
          }

          const subcategories: any[] = [];
          item.subNames.forEach(subName => {
            // Find a child that matches this subName AND is either a child of this parent or just matches the name
            const child = allCats.find((c: any) =>
              c.name.toLowerCase().trim() === subName.toLowerCase() &&
              (c.parentId === parent.id || !c.parentId || c.id !== parent.id)
            );

            if (child && child.id !== parent.id) {
              subcategories.push({
                id: child.id,
                name: child.name,
                slug: child.name.toLowerCase().trim().replace(/\s+/g, '-')
              });
            }
          });

          transformed.push({
            id: parent.id,
            name: item.name, // Use the clean name from our structure
            slug: parent.slug,
            subcategories: subcategories
          });
        });

        setCategories(transformed);

        // Set Announcement
        const activeAnnouncement = contentData.find((c: any) => c.type === 'announcement');
        if (activeAnnouncement) {
          let parsedMeta = {};
          try {
            parsedMeta = typeof activeAnnouncement.meta === 'string'
              ? JSON.parse(activeAnnouncement.meta)
              : activeAnnouncement.meta || {};
          } catch (e) {
            console.error("Failed to parse announcement meta in header", e);
          }

          setAnnouncement({
            ...activeAnnouncement,
            meta: parsedMeta
          });
        }

      } catch (error) {
        console.error('Error fetching header data:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      const matchedCategory = categories.find(
        (cat) => cat.name.toLowerCase() === query.toLowerCase()
      );

      if (matchedCategory) {
        router.push(`/products?category=${encodeURIComponent(matchedCategory.slug)}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-dark-100 shadow-sm">
        {/* Top Banner */}
        {announcement && announcement.isActive && (
          <div
            className="relative overflow-hidden text-center py-2 text-[11px] tracking-[0.15em] font-bold uppercase transition-colors duration-300"
            style={{
              backgroundColor: announcement.meta?.backgroundColor || '#0a0a0a',
              color: announcement.meta?.textColor || '#ffffff'
            }}
          >
            {announcement.meta?.sliding ? (
              <div className="marquee-container overflow-hidden whitespace-nowrap">
                <p className="animate-marquee inline-block">{announcement.title}</p>
              </div>
            ) : (
              <p>{announcement.title}</p>
            )}
          </div>
        )}

        {/* Main Header */}
        <div className="container-custom">
          <div className="flex items-center justify-between py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-black tracking-tighter uppercase">
                WEARINO
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-center flex-1 px-12 space-x-10">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="relative py-2"
                  onMouseEnter={() => handleMouseEnter(category.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={
                      category.name === 'Trending' ? '/products?tag=trending' :
                        String(category.id).startsWith('temp') ? '#' : `/products?category=${category.id}`
                    }
                    className={`text-[12px] font-bold tracking-[0.1em] transition-all uppercase flex items-center gap-1.5 relative border-b-2 ${activeDropdown === category.id ? 'text-dark-900 border-dark-900' : 'text-dark-500 hover:text-dark-900 border-transparent'}`}
                  >
                    {category.name}
                    {category.subcategories.length > 0 && (
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-300 ${activeDropdown === category.id ? 'rotate-180' : ''}`}
                      />
                    )}
                  </Link>

                  {/* Professional Dropdown / Mega Menu */}
                  {category.subcategories.length > 0 && activeDropdown === category.id && (
                    <div
                      className="absolute top-full left-0 pt-4 min-w-[280px] z-[100]"
                      onMouseEnter={() => handleMouseEnter(category.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="bg-white border border-dark-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden rounded-sm animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="py-8 px-0">
                          <div className="px-8 mb-6">
                            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-dark-400 border-b border-dark-50 pb-3">
                              Explore {category.name}
                            </p>
                          </div>
                          <div className="flex flex-col">
                            {category.subcategories.map((sub: any) => (
                              <Link
                                key={sub.id}
                                href={`/products?category=${sub.id}`}
                                className="group/item relative px-8 py-3 text-[13px] tracking-wide text-dark-600 hover:text-dark-900 transition-colors"
                              >
                                <span className="relative z-10">{sub.name}</span>
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-[1px] bg-dark-900 transition-all duration-300 group-hover/item:w-4"></span>
                                <div className="absolute inset-0 bg-dark-50/50 scale-x-0 origin-left transition-transform duration-300 group-hover/item:scale-x-100 -z-0"></div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Visual Enhancement: Elegant Bottom bar */}
                        <Link
                          href={String(category.id).startsWith('temp') ? '#' : `/products?category=${category.id}`}
                          className="block bg-dark-900 group/all"
                        >
                          <div className="py-4 px-8 flex items-center justify-between">
                            <span className="text-white text-[11px] font-bold uppercase tracking-[0.2em]">
                              View All Collection
                            </span>
                            <ArrowRight size={14} className="text-white transition-transform duration-300 group-hover/all:translate-x-1" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:bg-dark-50 rounded-full transition-colors"
              >
                <Search size={20} />
              </button>
              {isMounted && user ? (
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('user')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="p-2 hover:bg-dark-50 rounded-full transition-colors flex items-center gap-1 group">
                    <User size={20} className="group-hover:text-black" />
                    <ChevronDown size={14} className="text-dark-400 group-hover:text-black" />
                  </button>

                  {activeDropdown === 'user' && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-dark-200 shadow-lg py-2 min-w-[220px] z-50">
                      <div className="px-4 py-3 border-b border-dark-100 bg-dark-50/50">
                        <p className="text-sm font-semibold text-dark-900 truncate">{user.name}</p>
                        <p className="text-xs text-dark-500 truncate">{user.email}</p>
                        <p className="text-[10px] uppercase text-blue-600 font-bold mt-1 inline-block bg-blue-50 px-1.5 rounded">{user.role}</p>
                      </div>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                        >
                          <User size={16} />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/track-order"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                      >
                        <Package size={16} />
                        Track My Order
                      </Link>

                      <button
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          window.location.href = '/';
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-dark-100 mt-1 focus:outline-none"
                      >
                        <X size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:block p-2 hover:bg-dark-50 rounded-full transition-colors"
                >
                  <User size={20} />
                </Link>
              )}
              <Link
                href="/wishlist"
                className="p-2 hover:bg-dark-50 rounded-full transition-colors relative"
              >
                <Heart size={20} />
                {isMounted && wishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-dark-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:bg-dark-50 rounded-full transition-colors relative"
              >
                <ShoppingBag size={20} />
                {isMounted && cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-dark-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pl-10 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-900"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-dark-200">
            <nav className="container-custom py-4 space-y-2">
              {categories.map((category) => (
                <div key={category.slug}>
                  <Link
                    href={
                      category.name === 'Trending' ? '/products?tag=trending' :
                        String(category.id).startsWith('temp') ? '#' : `/products?category=${category.id}`
                    }
                    className="block py-2 text-sm font-medium hover:text-dark-600 transition-colors uppercase"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                  {category.subcategories.length > 0 && (
                    <div className="pl-4 space-y-1">
                      {category.subcategories.map((sub: any) => (
                        <Link
                          key={sub.id}
                          href={`/products?category=${sub.id}`}
                          className="block py-1 text-sm text-dark-600 hover:text-dark-900"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="container-custom py-2 border-t border-dark-100">
              <Link
                href="/track-order"
                className="block py-3 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase"
                onClick={() => setIsMenuOpen(false)}
              >
                Track My Order
              </Link>
            </div>
          </div>
        )}

      </header>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, Heart, Menu, X, User, ChevronDown, Package, LayoutDashboard, Truck } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/src/lib/store';
import CartDrawer from '@/src/components/cart/CartDrawer';
import { api } from '@/src/lib/api';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: string | number) => {
    if (hoverTimeout) { clearTimeout(hoverTimeout); setHoverTimeout(null); }
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const t = setTimeout(() => setActiveDropdown(null), 100);
    setHoverTimeout(t);
  };

  const cartItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items.length);

  useEffect(() => {
    setIsMounted(true);
    const checkUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try { setUser(JSON.parse(userStr)); } catch (e) { console.error('Error parsing user', e); setUser(null); }
      } else {
        setUser(null);
      }
    };
    
    checkUser();
    
    const handleStorageChange = () => {
      checkUser();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom login events if any
    window.addEventListener('auth-change', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, [pathname]); // Re-check user when navigating between pages

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, contentData] = await Promise.all([
          api.getCategories(),
          api.getContent('announcement')
        ]);

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
          let parent = allCats.find((c: any) =>
            c.name.toLowerCase().trim() === item.name.toLowerCase() ||
            (item.name === 'Women' && c.name.toLowerCase().includes('women')) ||
            (item.name === 'Men' && (c.name.toLowerCase() === 'men' || c.name.toLowerCase() === 'mens fashion'))
          );
          if (!parent) {
            parent = { id: `temp-${item.name}`, name: item.name, slug: item.name.toLowerCase().replace(/\s+/g, '-') };
          }
          const subcategories: any[] = [];
          item.subNames.forEach(subName => {
            const child = allCats.find((c: any) =>
              c.name.toLowerCase().trim() === subName.toLowerCase() &&
              (c.parentId === parent.id || !c.parentId || c.id !== parent.id)
            );
            if (child && child.id !== parent.id) {
              subcategories.push({ id: child.id, name: child.name, slug: child.name.toLowerCase().trim().replace(/\s+/g, '-') });
            }
          });
          transformed.push({ id: parent.id, name: item.name, slug: parent.slug, subcategories });
        });

        setCategories(transformed);

        const activeAnn = contentData.find((c: any) => c.type === 'announcement');
        if (activeAnn) {
          let parsedMeta = {};
          try {
            parsedMeta = typeof activeAnn.meta === 'string' ? JSON.parse(activeAnn.meta) : activeAnn.meta || {};
          } catch (e) { console.error('Failed to parse announcement meta', e); }
          setAnnouncement({ ...activeAnn, meta: parsedMeta });
        }
      } catch (error) {
        console.error('Error fetching header data:', error);
        setCategories([]);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      const matchedCat = categories.find(c => c.name.toLowerCase() === query.toLowerCase());
      if (matchedCat) {
        router.push(`/products?category=${encodeURIComponent(matchedCat.slug)}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
      setSearchQuery('');
    }
  };

  if (pathname?.startsWith('/admin')) return null;

  const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'SHOP', href: '/products' },
    { label: 'NEW ARRIVALS', href: '/products?tag=new_arrivals' },
    { label: 'BEST SELLERS', href: '/products?tag=trending' },
    { label: 'TRACK ORDER', href: '/track-order' },
    { label: 'ABOUT US', href: '/about' },
    { label: 'CONTACT US', href: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">

        {/* ── Announcement Banner (inside sticky so it's never covered) ── */}
        {announcement?.isActive && (
          <div
            className="py-1.5 text-[10.5px] tracking-[0.12em] font-semibold uppercase overflow-hidden"
            style={{ backgroundColor: announcement.meta?.backgroundColor || '#0a0a0a', color: announcement.meta?.textColor || '#ffffff' }}
          >
            {announcement.meta?.barStyle === 'triple' ? (
              /* 3-Column Info Bar */
              <div className="container-custom flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {announcement.meta?.leftIcon && <span>{announcement.meta.leftIcon}</span>}
                  {announcement.meta?.leftText}
                </span>
                <span className="flex items-center gap-1.5">
                  {announcement.meta?.centerIcon && <span>{announcement.meta.centerIcon}</span>}
                  {announcement.meta?.centerText}
                </span>
                <span className="flex items-center gap-1.5">
                  {announcement.meta?.rightIcon && <span>{announcement.meta.rightIcon}</span>}
                  {announcement.meta?.rightText}
                </span>
              </div>
            ) : announcement.meta?.sliding ? (
              /* Single Marquee */
              <div className="marquee-container overflow-hidden whitespace-nowrap text-center">
                <p className="animate-marquee inline-block">{announcement.title}</p>
              </div>
            ) : (
              /* Single Static */
              <p className="text-center">{announcement.title}</p>
            )}
          </div>
        )}


        {/* ══════════════ ROW 1: Logo | Search | Icons ══════════════ */}
        <div className="container-custom">
          <div className="flex items-center gap-5 pt-1 pb-1.5">

            {/* Mobile hamburger */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-1 text-gray-800">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* ── Logo ── */}
            <Link href="/" className="flex-shrink-0">
              <img src="/logo.png" alt="WEARINO" className="h-20 md:h-24 w-auto object-contain" />
            </Link>

            {/* ── Search Bar (desktop) ── */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-lg border border-gray-300 rounded-full overflow-hidden focus-within:border-gray-500 transition-colors h-9">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 px-5 py-0 outline-none text-xs text-gray-700 placeholder:text-gray-400 bg-white"
              />
              {/* All Categories pill */}
              <div className="flex items-center gap-1 px-3 border-l border-gray-300 bg-gray-50 text-[11px] text-gray-600 cursor-default select-none whitespace-nowrap">
                All Categories <ChevronDown size={11} className="text-gray-400" />
              </div>
              {/* Search button – BLACK */}
              <button type="submit" className="bg-black hover:bg-gray-800 text-white px-5 flex items-center justify-center transition-colors">
                <Search size={15} />
              </button>
            </form>

            {/* ── Right Icons ── */}
            <div className="flex items-center gap-6 ml-auto lg:ml-0">

              {/* Account */}
              <div
                className="hidden lg:flex items-center gap-2 cursor-pointer relative"
                onMouseEnter={() => handleMouseEnter('user')}
                onMouseLeave={handleMouseLeave}
              >
                <User size={21} className="text-gray-700 stroke-[1.5]" />
                <div className="leading-tight">
                  <p className="text-[12px] font-semibold text-gray-900 truncate max-w-[80px]">
                    {isMounted && user ? user.name.split(' ')[0] : 'Account'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {isMounted && user ? 'Manage Account' : 'Login / Register'}
                  </p>
                </div>

                {/* Account Dropdown */}
                {activeDropdown === 'user' && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-md min-w-[220px] z-50 py-2">
                    {isMounted && user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        {user.role === 'admin' && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <User size={15} /> Admin Dashboard
                          </Link>
                        )}
                        <Link href="/account/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <LayoutDashboard size={15} /> My Dashboard
                        </Link>
                        <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Package size={15} /> My Orders
                        </Link>
                        <Link href="/track-order" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Truck size={15} /> Track My Order
                        </Link>
                        <button
                          onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                        >
                          <X size={15} /> Logout
                        </button>
                      </>
                    ) : (
                      <div className="p-4 flex flex-col gap-3">
                        <Link href="/auth/login" className="bg-black text-white text-center py-2.5 rounded text-sm font-bold hover:bg-gray-800 transition-colors">
                          Sign In
                        </Link>
                        <p className="text-center text-xs text-gray-500">
                          New customer?{' '}
                          <Link href="/auth/register" className="text-black font-bold hover:underline">Start here.</Link>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link href="/wishlist" className="hidden lg:flex items-center gap-1.5 relative">
                <Heart size={21} className="text-gray-700 stroke-[1.5]" />
                <span className="text-[12px] font-semibold text-gray-900">Wishlist</span>
                {isMounted && (
                  <span className="bg-black text-white text-[10px] font-bold rounded-full w-[17px] h-[17px] flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-1.5 relative">
                <ShoppingCart size={21} className="text-gray-700 stroke-[1.5]" />
                <span className="hidden lg:inline text-[12px] font-semibold text-gray-900">Cart</span>
                {isMounted && (
                  <span className="bg-black text-white text-[10px] font-bold rounded-full w-[17px] h-[17px] flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </button>

              {/* Mobile: account icon */}
              <Link href={isMounted && user ? "/account/dashboard" : "/auth/login"} className="lg:hidden p-1 text-gray-700">
                <User size={22} className="stroke-[1.5]" />
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          <div className="lg:hidden pb-3">
            <form onSubmit={handleSearch} className="flex border border-gray-300 rounded-full overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 outline-none text-sm text-gray-700"
              />
              <button type="submit" className="bg-black text-white px-4 flex items-center justify-center">
                <Search size={17} />
              </button>
            </form>
          </div>
        </div>

        {/* ══════════════ ROW 2: All Categories | Nav Links ══════════════ */}
        <div className="hidden lg:block border-t border-gray-100">
          <div className="container-custom flex items-stretch">

            {/* ── ALL CATEGORIES button – BLACK ── */}
            <div className="relative group/cats flex-shrink-0 flex items-center pr-4">
              <button className="h-8 bg-black hover:bg-gray-900 text-white flex items-center gap-2 px-5 font-bold text-[10px] tracking-[0.05em] transition-colors rounded-full">
                <Menu size={12} />
                ALL CATEGORIES
                <ChevronDown size={10} />
              </button>

              {/* Dropdown panel */}
              <div className="absolute top-full left-0 w-[240px] bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover/cats:opacity-100 group-hover/cats:visible transition-all duration-200 z-50 py-2">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    href={String(cat.id).startsWith('temp') ? '#' : `/products?category=${cat.id}`}
                    className="flex justify-between items-center px-5 py-2.5 text-[13px] text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    {cat.name}
                    {cat.subcategories?.length > 0 && <ChevronDown size={12} className="-rotate-90 text-gray-400" />}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Nav Links ── */}
            <nav className="flex items-center">
              {navLinks.map(link => {
                // Precise active state logic
                const linkPath = link.href.split('?')[0];
                const linkQuery = link.href.split('?')[1] || '';
                const isPathMatch = pathname === linkPath;
                
                let isActive = false;
                if (isPathMatch) {
                  if (linkQuery) {
                    // Link has specific tags/params - match them exactly
                    const lParams = new URLSearchParams(linkQuery);
                    isActive = Array.from(lParams.entries()).every(([k, v]) => searchParams.get(k) === v);
                  } else {
                    // Base link (like SHOP) - active only if NO other specific params are present
                    isActive = Array.from(searchParams.entries()).length === 0;
                  }
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 pt-1.5 pb-2 text-[11px] font-bold tracking-[0.08em] border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-black border-black'
                        : 'text-gray-500 border-transparent hover:text-black hover:border-gray-300'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ══════════════ Mobile Menu ══════════════ */}
        {isMenuOpen && (
          <div className="lg:hidden absolute w-full left-0 top-full bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="container-custom py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2.5 text-sm font-bold text-gray-800 hover:text-black border-b border-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Categories</p>
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    href={String(cat.id).startsWith('temp') ? '#' : `/products?category=${cat.id}`}
                    className="block py-2 text-sm text-gray-600 hover:text-black transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
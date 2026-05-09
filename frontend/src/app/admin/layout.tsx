'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  ShoppingCart,
  Tag,
  MessageSquare,
  Star
} from 'lucide-react';
import { api } from '@/src/lib/api';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
  { icon: Tag, label: 'Coupons', href: '/admin/coupons' },
  { icon: Star, label: 'Reviews', href: '/admin/reviews' }, // Added Reviews
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: MessageSquare, label: 'Chats', href: '/admin/chat' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'Content', href: '/admin/content' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.replace('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.role !== 'admin') {
        router.replace('/'); // Redirect non-admins to home
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.replace('/auth/login');
    }
  }, [router, pathname]);

  // Fetch announcement from API (same as frontend Header)
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const contentData = await api.getContent('announcement');
        const activeAnnouncement = contentData.find((c: any) => c.type === 'announcement');
        if (activeAnnouncement) {
          let parsedMeta = {};
          try {
            parsedMeta = typeof activeAnnouncement.meta === 'string'
              ? JSON.parse(activeAnnouncement.meta)
              : activeAnnouncement.meta || {};
          } catch (e) {
            console.error("Failed to parse announcement meta in admin layout", e);
          }

          setAnnouncement({
            ...activeAnnouncement,
            meta: parsedMeta
          });
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
      }
    };

    fetchAnnouncement();
  }, [pathname]); // Re-fetch when navigating in admin (e.g., after content changes)

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  // Filter menu items based on role
  const getFilteredMenuItems = () => {
    if (!user) return [];

    // Admin gets everything
    if (user.role === 'admin') return menuItems;

    // Manager gets everything except Users
    if (user.role === 'manager') {
      return menuItems.filter(item => item.label !== 'Users');
    }

    // Assistant gets only Dashboard (limited), Orders, Chats
    if (user.role === 'assistant') {
      return menuItems.filter(item =>
        ['Dashboard', 'Orders', 'Chats'].includes(item.label)
      );
    }

    return [];
  };

  const filteredItems = getFilteredMenuItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Top Banner - Dynamic Announcement */}
      {announcement && announcement.isActive && (
        <div
          className="fixed top-0 left-0 right-0 min-h-[52px] flex items-center justify-center text-sm uppercase z-[60] overflow-hidden print:hidden"
          style={{
            backgroundColor: announcement.meta?.backgroundColor || '#0a0a0a',
            color: announcement.meta?.textColor || '#ffffff'
          }}
        >
          {announcement.meta?.sliding ? (
            <div className="marquee-container overflow-hidden whitespace-nowrap w-full">
              <p className="animate-marquee inline-block">{announcement.title}</p>
            </div>
          ) : (
            <p className="py-4">{announcement.title}</p>
          )}
        </div>
      )}
      {/* Fallback banner when no announcement */}
      {(!announcement || !announcement.isActive) && (
        <div className="fixed top-0 left-0 right-0 h-[52px] bg-gray-900 text-white flex items-center justify-center text-sm uppercase z-[60] print:hidden">
          <img src="/logo.png" alt="WEARINO ADMIN" className="h-6 w-auto brightness-0 invert" />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-[52px] left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform lg:translate-x-0 print:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <Link href="/admin" className="block">
              <img src="/logo.png" alt="WEARINO" className="h-12 w-auto object-contain" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-1 px-3">
              {filteredItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-medium text-sm truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                <p className="text-[10px] uppercase text-blue-600 font-bold mt-0.5">{user?.role || ''}</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
              }}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 w-full px-2 py-1"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 pt-[52px] print:ml-0 print:pt-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 print:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1 lg:flex-none"></div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              View Store
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
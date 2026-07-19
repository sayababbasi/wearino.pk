'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, 
  Package, 
  Heart, 
  Star, 
  RefreshCcw, 
  LogOut, 
  LayoutDashboard,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Manage My Account',
    href: '/account/profile',
    icon: User
  },
  {
    label: 'My Orders',
    href: '/account/orders',
    icon: Package
  },
  {
    label: 'My Wishlist',
    href: '/account/wishlist',
    icon: Heart
  },
  {
    label: 'My Reviews',
    href: '/account/reviews',
    icon: Star
  },
  {
    label: 'Returns & Cancellations',
    href: '/account/returns',
    icon: RefreshCcw
  }
];

export default function AccountSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-32">
        {/* User Info Header */}
        <div className="p-6 bg-black text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-black font-bold text-xl">
              {typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')?.name?.charAt(0) || 'U' : 'U'}
            </div>
            <div>
              <p className="text-sm text-gray-400">Hello,</p>
              <p className="font-semibold truncate max-w-[150px]">
                {typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')?.name || 'User' : 'User'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gold-50 text-gold-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? 'text-gold-600' : 'text-gray-400 group-hover:text-black'} />
                  <span className="text-[14px] font-medium">{item.label}</span>
                </div>
                <ChevronRight 
                  size={16} 
                  className={`transition-transform duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} 
                />
              </Link>
            );
          })}

          <div className="my-2 border-t border-gray-100"></div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="text-[14px] font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}

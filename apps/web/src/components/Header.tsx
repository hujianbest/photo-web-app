'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, Bell, Menu, X } from 'lucide-react';
import { SafeImage } from '@/components/SafeImage';
import { useNotifications } from '@/context/NotificationsContext';

const NAV_LINKS = [
  { href: '/', label: '首页' },
  { href: '/works', label: '作品' },
  { href: '/spots', label: '打卡点' },
  { href: '/bookings', label: '约拍' },
  { href: '/orders', label: '订单' },
  { href: '/articles', label: '经验' },
];

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifications = useNotifications();
  const unreadCount = notifications?.unreadCount ?? 0;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-neutral-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-14">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer text-neutral-900 hover:opacity-80 transition-opacity duration-200"
            aria-label="首页"
          >
            <Camera className="w-6 h-6 text-neutral-900" aria-hidden />
            <span className="text-lg font-semibold text-neutral-900 tracking-tight">
              摄影师服务平台
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-neutral-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/notifications"
                  className="relative inline-flex items-center justify-center w-10 h-10 rounded-full text-neutral-600 hover:text-blue-600 hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
                  aria-label={unreadCount > 0 ? `通知，${unreadCount} 条未读` : '通知'}
                >
                  <Bell className="w-5 h-5" aria-hidden />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 min-h-[40px] px-2 rounded-full hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
                >
                  {user?.avatar_url ? (
                    <SafeImage
                      src={user.avatar_url}
                      alt={user?.username || '用户头像'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-700 text-sm font-medium">
                      {user?.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <span className="text-sm text-neutral-700 font-medium hidden sm:inline">
                    {user?.username}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-neutral-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer px-3 py-2 rounded-full hover:bg-neutral-100"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-neutral-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer px-3 py-2 rounded-full hover:bg-neutral-100"
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 cursor-pointer px-4 py-2 rounded-full font-medium"
                >
                  注册
                </Link>
              </>
            )}

            <button
              type="button"
              aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden />
              ) : (
                <Menu className="w-5 h-5" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200">
            <nav className="flex flex-col gap-0">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block py-3 px-2 text-sm text-neutral-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

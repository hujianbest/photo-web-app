'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

  // 登录态由 Header 从 localStorage 恢复（access_token、user_data），避免刷新后闪退为未登录
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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">📸</span>
            <span className="text-xl font-bold text-indigo-600">
              摄影师服务平台
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-gray-700 hover:text-indigo-600 transition"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/notifications"
                  className="relative text-gray-700 hover:text-indigo-600 transition inline-flex items-center min-h-[44px]"
                  aria-label={unreadCount > 0 ? `通知，${unreadCount} 条未读` : '通知'}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-xs flex items-center justify-center px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center space-x-2"
                >
                  {user?.avatar_url ? (
                    <SafeImage
                      src={user.avatar_url}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-gray-700">{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition min-h-[44px]"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition min-h-[44px] inline-flex items-center"
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition min-h-[44px] inline-flex items-center"
                >
                  注册
                </Link>
              </>
            )}

            {/* 移动端汉堡菜单按钮 */}
            <button
              type="button"
              aria-label="打开菜单"
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              {mobileMenuOpen ? (
                <span className="text-xl">✕</span>
              ) : (
                <span className="text-xl">☰</span>
              )}
            </button>
          </div>
        </div>

        {/* 移动端折叠导航 */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block py-3 px-2 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-lg min-h-[44px] flex items-center"
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
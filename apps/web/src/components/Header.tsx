'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 检查登录状态
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
            <Link
              href="/"
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              首页
            </Link>
            <Link
              href="/works"
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              作品
            </Link>
            <Link
              href="/spots"
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              打卡点
            </Link>
            <Link
              href="/bookings"
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              约拍
            </Link>
            <Link
              href="/articles"
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              经验
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/notifications"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  🔔
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center space-x-2"
                >
                  {user?.avatar_url ? (
                    <img
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition"
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UserProfileHeader } from '@/components/UserProfileHeader';
import { apiFetch } from '@/lib/api';

interface UserStats {
  user_id: number;
  username: string;
  points: number;
  level: number;
  works_count: number;
  followers_count: number;
  following_count: number;
  checkins_count: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; username: string; avatar_url?: string; bio?: string; email?: string } | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
    if (!raw) {
      router.replace('/auth/login?redirect=' + encodeURIComponent('/profile'));
      return;
    }
    try {
      const u = JSON.parse(raw);
      setUser(u);
      if (u?.id) fetchStats(u.id);
    } catch {
      router.replace('/auth/login?redirect=' + encodeURIComponent('/profile'));
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchStats = async (userId: number) => {
    try {
      const response = await apiFetch(`/users/${userId}/stats`);
      const data = await response.json();
      if (data.success) setStats(data.data ?? null);
    } catch {
      // 未登录或接口不可用时不阻塞
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserProfileHeader
          user={{
            username: user.username,
            avatar_url: user.avatar_url ?? null,
            bio: user.bio,
            level: stats?.level?.toString(),
            stats: {
              works: stats?.works_count ?? 0,
              checkins: stats?.checkins_count ?? 0,
              bookings: 0,
              likes: 0,
            },
          }}
          isOwn={true}
        />

        <div className="bg-white rounded-lg shadow-md mt-6">
          <div className="border-t divide-y">
            <Link href="/works" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
              <span className="text-gray-900">我的作品</span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link href="/bookings" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
              <span className="text-gray-900">我的约拍</span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link href="/orders" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
              <span className="text-gray-900">我的订单</span>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

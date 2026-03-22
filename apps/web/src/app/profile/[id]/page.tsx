'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UserProfileHeader } from '@/components/UserProfileHeader';
import { apiFetch } from '@/lib/api';

interface ApiUser {
  id: number;
  username: string;
  avatar_url: string | null;
  bio?: string | null;
  location?: string | null;
  level?: string;
}

interface ApiStats {
  works_count: number;
  checkins_count: number;
  level?: string;
}

export default function PublicProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<ApiUser | null>(null);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [uRes, sRes] = await Promise.all([
          apiFetch(`/users/${id}`),
          apiFetch(`/users/${id}/stats`),
        ]);
        const u = await uRes.json();
        const s = await sRes.json();
        if (cancelled) return;
        if (u?.id) {
          setUser(u);
          setStats(s);
        } else {
          setError('用户不存在');
        }
      } catch {
        if (!cancelled) setError('加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/rankings" className="text-sm text-blue-600 hover:text-blue-700 mb-6 inline-block cursor-pointer">
          ← 返回排行榜
        </Link>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        )}

        {!loading && error && <p className="text-center text-neutral-500 py-12">{error}</p>}

        {!loading && user && (
          <UserProfileHeader
            user={{
              username: user.username,
              avatar_url: user.avatar_url,
              bio: user.bio ?? undefined,
              location: user.location ?? undefined,
              level: stats?.level ?? user.level,
              stats: {
                works: stats?.works_count ?? 0,
                checkins: stats?.checkins_count ?? 0,
                bookings: 0,
                likes: 0,
              },
            }}
            isOwn={false}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';

interface BookingItem {
  id: number;
  type: string;
  title: string | null;
  description: string;
  date: string;
  time_range: string | null;
  location: string | null;
  status: string;
  requester: { id: number; username: string; avatar_url: string | null };
  target_user: { id: number; username: string; avatar_url: string | null };
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: '待响应',
  accepted: '已接受',
  rejected: '已拒绝',
  cancelled: '已取消',
  completed: '已完成',
};
const TYPE_LABEL: Record<string, string> = {
  free: '互勉',
  paid: '收费',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [type, setType] = useState<string>('');

  useEffect(() => {
    fetchBookings();
  }, [page, status, type]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(status && { status }),
        ...(type && { type }),
      });
      const response = await apiFetch(`/bookings?${params}`);
      const data = await response.json();
      if (data.success) {
        setBookings(data.data?.items ?? []);
        setTotalPages(data.data?.pagination?.total_pages ?? 1);
      }
    } catch (error) {
      console.error('获取约拍列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">约拍</h1>
          <p className="text-gray-600">管理我发起与收到的约拍需求</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-gray-600 self-center">状态：</span>
          {['', 'pending', 'accepted', 'rejected', 'cancelled', 'completed'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                status === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {s ? STATUS_LABEL[s] ?? s : '全部'}
            </button>
          ))}
          <span className="text-sm text-gray-600 self-center ml-4">类型：</span>
          {['', 'free', 'paid'].map((t) => (
            <button
              key={t || 'all'}
              onClick={() => { setType(t); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                type === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t ? TYPE_LABEL[t] ?? t : '全部'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">暂无约拍记录</p>
            <p className="text-sm text-gray-500 mt-2">约拍需登录后查看</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((b) => (
                <Link key={b.id} href={`/bookings/${b.id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition p-4 h-full">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {TYPE_LABEL[b.type] ?? b.type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        b.status === 'accepted' || b.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                      {b.title || '无标题'}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{b.description}</p>
                    <p className="text-xs text-gray-500">
                      日期 {b.date} {b.time_range ? `· ${b.time_range}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      发起: {b.requester?.username ?? '-'} → {b.target_user?.username ?? '-'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一页
                </button>
                <span className="px-4 py-2 bg-white border rounded-lg">
                  第 {page} / {totalPages} 页
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';
import { SafeImage } from '@/components/SafeImage';

interface BookingDetail {
  id: number;
  type: string;
  title: string | null;
  description: string;
  date: string;
  time_range: string | null;
  location: string | null;
  budget: number | null;
  requirements: string[] | null;
  style_preferences: string[] | null;
  sample_images: string[] | null;
  status: string;
  response_deadline: string | null;
  can_accept: boolean;
  can_reject: boolean;
  can_cancel: boolean;
  requester: { id: number; username: string; avatar_url: string | null };
  target_user: { id: number; username: string; avatar_url: string | null };
  created_at: string;
  updated_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: '待响应',
  accepted: '已接受',
  rejected: '已拒绝',
  cancelled: '已取消',
  completed: '已完成',
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/bookings/${id}`);
      const data = await response.json();
      if (data.success) setBooking(data.data ?? null);
    } catch (error) {
      console.error('获取约拍详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const doAction = async (
    action: 'accept' | 'reject' | 'cancel' | 'complete',
    body?: { reason?: string }
  ) => {
    if (!id) return;
    setActionLoading(action);
    try {
      const res = await apiFetch(`/bookings/${id}/${action}`, {
        method: 'PUT',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        await fetchDetail();
        if (action === 'reject' || action === 'cancel') {
          setRejectReason('');
          setCancelReason('');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          ) : (
            <p className="text-gray-600">约拍不存在或无权查看</p>
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
        <Link href="/bookings" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">
          ← 返回约拍列表
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {booking.title || '约拍需求'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {STATUS_LABEL[booking.status] ?? booking.status} · {booking.type === 'free' ? '互勉' : '收费'}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-gray-700 whitespace-pre-wrap">{booking.description}</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-500">日期</dt><dd>{booking.date} {booking.time_range && `· ${booking.time_range}`}</dd></div>
              {booking.location && (
                <div><dt className="text-gray-500">地点</dt><dd>{booking.location}</dd></div>
              )}
              {booking.budget != null && (
                <div><dt className="text-gray-500">预算</dt><dd>¥{Number(booking.budget)}</dd></div>
              )}
              <div><dt className="text-gray-500">发起人</dt><dd className="flex items-center gap-2">
                {booking.requester?.avatar_url ? (
                  <SafeImage src={booking.requester.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">
                    {booking.requester?.username?.[0]?.toUpperCase()}
                  </span>
                )}
                {booking.requester?.username ?? '-'}
              </dd></div>
              <div><dt className="text-gray-500">约拍对象</dt><dd className="flex items-center gap-2">
                {booking.target_user?.avatar_url ? (
                  <SafeImage src={booking.target_user.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">
                    {booking.target_user?.username?.[0]?.toUpperCase()}
                  </span>
                )}
                {booking.target_user?.username ?? '-'}
              </dd></div>
            </dl>
            {(booking.requirements?.length ?? 0) > 0 && (
              <div>
                <dt className="text-gray-500 text-sm">需求说明</dt>
                <ul className="list-disc list-inside text-gray-700 mt-1">{booking.requirements!.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}
            {(booking.sample_images?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2">
                {booking.sample_images!.map((url, i) => (
                  <SafeImage key={i} src={url} alt="" className="w-24 h-24 rounded object-cover" />
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t space-y-3">
            {booking.can_accept && (
              <button
                onClick={() => doAction('accept')}
                disabled={!!actionLoading}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === 'accept' ? '处理中...' : '接受约拍'}
              </button>
            )}
            {booking.can_reject && (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="拒绝原因（选填）"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => doAction('reject', { reason: rejectReason })}
                  disabled={!!actionLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading === 'reject' ? '处理中...' : '拒绝'}
                </button>
              </div>
            )}
            {booking.can_cancel && (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="取消原因（选填）"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => doAction('cancel', { reason: cancelReason })}
                  disabled={!!actionLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {actionLoading === 'cancel' ? '处理中...' : '取消约拍'}
                </button>
              </div>
            )}
            {booking.status === 'accepted' && (
              <button
                onClick={() => doAction('complete')}
                disabled={!!actionLoading}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionLoading === 'complete' ? '处理中...' : '标记完成'}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

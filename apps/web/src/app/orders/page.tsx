'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';

interface OrderItem {
  id: number;
  order_no: string;
  amount: number;
  status: string;
  client: { id: number; username: string; avatar_url: string | null };
  photographer: { id: number; username: string; avatar_url: string | null };
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  shooting: '拍摄中',
  editing: '修图中',
  completed: '已完成',
  refunded: '已退款',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(status && { status }),
      });
      const response = await apiFetch(`/orders?${params}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data?.items ?? []);
        setTotalPages(data.data?.pagination?.total_pages ?? 1);
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的订单</h1>
          <p className="text-gray-600">查看与管理约拍订单</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {['', 'pending', 'paid', 'shooting', 'editing', 'completed', 'refunded'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                status === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {s ? (STATUS_LABEL[s] ?? s) : '全部'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">暂无订单</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((o) => (
                <Link key={o.id} href={`/orders/${o.id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition p-4 h-full">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-500 font-mono">{o.order_no}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        o.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        o.status === 'completed' ? 'bg-green-100 text-green-800' :
                        o.status === 'refunded' ? 'bg-gray-100 text-gray-600' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900">¥{Number(o.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {o.client?.username ?? '-'} → {o.photographer?.username ?? '-'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{o.created_at}</p>
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

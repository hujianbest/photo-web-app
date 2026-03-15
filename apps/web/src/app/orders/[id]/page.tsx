'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';
import { SafeImage } from '@/components/SafeImage';

interface OrderDetail {
  id: number;
  order_no: string;
  amount: number;
  status: string;
  payment_method: string | null;
  contract_url: string | null;
  shooting_date: string | null;
  completion_date: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  created_at: string;
  updated_at: string;
  client: { id: number; username: string; avatar_url: string | null };
  photographer: { id: number; username: string; avatar_url: string | null };
  booking: { id: number; type: string; date: string; location: string | null } | null;
  can_pay: boolean;
  can_complete: boolean;
  can_refund: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  shooting: '拍摄中',
  editing: '修图中',
  completed: '已完成',
  refunded: '已退款',
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/orders/${id}`);
      const data = await response.json();
      if (data.success) setOrder(data.data ?? null);
    } catch (error) {
      console.error('获取订单详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const doPay = async () => {
    setActionLoading('pay');
    try {
      const res = await apiFetch(`/orders/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: 'alipay' }),
      });
      if (res.ok) await fetchDetail();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const doComplete = async () => {
    setActionLoading('complete');
    try {
      const res = await apiFetch(`/orders/${id}/complete`, { method: 'POST' });
      if (res.ok) await fetchDetail();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const doRefund = async () => {
    setActionLoading('refund');
    try {
      const res = await apiFetch(`/orders/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: refundReason }),
      });
      if (res.ok) {
        setRefundReason('');
        await fetchDetail();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !order) {
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
            <p className="text-gray-600">订单不存在或无权查看</p>
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
        <Link href="/orders" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">
          ← 返回订单列表
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-mono">{order.order_no}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {STATUS_LABEL[order.status] ?? order.status}
              </p>
            </div>
            <p className="text-2xl font-bold text-indigo-600">¥{Number(order.amount).toFixed(2)}</p>
          </div>

          <div className="p-6 space-y-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-500">客户</dt><dd className="flex items-center gap-2">
                {order.client?.avatar_url ? (
                  <SafeImage src={order.client.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">
                    {order.client?.username?.[0]?.toUpperCase()}
                  </span>
                )}
                {order.client?.username ?? '-'}
              </dd></div>
              <div><dt className="text-gray-500">摄影师</dt><dd className="flex items-center gap-2">
                {order.photographer?.avatar_url ? (
                  <SafeImage src={order.photographer.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">
                    {order.photographer?.username?.[0]?.toUpperCase()}
                  </span>
                )}
                {order.photographer?.username ?? '-'}
              </dd></div>
              {order.booking && (
                <>
                  <div><dt className="text-gray-500">约拍日期</dt><dd>{order.booking.date}</dd></div>
                  {order.booking.location && (
                    <div><dt className="text-gray-500">地点</dt><dd>{order.booking.location}</dd></div>
                  )}
                </>
              )}
              <div><dt className="text-gray-500">创建时间</dt><dd>{order.created_at}</dd></div>
            </dl>
            {order.refund_reason && (
              <div className="text-sm"><span className="text-gray-500">退款原因：</span>{order.refund_reason}</div>
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t space-y-3">
            {order.can_pay && (
              <button
                onClick={doPay}
                disabled={!!actionLoading}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === 'pay' ? '处理中...' : '去支付'}
              </button>
            )}
            {order.can_complete && (
              <button
                onClick={doComplete}
                disabled={!!actionLoading}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionLoading === 'complete' ? '处理中...' : '标记完成'}
              </button>
            )}
            {order.can_refund && (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="退款原因（选填）"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={doRefund}
                  disabled={!!actionLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {actionLoading === 'refund' ? '处理中...' : '申请退款'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

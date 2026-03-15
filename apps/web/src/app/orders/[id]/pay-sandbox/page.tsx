'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function OrderPaySandboxPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [orderNo, setOrderNo] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.replace(`/auth/login?redirect=/orders/${id}/pay-sandbox`);
      return;
    }
    fetchPrepare();
  }, [id, router]);

  const fetchPrepare = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders/${id}/pay-prepare`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrderNo(data.data.order_no || '');
        setAmount(String(data.data.amount ?? ''));
      } else {
        setError(data.message || '获取支付信息失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPay = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders/${id}/pay-notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mock: true, transaction_id: `TXN${Date.now()}` }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/orders/${id}`);
        return;
      }
      setError(data.message || '支付确认失败');
    } catch {
      setError('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800 text-sm font-medium">沙箱环境 · 模拟支付</p>
          <p className="text-amber-700 text-xs mt-1">不会产生真实扣款</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-4">确认支付</h1>
          {loading ? (
            <p className="text-gray-500">加载中...</p>
          ) : (
            <>
              {orderNo && (
                <p className="text-gray-600 text-sm mb-1">订单号：<span className="font-mono">{orderNo}</span></p>
              )}
              {amount !== '' && (
                <p className="text-2xl font-bold text-indigo-600 mb-6">¥{amount}</p>
              )}
              {error && (
                <p className="text-red-600 text-sm mb-4">{error}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleConfirmPay}
                  disabled={submitting}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? '处理中...' : '模拟支付成功'}
                </button>
                <Link
                  href={`/orders/${id}`}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-center"
                >
                  返回订单
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

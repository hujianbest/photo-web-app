'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';

export default function ProfileEditPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [form, setForm] = useState({ username: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
    if (!raw) {
      router.replace('/auth/login');
      return;
    }
    try {
      const u = JSON.parse(raw);
      setUserId(u?.id ?? null);
      setForm({ username: u?.username ?? '', bio: u?.bio ?? '' });
    } catch {
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userId == null) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await apiFetch(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.data) {
          localStorage.setItem('user_data', JSON.stringify({ ...JSON.parse(localStorage.getItem('user_data') || '{}'), ...data.data }));
        }
        setMessage('保存成功');
      } else {
        const err = await res.json();
        setMessage(err?.message ?? '保存失败');
      }
    } catch {
      setMessage('网络错误');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-md mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (userId == null) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-md mx-auto px-4 sm:px-6 py-8">
        <Link href="/profile" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">
          ← 返回个人中心
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">编辑资料</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <p className={`text-sm ${message === '保存成功' ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

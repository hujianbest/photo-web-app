'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';

export default function NewArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    summary: '',
    category: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.content.trim()) {
      setError('请填写标题和正文');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          summary: form.summary.trim() || undefined,
          category: form.category.trim() || undefined,
          content: form.content.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const id = data?.data?.id;
        if (id) router.push(`/articles/${id}`);
        else router.push('/articles');
      } else {
        const err = await res.json();
        setError(err?.message ?? '发布失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/articles" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">
          ← 返回经验分享
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">写文章</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="文章标题"
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
              <input
                type="text"
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="简短摘要，用于列表展示"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="如：人像、风光"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">正文 *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={12}
                className="w-full border rounded px-3 py-2 font-mono text-sm"
                placeholder="支持纯文本，后续可接入富文本编辑器"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? '发布中...' : '发布'}
              </button>
              <Link
                href="/articles"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                取消
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

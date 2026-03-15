'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';
import { SafeImage } from '@/components/SafeImage';

interface ArticleItem {
  id: number;
  title: string;
  summary: string | null;
  cover_image: string | null;
  category: string | null;
  views: number;
  likes: number;
  published_at: string | null;
  user: { id: number; username: string; avatar_url: string | null };
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<string>('');
  const [sort, setSort] = useState('latest');

  useEffect(() => {
    fetchArticles();
  }, [page, category, sort]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort,
        ...(category && { category }),
      });
      const response = await apiFetch(`/articles?${params}`);
      const data = await response.json();
      if (data.success) {
        setArticles(data.data?.items ?? []);
        setTotalPages(data.data?.pagination?.total_pages ?? 1);
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">经验分享</h1>
          <p className="text-gray-600">摄影技巧与心得</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-gray-600 self-center">排序：</span>
          {['latest', 'popular'].map((s) => (
            <button
              key={s}
              onClick={() => { setSort(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                sort === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {s === 'latest' ? '最新' : '热门'}
            </button>
          ))}
          <input
            type="text"
            placeholder="分类筛选"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="ml-4 border rounded px-3 py-1.5 text-sm w-28"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">暂无文章</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <Link key={a.id} href={`/articles/${a.id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition h-full flex flex-col">
                    <div className="relative h-40 bg-gray-200">
                      {a.cover_image ? (
                        <SafeImage
                          src={a.cover_image}
                          alt={a.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📷</div>
                      )}
                      {a.category && (
                        <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded bg-black/50 text-white">
                          {a.category}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">{a.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{a.summary || '暂无摘要'}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{a.user?.username ?? '-'}</span>
                        <span>👁 {a.views ?? 0} · ❤ {a.likes ?? 0}</span>
                      </div>
                    </div>
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

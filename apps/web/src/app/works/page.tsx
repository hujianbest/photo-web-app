'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WorkCard } from '@/components/WorkCard';
import { apiFetch } from '@/lib/api';

interface Work {
  id: number;
  title: string;
  description: string;
  images: string[];
  user: {
    id: number;
    username: string;
    avatar_url: string;
  };
  likes: number;
  views: number;
  created_at: string;
}

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchWorks();
  }, [page, category]);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(category && { category }),
      });

      const response = await apiFetch(`/works?${params}`);
      const data = await response.json();

      if (data.success) {
        setWorks(data.data?.items ?? []);
        setTotalPages(data.data?.pagination?.total_pages ?? 1);
      }
    } catch (error) {
      console.error('获取作品列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: '全部' },
    { value: 'portrait', label: '人像' },
    { value: 'landscape', label: '风光' },
    { value: 'street', label: '街拍' },
    { value: 'product', label: '产品' },
    { value: 'wedding', label: '婚纱' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            作品展示
          </h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full transition ${
                  category === cat.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600">
              共 {works.length} 个作品
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">暂无作品</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {works.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  上一页
                </button>

                <span className="px-4 py-2 bg-white border rounded-lg">
                  第 {page} / {totalPages} 页
                </span>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
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
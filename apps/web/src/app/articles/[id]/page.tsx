'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';
import { SafeImage } from '@/components/SafeImage';

interface ArticleDetail {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  cover_image: string | null;
  category: string | null;
  tags: string[] | null;
  views: number;
  likes: number;
  comments_count: number;
  published_at: string | null;
  created_at: string;
  user: { id: number; username: string; avatar_url: string | null; bio: string | null };
}

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/articles/${id}`);
      const data = await response.json();
      if (data.success) setArticle(data.data ?? null);
    } catch (error) {
      console.error('获取文章详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !article) {
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
            <p className="text-gray-600">文章不存在</p>
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
        <Link href="/articles" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">
          ← 返回经验分享
        </Link>

        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {article.cover_image && (
            <div className="relative h-56 sm:h-72 bg-gray-200">
              <SafeImage
                src={article.cover_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
              <Link href={`/profile`} className="flex items-center gap-2 hover:text-indigo-600">
                {article.user?.avatar_url ? (
                  <SafeImage src={article.user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm">
                    {article.user?.username?.[0]?.toUpperCase()}
                  </span>
                )}
                {article.user?.username ?? '-'}
              </Link>
              {article.published_at && <span>{new Date(article.published_at).toLocaleDateString('zh-CN')}</span>}
              <span>👁 {article.views ?? 0}</span>
              <span>❤ {article.likes ?? 0}</span>
              {article.category && (
                <span className="px-2 py-0.5 rounded bg-gray-100">{article.category}</span>
              )}
            </div>
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {article.content}
            </div>
            {(article.tags?.length ?? 0) > 0 && (
              <div className="mt-6 pt-6 border-t flex flex-wrap gap-2">
                {article.tags!.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';
import { Hash, ArrowLeft, Image, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Tag {
  id: number;
  name: string;
  description: string | null;
  usage_count: number;
  works_count: number;
  articles_count: number;
}

interface Work {
  id: number;
  title: string;
  description: string;
  images: string[];
  user: { id: number; username: string; avatar_url: string | null };
}

interface Article {
  id: number;
  title: string;
  content: string;
  cover_image: string | null;
  user: { id: number; username: string; avatar_url: string | null };
  created_at: string;
}

export default function TagDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const tagId = parseInt(params.id);
  const [tag, setTag] = useState<Tag | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'works' | 'articles'>('works');

  useEffect(() => {
    fetchTag();
    fetchContent();
  }, [tagId]);

  const fetchTag = async () => {
    try {
      const response = await apiFetch(`/tags/${tagId}`);
      const data = await response.json();
      setTag(data);
    } catch (error) {
      console.error('获取标签详情失败:', error);
    }
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [worksRes, articlesRes] = await Promise.all([
        apiFetch(`/tags/${tagId}/works?limit=12`),
        apiFetch(`/tags/${tagId}/articles?limit=12`),
      ]);

      const worksData = await worksRes.json();
      const articlesData = await articlesRes.json();

      setWorks(worksData.data || []);
      setArticles(articlesData.data || []);
    } catch (error) {
      console.error('获取内容失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#6E6E73] hover:text-[#0071E3] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>

        {tag && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Hash className="h-8 w-8 text-[#0071E3]" />
              <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{tag.name}</h1>
            </div>
            {tag.description && (
              <p className="text-[#6E6E73] mb-4">{tag.description}</p>
            )}
            <div className="flex gap-6 text-sm text-[#6E6E73]">
              <span>使用次数: {tag.usage_count}</span>
              <span>作品: {tag.works_count}</span>
              <span>文章: {tag.articles_count}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('works')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
              activeTab === 'works'
                ? 'bg-[#0071E3] text-white'
                : 'bg-white text-[#1D1D1F] hover:bg-gray-100'
            }`}
          >
            <Image className="h-4 w-4" />
            作品
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
              activeTab === 'articles'
                ? 'bg-[#0071E3] text-white'
                : 'bg-white text-[#1D1D1F] hover:bg-gray-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            文章
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071E3]" />
            <p className="mt-4 text-[#6E6E73]">加载中...</p>
          </div>
        ) : activeTab === 'works' ? (
          works.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <p className="text-[#6E6E73]">暂无作品</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {works.map((work) => (
                <Link
                  key={work.id}
                  href={`/works/${work.id}`}
                  className="group"
                >
                  <div className="aspect-square overflow-hidden rounded-xl bg-[#F5F5F7] mb-2">
                    {work.images && work.images[0] ? (
                      <img
                        src={work.images[0]}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-12 w-12 text-[#D2D2D7]" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#1D1D1F] truncate">{work.title}</p>
                  <p className="text-xs text-[#6E6E73]">{work.user.username}</p>
                </Link>
              ))}
            </div>
          )
        ) : articles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-[#6E6E73]">暂无文章</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {article.cover_image ? (
                  <img
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-[#F5F5F7] flex items-center justify-center">
                    <FileText className="h-16 w-16 text-[#D2D2D7]" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-[#1D1D1F] mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-[#6E6E73] line-clamp-2 mb-3">
                    {article.content?.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#6E6E73]">
                    <span>{article.user.username}</span>
                    <span>·</span>
                    <span>{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

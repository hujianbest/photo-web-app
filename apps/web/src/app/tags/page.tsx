'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';
import { Hash, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Tag {
  id: number;
  name: string;
  description: string | null;
  usage_count: number;
  works_count: number;
  articles_count: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [hotTags, setHotTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hot' | 'all'>('hot');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchHotTags();
    fetchAllTags();
  }, []);

  const fetchHotTags = async () => {
    try {
      const response = await apiFetch('/tags/hot?limit=30');
      const data = await response.json();
      if (Array.isArray(data)) {
        setHotTags(data);
      }
    } catch (error) {
      console.error('获取热门标签失败:', error);
    }
  };

  const fetchAllTags = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/tags?page=${page}&limit=50&sort=name`);
      const data = await response.json();
      if (Array.isArray(data.data)) {
        setTags(data.data);
      }
    } catch (error) {
      console.error('获取标签列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight mb-2">话题标签</h1>
          <p className="text-[#6E6E73]">探索热门话题，发现感兴趣的内容</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('hot')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === 'hot'
                ? 'bg-[#0071E3] text-white'
                : 'bg-white text-[#1D1D1F] hover:bg-gray-100'
            }`}
          >
            热门标签
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === 'all'
                ? 'bg-[#0071E3] text-white'
                : 'bg-white text-[#1D1D1F] hover:bg-gray-100'
            }`}
          >
            全部标签
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071E3]" />
            <p className="mt-4 text-[#6E6E73]">加载中...</p>
          </div>
        ) : activeTab === 'hot' ? (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-[#0071E3]" />
              <h2 className="text-lg font-semibold text-[#1D1D1F]">热门标签</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {hotTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5F5F7] hover:bg-[#E8E8ED] rounded-full transition-colors group"
                >
                  <Hash className="h-4 w-4 text-[#6E6E73] group-hover:text-[#0071E3]" />
                  <span className="font-medium text-[#1D1D1F]">{tag.name}</span>
                  <span className="text-xs text-[#6E6E73]">{tag.usage_count}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="h-5 w-5 text-[#0071E3]" />
              <h2 className="text-lg font-semibold text-[#1D1D1F]">全部标签</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5F5F7] hover:bg-[#E8E8ED] rounded-full transition-colors group"
                >
                  <Hash className="h-4 w-4 text-[#6E6E73] group-hover:text-[#0071E3]" />
                  <span className="font-medium text-[#1D1D1F]">{tag.name}</span>
                  <span className="text-xs text-[#6E6E73]">{tag.usage_count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

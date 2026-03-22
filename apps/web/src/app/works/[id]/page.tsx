'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';
import { shouldUnoptimizeImageSrc } from '@/lib/image-utils';
import { ArrowLeft, Eye, Heart, MapPin } from 'lucide-react';

interface WorkDetail {
  id: number;
  title: string;
  description: string | null;
  images: string[];
  category: string | null;
  location: string | null;
  views: number;
  likes: number;
  comments_count: number;
  user: { id: number; username: string; avatar_url: string | null };
}

export default function WorkDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [work, setWork] = useState<WorkDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(`/works/${id}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success && data.data) {
          setWork(data.data);
        } else {
          setError(data.message || '加载失败');
        }
      } catch {
        if (!cancelled) setError('作品不存在或网络错误');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/works"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          返回作品列表
        </Link>

        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-neutral-500 py-16">{error}</p>
        )}

        {!loading && work && (
          <article>
            <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-4">
              {work.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-8">
              <span className="font-medium text-neutral-800">@{work.user.username}</span>
              {work.category && (
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                  {work.category}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {work.views}
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {work.likes}
              </span>
              <span>评论 {work.comments_count}</span>
              {work.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {work.location}
                </span>
              )}
            </div>

            <div className="space-y-6">
              {work.images?.map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden bg-neutral-100">
                  <Image
                    src={src || '/placeholder.png'}
                    alt={`${work.title} ${i + 1}`}
                    width={1200}
                    height={800}
                    unoptimized={shouldUnoptimizeImageSrc(src)}
                    className="w-full h-auto object-contain"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            {work.description && (
              <div className="mt-10">
                <p className="text-neutral-600 whitespace-pre-wrap leading-relaxed">{work.description}</p>
              </div>
            )}
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}

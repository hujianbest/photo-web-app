'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { shouldUnoptimizeImageSrc } from '@/lib/image-utils';

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'portrait', label: '人像' },
  { key: 'landscape', label: '风光' },
  { key: 'street', label: '街拍' },
  { key: 'architecture', label: '建筑' },
];

interface Work {
  id: number;
  title: string;
  images: string[];
  likes: number;
  comments_count: number;
  user: { id: number; username: string };
}

export function WorksMasonry() {
  const [works, setWorks] = useState<Work[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = category === 'all' ? `${API_BASE}/api/v1/works` : `${API_BASE}/api/v1/works?category=${category}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) setWorks(data.data.items || []);
      })
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Category Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              category === cat.key ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {works.map(work => (
          <Link key={work.id} href={`/works/${work.id}`} className="block break-inside-avoid group">
            <div className="relative rounded-xl overflow-hidden bg-neutral-100">
              <Image
                src={work.images?.[0] || '/placeholder.png'}
                alt={work.title}
                width={400}
                height={300}
                unoptimized={shouldUnoptimizeImageSrc(work.images?.[0] || '')}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="font-medium truncate">{work.title}</p>
                  <div className="flex items-center gap-3 text-sm mt-1">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" /> {work.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" /> {work.comments_count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {works.length === 0 && (
        <div className="text-center py-20 text-neutral-500">
          暂无作品
        </div>
      )}
    </div>
  );
}

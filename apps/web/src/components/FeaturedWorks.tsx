'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ArrowRight } from 'lucide-react';

const WORKS = [
  { id: 1, title: '春日樱花', author: '摄影师A', likes: 2300, image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400' },
  { id: 2, title: '城市夜景', author: '摄影师B', likes: 1800, image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400' },
  { id: 3, title: '人像写真', author: '摄影师C', likes: 1500, image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400' },
  { id: 4, title: '风光大片', author: '摄影师D', likes: 1200, image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400' },
];

export function FeaturedWorks() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-neutral-900">🔥 热门作品</h2>
          <Link href="/works" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
            查看更多 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {WORKS.map((work) => (
            <Link key={work.id} href={`/works/${work.id}`} className="group">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100">
                <Image src={work.image} alt={work.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="font-medium truncate">{work.title}</p>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Heart className="w-4 h-4" /> {(work.likes / 1000).toFixed(1)}k
                      <span className="text-white/70">@{work.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

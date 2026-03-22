'use client';

import Link from 'next/link';
import Image from 'next/image';
import { shouldUnoptimizeImageSrc } from '@/lib/image-utils';
import { MapPin, ArrowRight } from 'lucide-react';

const SPOTS = [
  { id: 1, name: '故宫角楼', location: '北京', checkins: 2356, image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600' },
  { id: 2, name: '颐和园日落', location: '北京', checkins: 1820, image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600' },
];

export function FeaturedSpots() {
  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-neutral-900">📍 热门打卡点</h2>
          <Link href="/spots" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
            查看更多 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {SPOTS.map((spot) => (
            <Link key={spot.id} href="/spots" className="group flex gap-4 p-4 bg-white rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
              <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                <Image
                  src={spot.image}
                  alt={spot.name}
                  fill
                  unoptimized={shouldUnoptimizeImageSrc(spot.image)}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">{spot.name}</h3>
                <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" /> {spot.location}
                </p>
                <p className="text-sm text-neutral-500 mt-2">📸 {spot.checkins.toLocaleString()} 打卡</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

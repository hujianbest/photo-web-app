'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { shouldUnoptimizeImageSrc } from '@/lib/image-utils';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FEATURED = [
  { id: 1, title: '春日故宫', author: '摄影师小王', likes: 2340, image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920' },
  { id: 2, title: '城市夜景', author: '夜景猎人', likes: 1890, image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920' },
  { id: 3, title: '人像写真', author: '人像大师', likes: 1560, image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1920' },
  { id: 4, title: '风光大片', author: '风光猎人', likes: 1230, image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920' },
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {FEATURED.map((work) => (
            <div key={work.id} className="flex-[0_0_100%] relative">
              <Image
                src={work.image}
                alt={work.title}
                fill
                unoptimized={shouldUnoptimizeImageSrc(work.image)}
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-center mb-4 drop-shadow-lg">
          发现灵感，记录美好
        </h1>
        <p className="text-lg sm:text-xl text-white/90 mb-8 text-center max-w-xl">
          专为业余摄影师打造的一站式服务平台
        </p>
        <div className="flex gap-4">
          <Link href="/works" className="px-8 py-3 bg-white text-neutral-900 rounded-full font-medium hover:bg-neutral-100 transition-colors">
            开始探索
          </Link>
          <Link href="/auth/register" className="px-8 py-3 border-2 border-white text-white rounded-full font-medium hover:bg-white/10 transition-colors">
            发布作品
          </Link>
        </div>

        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-center">
          <p className="text-lg font-medium">{FEATURED[selectedIndex]?.title}</p>
          <p className="text-sm text-white/80">by {FEATURED[selectedIndex]?.author} · ❤️ {FEATURED[selectedIndex]?.likes.toLocaleString()}</p>
        </div>
      </div>

      <button onClick={() => emblaApi?.scrollPrev()} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button onClick={() => emblaApi?.scrollNext()} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
        {FEATURED.map((_, i) => (
          <button key={i} onClick={() => emblaApi?.scrollTo(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === selectedIndex ? 'bg-white' : 'bg-white/40'}`} />
        ))}
      </div>
    </section>
  );
}

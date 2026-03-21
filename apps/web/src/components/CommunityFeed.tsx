'use client';

import Link from 'next/link';
import { Hash, Image as ImageIcon, MapPin, Heart } from 'lucide-react';

const TOPICS = ['#春日人像', '#夜景摄影', '#手机摄影', '#新手入门', '#后期技巧'];
const FEEDS = [
  { user: '用户A', action: '发布了新作品', target: '「春日樱花」', icon: ImageIcon },
  { user: '用户B', action: '在', target: '「故宫角楼」打卡', icon: MapPin },
  { user: '用户C', action: '的文章获得了', target: '100个赞', icon: Heart },
];

export function CommunityFeed() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-8">💬 社区动态</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium text-neutral-700 mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5" /> 热门话题
            </h3>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <Link key={topic} href={`/search?q=${topic.slice(1)}`} className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full text-sm text-neutral-700 transition-colors">
                  {topic}
                </Link>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-neutral-700 mb-4">📝 最新动态</h3>
            <div className="space-y-3">
              {FEEDS.map((feed, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-neutral-600">
                  <feed.icon className="w-4 h-4 text-neutral-400" />
                  <span><strong>{feed.user}</strong> {feed.action} {feed.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { Camera, Users, MapPin, Handshake } from 'lucide-react';

const STATS = [
  { icon: Camera, value: '12,580', label: '作品' },
  { icon: Users, value: '3,420', label: '摄影师' },
  { icon: MapPin, value: '8,960', label: '打卡点' },
  { icon: Handshake, value: '156', label: '今日约拍' },
];

export function StatsBar() {
  return (
    <section className="py-12 bg-neutral-50 border-y border-neutral-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <div className="text-3xl font-semibold text-neutral-900">{value}</div>
              <div className="text-sm text-neutral-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

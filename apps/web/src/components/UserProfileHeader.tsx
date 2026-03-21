'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

interface UserProfileHeaderProps {
  user: {
    username: string;
    avatar_url: string | null;
    bio?: string;
    location?: string;
    level?: string;
    stats: { works: number; checkins: number; bookings: number; likes: number };
  };
  isOwn: boolean;
}

export function UserProfileHeader({ user, isOwn }: UserProfileHeaderProps) {
  const [activeTab, setActiveTab] = useState('works');
  
  const tabs = [
    { key: 'works', label: '作品', count: user.stats.works },
    { key: 'checkins', label: '打卡', count: user.stats.checkins },
    { key: 'bookings', label: '约拍', count: user.stats.bookings },
    { key: 'likes', label: '喜欢', count: 0 },
  ];

  return (
    <div>
      {/* Cover & Avatar */}
      <div className="relative h-48 bg-gradient-to-r from-blue-400 to-blue-600 rounded-b-3xl">
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-neutral-200 overflow-hidden flex items-center justify-center text-4xl text-neutral-400">
            {user.avatar_url ? (
              <Image src={user.avatar_url} alt="" width={128} height={128} className="object-cover" />
            ) : (
              user.username[0]
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="pt-20 px-8 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
              {user.username}
              {user.level && (
                <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  Lv.{user.level}
                </span>
              )}
            </h1>
            {user.location && (
              <p className="text-neutral-500 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" /> {user.location}
              </p>
            )}
            {user.bio && <p className="text-neutral-600 mt-2">{user.bio}</p>}
          </div>
          {isOwn && (
            <button className="px-4 py-2 border border-neutral-300 rounded-full text-sm font-medium hover:border-neutral-400 transition-colors">
              编辑资料
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 py-4 border-y border-neutral-200">
          <div className="text-center">
            <div className="text-2xl font-semibold text-neutral-900">{user.stats.works}</div>
            <div className="text-sm text-neutral-500">作品</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-neutral-900">{user.stats.checkins}</div>
            <div className="text-sm text-neutral-500">打卡</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-neutral-900">{user.stats.bookings}</div>
            <div className="text-sm text-neutral-500">约拍</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-neutral-900">{user.stats.likes.toLocaleString()}</div>
            <div className="text-sm text-neutral-500">获赞</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600 border-blue-600'
                  : 'text-neutral-500 border-transparent hover:text-neutral-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

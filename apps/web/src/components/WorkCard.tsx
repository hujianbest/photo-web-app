'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface WorkCardProps {
  work: {
    id: number;
    title: string;
    description: string;
    images?: string[] | null;
    user?: {
      id: number;
      username?: string;
      avatar_url?: string | null;
    } | null;
    likes?: number;
    views?: number;
    created_at: string;
  };
}

export function WorkCard({ work }: WorkCardProps) {
  const [coverError, setCoverError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const coverImage = work.images?.[0] || '/placeholder.jpg';
  const user = work.user;

  return (
    <Link href={`/works/${work.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
        <div className="relative aspect-square bg-gray-200">
          {coverError ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
              暂无图片
            </div>
          ) : (
            <Image
              src={coverImage}
              alt={work.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setCoverError(true)}
            />
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
            {work.title}
          </h3>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {work.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {user?.avatar_url && !avatarError ? (
                <Image
                  src={user.avatar_url}
                  alt={user.username ?? ''}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs shrink-0">
                  {user?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <span className="text-sm text-gray-700">
                {user?.username ?? '未知用户'}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>❤️ {work.likes ?? 0}</span>
              <span>👁️ {work.views ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
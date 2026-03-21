'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Palette, Eye, MessageCircle, Clock } from 'lucide-react';

interface BookingCardProps {
  booking: {
    id: number;
    title: string;
    description: string;
    type: string;
    style?: string;
    location?: string;
    budget?: number;
    views: number;
    comments: number;
    created_at: string;
    user: { id: number; username: string; avatar_url: string | null; rating?: number };
  };
}

export function BookingCard({ booking }: BookingCardProps) {
  const timeAgo = (date: string) => {
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
    return hours < 24 ? `${hours}小时前` : `${Math.floor(hours / 24)}天前`;
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-neutral-400 text-lg">
            {booking.user.avatar_url ? (
              <Image src={booking.user.avatar_url} alt="" width={48} height={48} className="object-cover" />
            ) : (
              booking.user.username[0]
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-900">{booking.user.username}</span>
              {booking.user.rating && (
                <span className="text-sm text-yellow-600">⭐ {booking.user.rating}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {booking.location || '未设置'}
              </span>
              {booking.budget && (
                <span className="text-blue-600 font-medium">¥{booking.budget}/小时</span>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            booking.type === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {booking.type === 'paid' ? '付费' : '互勉'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 mb-2">{booking.title}</h3>
        <p className="text-sm text-neutral-600 line-clamp-2">{booking.description}</p>
        {booking.style && (
          <div className="flex gap-4 mt-4 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <Palette className="w-4 h-4" /> {booking.style}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-neutral-50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" /> {booking.views}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" /> {booking.comments}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {timeAgo(booking.created_at)}
          </span>
        </div>
        <Link
          href={`/bookings/${booking.id}`}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
        >
          查看详情
        </Link>
      </div>
    </div>
  );
}

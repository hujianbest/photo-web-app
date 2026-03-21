'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, Camera } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface Spot {
  id: number;
  name: string;
  location: string;
  rating: string;
  checkins: number;
}

export function SpotsMapView() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/v1/spots`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSpots(data.data.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          列表视图
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          地图视图
        </button>
      </div>

      <div className="flex gap-6">
        {/* Map Area */}
        <div className={`${viewMode === 'map' ? 'w-1/2' : 'hidden'} bg-neutral-100 rounded-xl h-[600px] flex items-center justify-center`}>
          <div className="text-center text-neutral-500">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p>地图功能需要配置高德地图 API Key</p>
            <p className="text-sm mt-1">当前显示占位视图</p>
          </div>
        </div>

        {/* List Area */}
        <div className={`${viewMode === 'map' ? 'w-1/2' : 'w-full'} space-y-4`}>
          {spots.map(spot => (
            <Link
              key={spot.id}
              href={`/spots/${spot.id}`}
              className="block p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-neutral-900">{spot.name}</h3>
                  <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" /> {spot.location}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {spot.rating}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-neutral-500 mt-1">
                    <Camera className="w-4 h-4" />
                    {spot.checkins} 打卡
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {spots.length === 0 && (
        <div className="text-center py-20 text-neutral-500">
          暂无打卡点
        </div>
      )}
    </div>
  );
}

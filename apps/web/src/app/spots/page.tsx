'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SafeImage } from '@/components/SafeImage';
import { SpotMap } from '@/components/SpotMap';
import { apiFetch } from '@/lib/api';

interface Spot {
  id: number;
  name: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number } | null;
  images: string[];
  checkins: number;
  views: number;
  rating: number;
  created_at: string;
}

export default function SpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSpots();
  }, [page]);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(
        `/spots?page=${page}&limit=12&sort=popular`
      );
      const data = await response.json();

      if (data.success) {
        setSpots(data.data?.items ?? []);
      }
    } catch (error) {
      console.error('获取打卡点列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">打卡点</h1>
          <p className="text-gray-600">发现最佳拍摄地点，分享你的打卡记录</p>
        </div>

        {!loading && spots.length > 0 && (
          <div className="mb-8">
            <SpotMap spots={spots} height="280px" />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : spots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">暂无打卡点</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spots.map((spot) => (
              <div
                key={spot.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                  {spot.images?.[0] ? (
                    <SafeImage
                      src={spot.images[0]}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <SafeImage
                      src=""
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm font-semibold">
                    ⭐ {(spot.rating ?? 0).toFixed(1)}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{spot.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{spot.location}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {spot.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>📍 {spot.checkins ?? 0} 次打卡</span>
                    <span>👁️ {spot.views ?? 0} 次浏览</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

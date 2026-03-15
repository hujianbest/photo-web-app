'use client';

import { useEffect, useRef, useState } from 'react';

export interface SpotMapItem {
  id: number;
  name: string;
  location: string;
  coordinates?: { lat: number; lng: number } | null;
}

interface SpotMapProps {
  spots: SpotMapItem[];
  className?: string;
  height?: string;
}

/** 打卡点地图：无 key 时显示占位与 OSM 链接；配置 NEXT_PUBLIC_MAP_KEY 后可接入高德/腾讯 */
export function SpotMap({ spots, className = '', height = '320px' }: SpotMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const key = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_MAP_KEY : '';

  const withCoords = spots.filter((s) => s.coordinates && typeof s.coordinates.lat === 'number' && typeof s.coordinates.lng === 'number');
  const first = withCoords[0];

  useEffect(() => {
    if (!key || !containerRef.current || withCoords.length === 0) {
      setMapReady(false);
      return;
    }
    // 高德/腾讯地图需在此加载 SDK 并初始化，此处仅占位
    setMapReady(false);
  }, [key, withCoords.length]);

  if (withCoords.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 ${className}`} style={{ height }}>
        <span className="text-sm">暂无打卡点坐标，或后端未返回 coordinates</span>
      </div>
    );
  }

  const osmUrl = first
    ? `https://www.openstreetmap.org/?mlat=${first.coordinates!.lat}&mlon=${first.coordinates!.lng}&zoom=14`
    : 'https://www.openstreetmap.org';

  return (
    <div className={className}>
      {!key ? (
        <div
          className="bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-gray-600 p-4"
          style={{ height }}
        >
          <p className="text-sm mb-2">配置 NEXT_PUBLIC_MAP_KEY 可在此显示交互地图（高德/腾讯）</p>
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline text-sm"
          >
            在 OpenStreetMap 上查看
          </a>
        </div>
      ) : (
        <div ref={containerRef} className="rounded-lg overflow-hidden bg-gray-200" style={{ height }}>
          {!mapReady && (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              地图加载中…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

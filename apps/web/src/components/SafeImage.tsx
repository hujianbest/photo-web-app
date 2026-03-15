'use client';

import { useState, useEffect } from 'react';

const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14' font-family='sans-serif'%3E暂无图片%3C/text%3E%3C/svg%3E";

export interface SafeImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** 加载失败时使用的占位图 URL，默认为内联 SVG */
  fallbackSrc?: string;
}

/**
 * 带 onError 占位图的图片组件，图片加载失败时显示占位图，避免裂图。
 */
export function SafeImage({
  src,
  alt,
  fallbackSrc = PLACEHOLDER_SVG,
  onError,
  ...rest
}: SafeImageProps) {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setUseFallback(false);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setUseFallback(true);
    onError?.(e);
  };

  const displaySrc = useFallback || !src ? fallbackSrc : src;

  return (
    <img
      {...rest}
      src={displaySrc}
      alt={alt ?? ''}
      onError={handleError}
    />
  );
}

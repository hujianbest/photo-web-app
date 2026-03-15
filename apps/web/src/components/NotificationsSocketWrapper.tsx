'use client';

import { useState, useEffect } from 'react';
import { NotificationsProvider } from '@/context/NotificationsContext';

/** 在客户端读取 access_token 并包裹 NotificationsProvider */
export function NotificationsSocketWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  }, []);

  return (
    <NotificationsProvider token={token}>
      {children}
    </NotificationsProvider>
  );
}

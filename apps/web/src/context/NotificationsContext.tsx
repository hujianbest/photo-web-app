'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useNotificationsSocket } from '@/hooks/useNotificationsSocket';
import { apiJson } from '@/lib/api';

type NotificationsContextValue = {
  unreadCount: number;
  setUnreadCount: (n: number | ((prev: number) => number)) => void;
  refetchUnread: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  return ctx;
}

export function NotificationsProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string | null;
}) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiJson<{ data?: { unread_count?: number } }>(
        '/notifications/unread-count'
      );
      const n = res?.data?.unread_count ?? 0;
      setUnreadCount(n);
    } catch {
      // 未登录或接口失败时忽略
    }
  }, [token]);

  useEffect(() => {
    if (token) refetchUnread();
    else setUnreadCount(0);
  }, [token, refetchUnread]);

  useNotificationsSocket(token, () => {
    setUnreadCount((c) => c + 1);
  });

  const value: NotificationsContextValue = {
    unreadCount,
    setUnreadCount,
    refetchUnread,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

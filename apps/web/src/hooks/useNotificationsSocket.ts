'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
    : '';

const WS_PATH = '/ws';
const WS_NAMESPACE = '/notifications';

export type NotificationPayload = {
  id: number;
  type: string;
  title: string;
  content?: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
};

/** 当已登录时建立 WebSocket 连接，收到新通知时回调 */
export function useNotificationsSocket(
  token: string | null,
  onNotification: (payload: NotificationPayload) => void
) {
  const socketRef = useRef<Socket | null>(null);
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  useEffect(() => {
    if (!token || typeof window === 'undefined') return;

    const base = API_BASE.replace(/\/$/, '');
    const socket = io(`${base}${WS_NAMESPACE}`, {
      path: WS_PATH,
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('notification', (payload: NotificationPayload) => {
      onNotificationRef.current(payload);
    });

    socket.on('error', (err: { message?: string }) => {
      console.warn('[WS]', err?.message || err);
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  return { disconnect };
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCircle2, 
  MessageCircle, 
  Heart, 
  UserPlus, 
  Calendar,
  Camera,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';

interface Notification {
  id: number;
  type: 'comment' | 'like' | 'follow' | 'booking' | 'order' | 'system';
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

const NOTIFICATION_ICONS = {
  comment: MessageCircle,
  like: Heart,
  follow: UserPlus,
  booking: Calendar,
  order: DollarSign,
  system: Bell,
};

const NOTIFICATION_COLORS = {
  comment: 'text-blue-600 bg-blue-50',
  like: 'text-red-600 bg-red-50',
  follow: 'text-green-600 bg-green-50',
  booking: 'text-purple-600 bg-purple-50',
  order: 'text-amber-600 bg-amber-50',
  system: 'text-neutral-600 bg-neutral-100',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(filter === 'unread' && { is_read: 'false' }),
      });
      const response = await apiFetch(`/notifications?${params}`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data?.items ?? []);
      }
    } catch (error) {
      console.error('获取通知失败:', error);
      // 如果接口不存在，显示模拟数据
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('全部标记已读失败:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
              通知中心
            </h1>
          </div>
          <p className="text-neutral-500 text-base">
            查看您的消息通知和互动动态
          </p>
        </div>

        {/* 筛选和操作栏 */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              未读
            </button>
          </div>
          
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              全部标记已读
            </button>
          )}
        </div>

        {/* 通知列表 */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="mt-4 text-neutral-500">加载中...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
            <Bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg">
              {filter === 'unread' ? '暂无未读通知' : '暂无通知'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
              const colorClass = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.system;
              
              const content = (
                <div
                  className={`bg-white rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    notification.is_read
                      ? 'border-neutral-200'
                      : 'border-blue-200 bg-blue-50/30'
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="p-5 flex gap-4">
                    {/* 图标 */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-neutral-900 mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-neutral-600 leading-relaxed">
                            {notification.content}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-2">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>

                    {/* 箭头 */}
                    {notification.link && (
                      <ChevronRight className="flex-shrink-0 w-5 h-5 text-neutral-400 mt-1" />
                    )}
                  </div>
                </div>
              );

              return notification.link ? (
                <Link key={notification.id} href={notification.link}>
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

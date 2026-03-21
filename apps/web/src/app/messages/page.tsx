'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { apiFetch } from '@/lib/api';
import { MessageSquare, User } from 'lucide-react';
import Link from 'next/link';

interface Conversation {
  id: number;
  user: {
    id: number;
    username: string;
    avatar_url: string | null;
  };
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/messages/conversations');
      const data = await response.json();
      if (data.success) {
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error('获取对话列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const truncateMessage = (message: string, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight mb-2">私信</h1>
          <p className="text-[#6E6E73]">查看和管理您的私信对话</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071E3]" />
            <p className="mt-4 text-[#6E6E73]">加载中...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-[#D2D2D7]">
            <MessageSquare className="mx-auto h-16 w-16 text-[#6E6E73] mb-4" />
            <p className="text-[#1D1D1F] font-medium mb-2">暂无私信对话</p>
            <p className="text-sm text-[#6E6E73]">开始与其他摄影师交流吧</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.user.id}`}
                className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-[#D2D2D7]"
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="relative">
                    {conversation.user.avatar_url ? (
                      <img
                        src={conversation.user.avatar_url}
                        alt={conversation.user.username}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-[#F5F5F7] flex items-center justify-center">
                        <User className="h-7 w-7 text-[#6E6E73]" />
                      </div>
                    )}
                    {conversation.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#0071E3] text-white text-xs rounded-full flex items-center justify-center">
                        {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-[#1D1D1F] truncate">
                        {conversation.user.username}
                      </h3>
                      <span className="text-xs text-[#6E6E73] whitespace-nowrap ml-2">
                        {formatTime(conversation.last_message_at)}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate ${
                        conversation.unread_count > 0 ? 'font-medium text-[#1D1D1F]' : 'text-[#6E6E73]'
                      }`}
                    >
                      {truncateMessage(conversation.last_message)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Send, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface OtherUser {
  id: number;
  username: string;
  avatar_url: string | null;
}

export default function ChatPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const otherUserId = parseInt(params.userId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/messages/conversation/${otherUserId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data || []);
        if (data.data && data.data.length > 0) {
          // Try to get other user info from message
          const firstMsg = data.data[0];
          setOtherUser({
            id: otherUserId,
            username: '', // Will be fetched separately
            avatar_url: null,
          });
        }
      }
    } catch (error) {
      console.error('获取消息失败:', error);
    } finally {
      setLoading(false);
    }
  }, [otherUserId]);

  useEffect(() => {
    fetchMessages();

    // Setup WebSocket connection
    const token = localStorage.getItem('access_token');
    if (token) {
      const newSocket = io('http://localhost:8000', {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Connected to messages socket');
      });

      newSocket.on('new-message', (message) => {
        if (message.sender_id === otherUserId || message.receiver_id === otherUserId) {
          setMessages((prev) => [...prev, message]);
          markMessagesAsRead([message.id]);
        }
      });

      newSocket.on('conversation-updated', (data) => {
        console.log('Conversation updated:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markMessagesAsRead = async (messageIds: number[]) => {
    try {
      await apiFetch('/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_ids: messageIds }),
      });
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    try {
      setSending(true);
      const tempMessage: Message = {
        id: Date.now(),
        sender_id: 0, // Current user
        receiver_id: otherUserId,
        content: inputMessage,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMessage]);
      setInputMessage('');

      const response = await apiFetch('/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: otherUserId,
          content: inputMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? data.data : m)),
        );

        // Emit via WebSocket
        if (socket) {
          socket.emit('send-message', {
            receiver_id: otherUserId,
            content: inputMessage,
          });
        }
      } else {
        // Remove temp message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
        setInputMessage(inputMessage);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages((prev) => prev.filter((m) => m.id !== Date.now()));
      setInputMessage(inputMessage);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-[#D2D2D7] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-[#1D1D1F]" />
          </button>
          <div className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
            <User className="h-5 w-5 text-[#6E6E73]" />
          </div>
          <h2 className="font-semibold text-[#1D1D1F]">用户 {otherUserId}</h2>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071E3]" />
              <p className="mt-4 text-[#6E6E73]">加载中...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6E6E73]">暂无消息，开始聊天吧</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === otherUserId ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    message.sender_id === otherUserId
                      ? 'bg-white text-[#1D1D1F] rounded-tl-sm'
                      : 'bg-[#0071E3] text-white rounded-tr-sm'
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_id === otherUserId ? 'text-[#6E6E73]' : 'text-blue-200'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-[#D2D2D7] p-4">
          <div className="flex items-end gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              rows={1}
              className="flex-1 resize-none border border-[#D2D2D7] rounded-full px-4 py-2 focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-blue-100 transition-all max-h-32"
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || sending}
              className="h-11 w-11 bg-[#0071E3] hover:bg-[#0077ED] disabled:bg-[#D2D2D7] disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

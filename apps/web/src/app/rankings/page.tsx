'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Crown } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { API_BASE } from '@/lib/api';

type Period = 'day' | 'week' | 'month';
type RankingType = 'works' | 'photographers' | 'newcomers';

export default function RankingsPage() {
  const [period, setPeriod] = useState<Period>('week');
  const [type, setType] = useState<RankingType>('works');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, [period, type]);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const endpoint = type === 'newcomers'
        ? `${API_BASE}/api/v1/ranking/newcomers`
        : `${API_BASE}/api/v1/ranking/${type}?period=${period}`;
      const res = await fetch(endpoint);
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (e) {
      console.error('Failed to fetch ranking:', e);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <span className="text-lg font-bold text-neutral-400">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-8 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          排行榜
        </h1>

        <div className="flex gap-2 mb-6">
          {[{ key: 'works', label: '作品榜' }, { key: 'photographers', label: '摄影师榜' }, { key: 'newcomers', label: '新人榜' }].map(tab => (
            <button key={tab.key} onClick={() => setType(tab.key as RankingType)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${type === tab.key ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {type !== 'newcomers' && (
          <div className="flex gap-2 mb-8">
            {[{ key: 'day', label: '日榜' }, { key: 'week', label: '周榜' }, { key: 'month', label: '月榜' }].map(tab => (
              <button key={tab.key} onClick={() => setPeriod(tab.key as Period)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${period === tab.key ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 flex items-center justify-center">{getRankIcon(item.rank)}</div>
                {type === 'works' ? (
                  <Link href={`/works/${item.id}`} className="flex-1 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{item.title}</p>
                      <p className="text-sm text-neutral-500">by {item.username}</p>
                    </div>
                    <p className="font-semibold text-blue-600">{item.score} ❤️</p>
                  </Link>
                ) : (
                  <Link href={`/profile/${item.id}`} className="flex-1 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center">
                      {item.avatar_url ? <Image src={item.avatar_url} alt="" width={40} height={40} className="object-cover" /> : item.username?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{item.username}</p>
                      <p className="text-sm text-neutral-500">{item.works_count || 0} 作品</p>
                    </div>
                    <p className="font-semibold text-blue-600">{item.score} ❤️</p>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

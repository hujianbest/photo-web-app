import Link from 'next/link';
import {
  MapPin,
  Handshake,
  Camera,
  BookOpen,
  Target,
  Wallet,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const FEATURES = [
  { href: '/spots', icon: MapPin, title: '拍照打卡点', description: '发现和分享最佳拍摄地点，记录你的拍摄足迹' },
  { href: '/bookings', icon: Handshake, title: '约拍平台', description: '摄影师与模特的约拍平台，支持互勉和收费模式' },
  { href: '/works', icon: Camera, title: '作品展示', description: '展示你的摄影作品，获得曝光和评价' },
  { href: '/articles', icon: BookOpen, title: '经验分享', description: '分享拍摄参数、摆拍姿势、器材评测等经验' },
  { href: '/profile', icon: Target, title: '积分等级', description: '完善的用户成长体系，通过互动获得积分和等级' },
  { href: '/orders', icon: Wallet, title: '订单管理', description: '完整的订单流程，支持图片交付和AI修图' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero — 大标题、留白、单栏 */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight leading-tight">
            专为业余摄影师打造的
            <br />
            <span className="text-blue-600">一站式服务平台</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-xl mx-auto leading-relaxed">
            发现拍摄地点，分享作品，约拍合作，记录成长
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/spots"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
            >
              开始探索
            </Link>
            <Link
              href="/works"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-full border border-neutral-300 text-neutral-700 text-sm font-medium hover:border-neutral-400 hover:bg-neutral-50 transition-colors duration-200 cursor-pointer"
            >
              了解更多
            </Link>
          </div>
        </section>

        {/* 功能区块 — 极简卡片、大量留白 */}
        <section className="border-t border-neutral-200 bg-neutral-50/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight text-center mb-14">
              功能
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {FEATURES.map(({ href, icon: Icon, title, description }) => (
                <Link
                  key={href}
                  href={href}
                  className="block p-8 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 transition-colors duration-200 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center mb-5 group-hover:text-blue-600 transition-colors duration-200">
                    <Icon className="w-5 h-5" aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 tracking-tight mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

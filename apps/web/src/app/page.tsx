import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            专为业余摄影师打造的
            <span className="text-indigo-600">一站式服务平台</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            发现拍摄地点，分享作品，约拍合作，记录成长
          </p>
          <div className="flex justify-center flex-wrap gap-4">
            <Link
              href="/spots"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition min-h-[44px] inline-flex items-center justify-center"
            >
              开始探索
            </Link>
            <Link
              href="/works"
              className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition min-h-[44px] inline-flex items-center justify-center"
            >
              了解更多
            </Link>
          </div>
        </div>

        {/* Features - 每个卡片可点击跳转对应页面 */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            href="/spots"
            icon="📍"
            title="拍照打卡点"
            description="发现和分享最佳拍摄地点，记录你的拍摄足迹"
          />
          <FeatureCard
            href="/bookings"
            icon="🤝"
            title="约拍平台"
            description="摄影师与模特的约拍平台，支持互勉和收费模式"
          />
          <FeatureCard
            href="/works"
            icon="📸"
            title="作品展示"
            description="展示你的摄影作品，获得曝光和评价"
          />
          <FeatureCard
            href="/articles"
            icon="📚"
            title="经验分享"
            description="分享拍摄参数、摆拍姿势、器材评测等经验"
          />
          <FeatureCard
            href="/profile"
            icon="🎯"
            title="积分等级"
            description="完善的用户成长体系，通过互动获得积分和等级"
          />
          <FeatureCard
            href="/orders"
            icon="💰"
            title="订单管理"
            description="完整的订单流程，支持图片交付和AI修图"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition min-h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}

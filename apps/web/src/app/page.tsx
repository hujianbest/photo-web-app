export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-indigo-600">
                📸 摄影师服务平台
              </div>
            </div>
            <nav className="flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-indigo-600">
                首页
              </a>
              <a href="/spots" className="text-gray-700 hover:text-indigo-600">
                打卡点
              </a>
              <a href="/works" className="text-gray-700 hover:text-indigo-600">
                作品
              </a>
              <a href="/auth/login" className="text-gray-700 hover:text-indigo-600">
                登录
              </a>
            </nav>
          </div>
        </div>
      </header>

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
          <div className="flex justify-center space-x-4">
            <a href="/spots" className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              开始探索
            </a>
            <a href="/works" className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
              了解更多
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="📍"
            title="拍照打卡点"
            description="发现和分享最佳拍摄地点，记录你的拍摄足迹"
          />
          <FeatureCard
            icon="🤝"
            title="约拍平台"
            description="摄影师与模特的约拍平台，支持互勉和收费模式"
          />
          <FeatureCard
            icon="📸"
            title="作品展示"
            description="展示你的摄影作品，获得曝光和评价"
          />
          <FeatureCard
            icon="📚"
            title="经验分享"
            description="分享拍摄参数、摆拍姿势、器材评测等经验"
          />
          <FeatureCard
            icon="🎯"
            title="积分等级"
            description="完善的用户成长体系，通过互动获得积分和等级"
          />
          <FeatureCard
            icon="💰"
            title="订单管理"
            description="完整的订单流程，支持图片交付和AI修图"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>&copy; 2024 摄影师服务平台. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
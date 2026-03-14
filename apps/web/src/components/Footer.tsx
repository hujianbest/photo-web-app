import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">📸</span>
              <span className="text-xl font-bold">摄影师服务平台</span>
            </div>
            <p className="text-gray-400">
              面向业余摄影师的综合服务平台，提供打卡点推荐、约拍平台、作品展示等功能。
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/works" className="text-gray-400 hover:text-white transition">
                  作品展示
                </Link>
              </li>
              <li>
                <Link href="/spots" className="text-gray-400 hover:text-white transition">
                  打卡点
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-gray-400 hover:text-white transition">
                  约拍平台
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">帮助中心</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help/faq" className="text-gray-400 hover:text-white transition">
                  常见问题
                </Link>
              </li>
              <li>
                <Link href="/help/guide" className="text-gray-400 hover:text-white transition">
                  使用指南
                </Link>
              </li>
              <li>
                <Link href="/help/contact" className="text-gray-400 hover:text-white transition">
                  联系我们
                </Link>
              </li>
              <li>
                <Link href="/help/terms" className="text-gray-400 hover:text-white transition">
                  服务条款
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">关注我们</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                微信
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                微博
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                抖音
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                B站
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 摄影师服务平台. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
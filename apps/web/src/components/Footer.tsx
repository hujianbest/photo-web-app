import Link from 'next/link';
import { Camera } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-neutral-100 border-t border-neutral-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-neutral-600" aria-hidden />
              <span className="text-base font-semibold text-neutral-900 tracking-tight">
                摄影师服务平台
              </span>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              面向业余摄影师的综合服务平台，提供打卡点推荐、约拍平台、作品展示等功能。
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              快速链接
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: '首页' },
                { href: '/works', label: '作品展示' },
                { href: '/spots', label: '打卡点' },
                { href: '/bookings', label: '约拍平台' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-neutral-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              帮助中心
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/help/faq', label: '常见问题' },
                { href: '/help/guide', label: '使用指南' },
                { href: '/help/contact', label: '联系我们' },
                { href: '/help/terms', label: '服务条款' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-neutral-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              关注我们
            </h3>
            <div className="flex flex-wrap gap-4">
              {['微信', '微博', '抖音', 'B站'].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="text-sm text-neutral-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-500">
          <p>&copy; {new Date().getFullYear()} 摄影师服务平台. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

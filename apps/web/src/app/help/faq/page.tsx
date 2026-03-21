'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  ChevronDown,
  Search,
  MessageCircle,
  CreditCard,
  Camera,
  User,
  Shield
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  // 关于约拍
  {
    id: '1',
    category: 'booking',
    question: '如何发起约拍请求？',
    answer: '浏览摄影师作品集，选择心仪的摄影师后，点击"约拍"按钮。填写拍摄时间、地点、风格要求等信息，提交后等待摄影师确认。确认后双方可以进一步沟通细节。',
  },
  {
    id: '2',
    category: 'booking',
    question: '约拍支持哪些付费模式？',
    answer: '我们支持两种模式：互勉（TFP）和付费约拍。互勉模式下双方免费合作，作品共同使用；付费模式下客户支付费用，摄影师提供专业服务。',
  },
  {
    id: '3',
    category: 'booking',
    question: '如何取消约拍订单？',
    answer: '在订单详情页点击"取消订单"按钮。拍摄前24小时可免费取消；24小时内取消可能需要支付违约金。具体规则请查看订单详情或联系客服。',
  },
  
  // 关于支付
  {
    id: '4',
    category: 'payment',
    question: '支持哪些支付方式？',
    answer: '目前支持支付宝、微信支付和银行卡支付。企业用户还可以申请对公转账，需要提前联系客服开通。',
  },
  {
    id: '5',
    category: 'payment',
    question: '支付后多久确认？',
    answer: '在线支付通常实时确认。如果支付后订单状态未更新，请等待1-2分钟或刷新页面。如仍有问题，请联系客服并提供支付凭证。',
  },
  {
    id: '6',
    category: 'payment',
    question: '如何申请退款？',
    answer: '在订单详情页点击"申请退款"，填写退款原因。审核通过后3-7个工作日内原路退回。部分情况可能需要扣除手续费，详见退款政策。',
  },
  
  // 关于作品
  {
    id: '7',
    category: 'works',
    question: '如何上传作品？',
    answer: '登录后进入"我的作品"页面，点击"上传作品"按钮。支持批量上传，单张图片不超过10MB。建议上传高清作品，并添加详细描述和标签。',
  },
  {
    id: '8',
    category: 'works',
    question: '作品审核需要多久？',
    answer: '作品提交后通常24小时内完成审核。审核通过后会在作品墙展示。如有违规内容会被驳回，请查看审核意见修改后重新提交。',
  },
  {
    id: '9',
    category: 'works',
    question: '如何保护我的作品版权？',
    answer: '平台自动为上传作品添加水印。建议在作品描述中声明版权信息。如发现盗用，可通过"举报"功能投诉，我们会及时处理。',
  },
  
  // 关于账号
  {
    id: '10',
    category: 'account',
    question: '如何修改个人信息？',
    answer: '登录后进入"个人中心"→"编辑资料"，可以修改头像、昵称、简介等信息。修改后需要保存才能生效。',
  },
  {
    id: '11',
    category: 'account',
    question: '忘记密码怎么办？',
    answer: '在登录页点击"忘记密码"，输入注册邮箱或手机号。系统会发送重置链接，点击链接即可设置新密码。',
  },
  {
    id: '12',
    category: 'account',
    question: '如何注销账号？',
    answer: '进入"个人中心"→"账号设置"→"注销账号"。注销前请确保无未完成订单和提现。注销后数据无法恢复，请谨慎操作。',
  },
];

const CATEGORY_CONFIG = {
  all: { label: '全部', icon: HelpCircle },
  booking: { label: '约拍相关', icon: Camera },
  payment: { label: '支付问题', icon: CreditCard },
  works: { label: '作品上传', icon: MessageCircle },
  account: { label: '账号管理', icon: User },
};

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight mb-3">
            常见问题
          </h1>
          <p className="text-neutral-500 text-base max-w-lg mx-auto">
            快速找到您需要的答案，如有其他问题请联系客服
          </p>
        </div>

        {/* 搜索框 */}
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索问题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((key) => {
            const config = CATEGORY_CONFIG[key];
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  activeCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* FAQ 列表 */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
              <Search className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 text-lg">未找到相关问题</p>
              <p className="text-neutral-400 text-sm mt-2">请尝试其他关键词或联系客服</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors duration-200 cursor-pointer"
                >
                  <span className="text-base font-medium text-neutral-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`flex-shrink-0 w-5 h-5 text-neutral-400 transition-transform duration-200 ${
                      expandedItems.has(faq.id) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedItems.has(faq.id) && (
                  <div className="px-6 pb-5 border-t border-neutral-100">
                    <p className="text-sm text-neutral-600 leading-relaxed pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 底部帮助链接 */}
        <div className="mt-12 text-center">
          <p className="text-neutral-500 text-sm mb-4">没有找到答案？</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/help/guide"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
            >
              查看使用指南
            </Link>
            <Link
              href="/help/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-300 text-neutral-700 text-sm font-medium hover:border-neutral-400 hover:bg-neutral-50 transition-colors duration-200 cursor-pointer"
            >
              联系客服
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

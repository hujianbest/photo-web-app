'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronRight,
  User,
  Camera,
  MapPin,
  Handshake,
  CreditCard,
  Image,
  Star
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  details: string[];
}

interface GuideSection {
  id: string;
  icon: any;
  title: string;
  description: string;
  steps: GuideStep[];
}

const GUIDE_DATA: GuideSection[] = [
  {
    id: 'getting-started',
    icon: User,
    title: '快速入门',
    description: '了解平台基础功能，开启你的摄影之旅',
    steps: [
      {
        id: 'register',
        title: '注册账号',
        description: '创建你的专属摄影账号',
        details: [
          '访问平台官网，点击右上角"注册"按钮',
          '填写邮箱/手机号、密码等基本信息',
          '完成邮箱或手机验证',
          '设置个人资料，上传头像和简介',
          '选择你的身份：摄影师或客户'
        ],
      },
      {
        id: 'profile',
        title: '完善资料',
        description: '打造专业的个人主页',
        details: [
          '上传清晰的个人头像照片',
          '填写详细的个人简介和拍摄风格',
          '添加你的作品集链接或社交媒体',
          '设置你的服务范围和价格',
          '开启通知提醒，不错过任何消息'
        ],
      },
      {
        id: 'explore',
        title: '探索平台',
        description: '发现精彩内容和功能',
        details: [
          '浏览热门打卡点，获取拍摄灵感',
          '查看优秀摄影师作品集',
          '阅读经验分享文章，提升技能',
          '关注喜欢的摄影师，及时获取更新'
        ],
      },
    ],
  },
  {
    id: 'photographer',
    icon: Camera,
    title: '摄影师指南',
    description: '专业摄影师的完整使用流程',
    steps: [
      {
        id: 'upload-works',
        title: '上传作品',
        description: '展示你的摄影实力',
        details: [
          '点击"我的作品" → "上传作品"',
          '选择高质量的照片（建议10MB以内）',
          '添加作品标题、描述和标签',
          '选择拍摄参数和设备信息',
          '提交审核，通常24小时内完成'
        ],
      },
      {
        id: 'manage-bookings',
        title: '管理约拍',
        description: '高效处理客户约拍请求',
        details: [
          '收到约拍请求后及时查看详情',
          '评估客户需求，确认档期',
          '与客户沟通拍摄细节',
          '接受或婉拒约拍请求',
          '拍摄完成后上传成片'
        ],
      },
      {
        id: 'earnings',
        title: '收益管理',
        description: '查看和管理你的收入',
        details: [
          '在个人中心查看收益明细',
          '设置提现账户信息',
          '申请提现（最低100元起提）',
          '查看交易记录和对账单'
        ],
      },
    ],
  },
  {
    id: 'client',
    icon: Handshake,
    title: '客户指南',
    description: '如何找到合适的摄影师',
    steps: [
      {
        id: 'find-photographer',
        title: '寻找摄影师',
        description: '找到最适合你的摄影师',
        details: [
          '浏览作品墙，查看摄影师作品',
          '使用筛选功能，按风格、价格筛选',
          '查看摄影师评分和客户评价',
          '关注喜欢的摄影师'
        ],
      },
      {
        id: 'book-shoot',
        title: '发起约拍',
        description: '预约你的专属拍摄',
        details: [
          '选择心仪的摄影师，点击"约拍"',
          '填写拍摄时间、地点和风格要求',
          '选择付费模式（互勉或付费）',
          '提交约拍请求',
          '等待摄影师确认'
        ],
      },
      {
        id: 'complete-order',
        title: '完成订单',
        description: '从拍摄到收片的完整流程',
        details: [
          '按时参加拍摄活动',
          '拍摄完成后确认订单状态',
          '等待摄影师修图和交付',
          '收到成片后确认收货',
          '给摄影师评分和评价'
        ],
      },
    ],
  },
  {
    id: 'spots',
    icon: MapPin,
    title: '打卡点功能',
    description: '发现和分享最佳拍摄地点',
    steps: [
      {
        id: 'discover-spots',
        title: '发现打卡点',
        description: '探索附近的拍摄圣地',
        details: [
          '浏览地图查看附近打卡点',
          '使用筛选功能按类型筛选',
          '查看打卡点详情和示例照片',
          '阅读其他用户的评价和建议',
          '收藏喜欢的打卡点'
        ],
      },
      {
        id: 'share-spot',
        title: '分享打卡点',
        description: '分享你发现的宝藏地点',
        details: [
          '点击"分享打卡点"按钮',
          '标记地点位置（支持地图选点）',
          '上传在该地点拍摄的照片',
          '填写地点介绍和拍摄建议',
          '提交后获得积分奖励'
        ],
      },
    ],
  },
  {
    id: 'points',
    icon: Star,
    title: '积分等级',
    description: '了解积分系统和会员权益',
    steps: [
      {
        id: 'earn-points',
        title: '获取积分',
        description: '多种方式赚取积分',
        details: [
          '每日签到获得基础积分',
          '发布作品获得积分奖励',
          '分享打卡点获得积分',
          '撰写优质文章获得奖励',
          '邀请新用户注册获得积分'
        ],
      },
      {
        id: 'level-benefits',
        title: '等级权益',
        description: '不同等级的专属特权',
        details: [
          'Lv.1-2: 基础功能使用',
          'Lv.3-4: 解锁高级筛选功能',
          'Lv.5-6: 优先推荐展示',
          'Lv.7-8: 专属客服和活动邀请',
          'Lv.9-10: 平台大使和更多特权'
        ],
      },
    ],
  },
];

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<string>(GUIDE_DATA[0].id);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const currentSection = GUIDE_DATA.find((s) => s.id === activeSection);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight mb-3">
            使用指南
          </h1>
          <p className="text-neutral-500 text-base max-w-lg mx-auto">
            从新手到专家，一步步教你玩转平台
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧导航 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 sticky top-8">
              <h2 className="text-sm font-semibold text-neutral-900 mb-4 px-2">
                指南目录
              </h2>
              <nav className="space-y-1">
                {GUIDE_DATA.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{section.title}</span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="lg:col-span-3">
            {currentSection && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <currentSection.icon className="w-7 h-7 text-blue-600" />
                    <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">
                      {currentSection.title}
                    </h2>
                  </div>
                  <p className="text-neutral-500">{currentSection.description}</p>
                </div>

                <div className="space-y-6">
                  {currentSection.steps.map((step, index) => {
                    const isCompleted = completedSteps.has(step.id);
                    return (
                      <div
                        key={step.id}
                        className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            <button
                              onClick={() => toggleStep(step.id)}
                              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-8 h-8 text-blue-600" />
                              ) : (
                                <Circle className="w-8 h-8 text-neutral-300" />
                              )}
                            </button>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  步骤 {index + 1}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                {step.title}
                              </h3>
                              <p className="text-sm text-neutral-600 mb-4">
                                {step.description}
                              </p>

                              <div className="bg-neutral-50 rounded-xl p-4">
                                <ul className="space-y-2">
                                  {step.details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-xs text-neutral-500 mt-0.5">
                                        {i + 1}
                                      </span>
                                      <span>{detail}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部帮助链接 */}
        <div className="mt-16 text-center bg-white rounded-2xl border border-neutral-200 p-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            还有疑问？
          </h3>
          <p className="text-neutral-500 text-sm mb-6">
            查看常见问题或联系我们的客服团队
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/help/faq"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
            >
              查看常见问题
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

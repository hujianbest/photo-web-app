'use client';

import Link from 'next/link';
import { 
  FileText,
  ChevronDown
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight mb-3">
            服务条款
          </h1>
          <p className="text-neutral-500 text-base">
            最后更新：2024年3月1日
          </p>
        </div>

        {/* 条款内容 */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-10">
          <div className="prose prose-neutral max-w-none">
            {/* 导言 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">导言</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                欢迎使用摄影平台服务。在使用我们的服务之前，请仔细阅读以下服务条款（以下简称"本条款"）。
                本条款构成您与平台之间具有法律约束力的协议。一旦您使用我们的服务，即表示您同意遵守本条款的所有规定。
              </p>
              <p className="text-neutral-700 leading-relaxed">
                如果您不同意本条款的任何部分，请勿使用我们的服务。我们保留随时修改本条款的权利，
                修改后的条款将在平台上公布。继续使用我们的服务即表示您接受修改后的条款。
              </p>
            </section>

            {/* 服务说明 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. 服务说明</h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>1.1</strong> 本平台为业余摄影师及摄影爱好者提供一站式服务平台，包括但不限于：
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>拍照打卡点发现与分享</li>
                  <li>摄影师与模特约拍服务</li>
                  <li>摄影作品展示与评价</li>
                  <li>经验分享与交流</li>
                  <li>AI辅助修图服务</li>
                  <li>积分等级系统</li>
                </ul>
                <p>
                  <strong>1.2</strong> 我们保留随时修改、暂停或终止部分或全部服务的权利，恕不另行通知。
                </p>
                <p>
                  <strong>1.3</strong> 部分服务可能需要支付费用，具体费用标准将在相关页面明确说明。
                </p>
              </div>
            </section>

            {/* 账号注册 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. 账号注册与使用</h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>2.1 注册资格：</strong>您必须年满16周岁才能注册使用本平台服务。
                  如果您未满18周岁，需要在监护人同意和指导下使用本服务。
                </p>
                <p>
                  <strong>2.2 账号信息：</strong>您同意提供真实、准确、完整的个人信息，
                  并及时更新您的信息以保持其准确性。
                </p>
                <p>
                  <strong>2.3 账号安全：</strong>您有责任保护自己的账号和密码安全，
                  对账号下的所有活动负责。如发现账号被盗用，应立即通知我们。
                </p>
                <p>
                  <strong>2.4 禁止行为：</strong>您不得：
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>注册多个账号进行虚假交易或刷分</li>
                  <li>出售、出租或转让账号</li>
                  <li>使用他人的账号</li>
                  <li>使用自动化工具访问平台</li>
                </ul>
              </div>
            </section>

            {/* 用户行为规范 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. 用户行为规范</h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>3.1 合法使用：</strong>您同意仅将本服务用于合法目的，
                  遵守所有适用的法律法规。
                </p>
                <p>
                  <strong>3.2 禁止内容：</strong>您不得上传、发布或传播以下内容：
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>违反法律法规的内容</li>
                  <li>侵犯他人知识产权的内容</li>
                  <li>淫秽、暴力、恐怖主义内容</li>
                  <li>侮辱、诽谤他人内容</li>
                  <li>虚假或误导性信息</li>
                  <li>垃圾信息或广告</li>
                </ul>
                <p>
                  <strong>3.3 尊重他人：</strong>在与他人互动时，请保持礼貌和尊重，
                  不得进行骚扰、威胁或其他不当行为。
                </p>
              </div>
            </section>

            {/* 知识产权 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. 知识产权</h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>4.1 平台内容：</strong>本平台的所有内容，包括但不限于文字、图片、
                  图标、软件等，均受知识产权法律保护。未经授权，不得复制、修改或传播。
                </p>
                <p>
                  <strong>4.2 用户内容：</strong>您上传的作品和内容的知识产权归您所有。
                  上传内容即表示您授予平台在全球范围内使用、展示、传播该内容的非独家许可。
                </p>
                <p>
                  <strong>4.3 版权保护：</strong>我们尊重他人的知识产权。如发现侵权内容，
                  请通过 <Link href="/help/contact" className="text-blue-600 hover:text-blue-700">联系方式</Link> 通知我们，
                  我们将及时处理。
                </p>
              </div>
            </section>

            {/* 约拍服务 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. 约拍服务条款</h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>5.1 服务性质：</strong>平台仅提供约拍信息撮合服务，
                  不参与实际拍摄活动，不对拍摄结果承担责任。
                </p>
                <p>
                  <strong>5.2 交易责任：</strong>约拍双方应对对方的资质、能力进行独立判断，
                  自行承担交易风险。
                </p>
                <p>
                  <strong>5.3 取消政策：</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>拍摄前24小时以上取消：全额退款</li>
                  <li>拍摄前24小时内取消：可能收取违约金</li>
                  <li>无故缺席：不予退款</li>
                </ul>
                <p>
                  <strong>5.4 纠纷处理：</strong>如发生交易纠纷，双方应友好协商解决。
                  协商不成的，可申请平台介入调解。
                </p>
              </div>
            </section>

            {/* 支付与退款 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">6. 支付与退款</h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>6.1 支付方式：</strong>我们支持支付宝、微信支付、银行卡等支付方式。
                </p>
                <p>
                  <strong>6.2 退款政策：</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>未消费的订单可申请全额退款</li>
                  <li>已消费的订单按实际情况处理</li>
                  <li>退款将在3-7个工作日内原路返回</li>
                </ul>
                <p>
                  <strong>6.3 费用说明：</strong>所有价格均以人民币计价，包含税费（如有）。
                </p>
              </div>
            </section>

            {/* 隐私保护 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">7. 隐私保护</h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  我们重视您的隐私保护。关于我们如何收集、使用、存储和保护您的个人信息，
                  请查阅我们的 <Link href="/help/privacy" className="text-blue-600 hover:text-blue-700">隐私政策</Link>。
                </p>
              </div>
            </section>

            {/* 免责声明 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">8. 免责声明</h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>8.1</strong> 本服务按"现状"提供，我们不提供任何明示或暗示的保证。
                </p>
                <p>
                  <strong>8.2</strong> 我们不对以下情况承担责任：
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>不可抗力导致的服务中断</li>
                  <li>第三方行为造成的损失</li>
                  <li>用户自身过错导致的损失</li>
                  <li>用户内容引发的任何纠纷</li>
                </ul>
                <p>
                  <strong>8.3</strong> 在法律允许的范围内，我们的赔偿责任以您支付的服务费用为限。
                </p>
              </div>
            </section>

            {/* 协议变更 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">9. 协议变更与终止</h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>9.1 条款变更：</strong>我们保留随时修改本条款的权利。
                  修改后的条款将在平台公布，继续使用服务即表示接受修改。
                </p>
                <p>
                  <strong>9.2 服务终止：</strong>如您违反本条款，我们有权暂停或终止您的账号和服务。
                </p>
                <p>
                  <strong>9.3 条款效力：</strong>如本条款任何条款被认定为无效，
                  不影响其他条款的效力。
                </p>
              </div>
            </section>

            {/* 法律适用 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">10. 法律适用与争议解决</h2>
              <div className="space-y-3 text-neutral-700 leading-relaxed">
                <p>
                  <strong>10.1 法律适用：</strong>本条款受中华人民共和国法律管辖。
                </p>
                <p>
                  <strong>10.2 争议解决：</strong>因本条款引起的争议，
                  双方应友好协商解决。协商不成的，任何一方可向平台所在地人民法院提起诉讼。
                </p>
              </div>
            </section>

            {/* 联系我们 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">11. 联系我们</h2>
              <div className="text-neutral-700 leading-relaxed">
                <p className="mb-3">
                  如您对本条款有任何疑问，请通过以下方式联系我们：
                </p>
                <ul className="space-y-2">
                  <li>• 客服邮箱：support@photoplatform.com</li>
                  <li>• 客服热线：400-123-4567</li>
                  <li>• 在线客服：访问 <Link href="/help/contact" className="text-blue-600 hover:text-blue-700">联系页面</Link></li>
                </ul>
              </div>
            </section>

            {/* 同意声明 */}
            <div className="mt-10 p-6 bg-blue-50 rounded-xl">
              <p className="text-sm text-neutral-700 leading-relaxed">
                <strong>重要提示：</strong>使用本平台服务即表示您已阅读、理解并同意遵守本服务条款的所有内容。
                如果您不同意本条款的任何部分，请立即停止使用我们的服务。
              </p>
            </div>
          </div>
        </div>

        {/* 底部链接 */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link 
            href="/help/privacy"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            隐私政策
          </Link>
          <span className="text-neutral-300">|</span>
          <Link 
            href="/help/faq"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            常见问题
          </Link>
          <span className="text-neutral-300">|</span>
          <Link 
            href="/help/contact"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            联系我们
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

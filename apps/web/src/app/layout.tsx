import './globals.css';
import { Inter } from 'next/font/google';
import { NotificationsSocketWrapper } from '@/components/NotificationsSocketWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '摄影师服务平台',
  description: '面向业余摄影师的综合服务平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <NotificationsSocketWrapper>{children}</NotificationsSocketWrapper>
      </body>
    </html>
  );
}
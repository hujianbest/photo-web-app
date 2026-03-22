/**
 * BookingCard 组件测试
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BookingCard from '../BookingCard';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('BookingCard Component', () => {
  const mockBooking = {
    id: 1,
    title: '人像摄影约拍',
    description: '专业人像摄影服务',
    price: 500,
    duration: 2,
    location: '北京',
    type: 'portrait',
    status: 'open',
    photographer: {
      id: 1,
      username: 'photographer',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    created_at: new Date().toISOString(),
  };

  it('should render booking title', () => {
    render(<BookingCard booking={mockBooking as any} />);
    expect(screen.getByText('人像摄影约拍')).toBeInTheDocument();
  });

  it('should display price', () => {
    render(<BookingCard booking={mockBooking as any} />);
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('should display location', () => {
    render(<BookingCard booking={mockBooking as any} />);
    expect(screen.getByText(/北京/)).toBeInTheDocument();
  });

  it('should display duration', () => {
    render(<BookingCard booking={mockBooking as any} />);
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it('should display photographer name', () => {
    render(<BookingCard booking={mockBooking as any} />);
    expect(screen.getByText('photographer')).toBeInTheDocument();
  });
});

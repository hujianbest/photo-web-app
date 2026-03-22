/**
 * BookingCard 组件测试
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BookingCard } from '../BookingCard';

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('BookingCard Component', () => {
  const mockBooking = {
    id: 1,
    title: '人像摄影约拍',
    description: '专业人像摄影服务',
    type: 'paid',
    style: '日系清新',
    location: '北京',
    budget: 500,
    views: 100,
    comments: 5,
    created_at: new Date().toISOString(),
    user: {
      id: 1,
      username: 'photographer',
      avatar_url: 'https://example.com/avatar.jpg',
      rating: 4.8,
    },
  };

  it('should render booking title', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText('人像摄影约拍')).toBeInTheDocument();
  });

  it('should display budget', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('should display location', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText(/北京/)).toBeInTheDocument();
  });

  it('should display user name', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText('photographer')).toBeInTheDocument();
  });

  it('should display type badge', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText(/付费/)).toBeInTheDocument();
  });

  it('should display style', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText(/日系清新/)).toBeInTheDocument();
  });
});

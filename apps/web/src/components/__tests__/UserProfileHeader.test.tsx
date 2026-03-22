/**
 * UserProfileHeader 组件测试
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserProfileHeader } from '../UserProfileHeader';

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('UserProfileHeader Component', () => {
  const mockUser = {
    username: 'testuser',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: '这是一个测试用户',
    location: '北京',
    level: 'intermediate',
    stats: {
      works: 20,
      checkins: 15,
      bookings: 10,
      likes: 100,
    },
  };

  it('should render username', () => {
    render(<UserProfileHeader user={mockUser} isOwn={false} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should display bio', () => {
    render(<UserProfileHeader user={mockUser} isOwn={false} />);
    expect(screen.getByText('这是一个测试用户')).toBeInTheDocument();
  });

  it('should display location', () => {
    render(<UserProfileHeader user={mockUser} isOwn={false} />);
    expect(screen.getByText(/北京/)).toBeInTheDocument();
  });

  it('should display works count', () => {
    render(<UserProfileHeader user={mockUser} isOwn={false} />);
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should display level', () => {
    render(<UserProfileHeader user={mockUser} isOwn={false} />);
    expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
  });

  it('should show edit button when isOwn is true', () => {
    render(<UserProfileHeader user={mockUser} isOwn={true} />);
    expect(screen.getByText('编辑资料')).toBeInTheDocument();
  });

  it('should not show edit button when isOwn is false', () => {
    render(<UserProfileHeader user={mockUser} isOwn={false} />);
    expect(screen.queryByText('编辑资料')).not.toBeInTheDocument();
  });
});

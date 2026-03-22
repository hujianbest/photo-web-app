/**
 * UserProfileHeader 组件测试
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserProfileHeader from '../UserProfileHeader';

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, fill }: any) => <img src={src} alt={alt} />,
}));

describe('UserProfileHeader Component', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    nickname: '测试用户',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: '这是一个测试用户',
    location: '北京',
    points: 1000,
    level: 'intermediate',
    followers_count: 100,
    following_count: 50,
    works_count: 20,
  };

  it('should render user nickname', () => {
    render(<UserProfileHeader user={mockUser as any} />);
    expect(screen.getByText('测试用户')).toBeInTheDocument();
  });

  it('should display bio', () => {
    render(<UserProfileHeader user={mockUser as any} />);
    expect(screen.getByText('这是一个测试用户')).toBeInTheDocument();
  });

  it('should display follower count', () => {
    render(<UserProfileHeader user={mockUser as any} />);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('should display following count', () => {
    render(<UserProfileHeader user={mockUser as any} />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('should display works count', () => {
    render(<UserProfileHeader user={mockUser as any} />);
    expect(screen.getByText(/20/)).toBeInTheDocument();
  });

  it('should display user level', () => {
    render(<UserProfileHeader user={mockUser as any} />);
    expect(screen.getByText(/intermediate|中级/i)).toBeInTheDocument();
  });
});

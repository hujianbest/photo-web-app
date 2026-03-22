/**
 * WorkCard 组件测试
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WorkCard } from '../WorkCard';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, ...props }: any) => (
    <img src={src} alt={alt} data-fill={fill} {...props} />
  ),
}));

describe('WorkCard Component', () => {
  const mockWork = {
    id: 1,
    title: '测试作品',
    description: '这是一幅测试作品',
    images: ['https://example.com/image.jpg'],
    likes: 100,
    views: 500,
    created_at: new Date().toISOString(),
    user: {
      id: 1,
      username: 'photographer',
      avatar_url: 'https://example.com/avatar.jpg',
    },
  };

  it('should render work title', () => {
    render(<WorkCard work={mockWork} />);
    expect(screen.getByText('测试作品')).toBeInTheDocument();
  });

  it('should display like count', () => {
    render(<WorkCard work={mockWork} />);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('should display author name', () => {
    render(<WorkCard work={mockWork} />);
    expect(screen.getByText('photographer')).toBeInTheDocument();
  });

  it('should have link to work detail', () => {
    render(<WorkCard work={mockWork} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/works/1');
  });

  it('should display view count', () => {
    render(<WorkCard work={mockWork} />);
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('should display description', () => {
    render(<WorkCard work={mockWork} />);
    expect(screen.getByText(/这是一幅测试作品/)).toBeInTheDocument();
  });
});

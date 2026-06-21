import type { Meta, StoryObj } from '@storybook/nextjs';

import type { Post, PostSummary } from '@/lib/content';

import { ArticleHeader } from './ArticleHeader';
import { PostBrowser } from './PostBrowser';
import { PostListItem } from './PostListItem';
import { TagBadge } from './TagBadge';
import { Thumbnail } from './Thumbnail';

const samplePost: PostSummary = {
  slug: 'failure-containment-patterns',
  title: '장애 전파를 막는 패턴을 실험으로 이해하기',
  description: 'timeout, retry, circuit breaker, bulkhead를 장애 전파 관점에서 비교한 설계 노트',
  pubDate: '2026-06-21',
  dateLabel: '2026.06.21',
  category: 'Infra',
  thumbnail: '/images/failure-containment-thumbnail.svg',
};

const posts: PostSummary[] = [
  samplePost,
  {
    slug: 'react-note',
    title: 'React 컴포넌트 테스트 메모',
    description: '사용자에게 보이는 동작을 기준으로 테스트한 기록',
    pubDate: '2026-06-20',
    dateLabel: '2026.06.20',
    category: 'React',
  },
  {
    slug: 'typescript-note',
    title: 'TypeScript 설정 정리',
    description: 'strict 설정과 빌드 경계를 점검한 기록',
    pubDate: '2026-06-19',
    dateLabel: '2026.06.19',
    category: 'TypeScript',
  },
];

const meta: Meta = {
  title: 'Blog/Design System',
};

export default meta;

export const TagStates: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <TagBadge label="Infra" />
      <TagBadge label="React" />
      <TagBadge label="Note" />
      <TagBadge label="Unknown" />
    </div>
  ),
};

export const ThumbnailStates: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Thumbnail src="/images/failure-containment-thumbnail.svg" alt="장애 전파 차단 비교 이미지" />
      <Thumbnail alt="이미지 없음" />
    </div>
  ),
};

export const ListItem: StoryObj = {
  render: () => <PostListItem post={samplePost} />,
};

export const Browser: StoryObj = {
  render: () => <PostBrowser posts={posts} />,
};

export const Article: StoryObj = {
  render: () => (
    <ArticleHeader
      post={{
        ...samplePost,
        content: '본문',
      } satisfies Post}
    />
  ),
};

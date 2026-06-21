import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { PostBrowser } from './PostBrowser';
import type { PostSummary } from '@/lib/content';

const posts: PostSummary[] = [
  {
    slug: 'infra-1',
    title: 'Infra 1',
    description: 'Infra description 1',
    pubDate: '2026-06-21',
    dateLabel: '2026.06.21',
    category: 'Infra',
    thumbnail: '/images/reliability-pattern-lab-thumbnail.svg',
  },
  {
    slug: 'react-1',
    title: 'React 1',
    description: 'React description 1',
    pubDate: '2026-06-20',
    dateLabel: '2026.06.20',
    category: 'React',
  },
  {
    slug: 'infra-2',
    title: 'Infra 2',
    description: 'Infra description 2',
    pubDate: '2026-06-19',
    dateLabel: '2026.06.19',
    category: 'Infra',
  },
  {
    slug: 'note-1',
    title: 'Note 1',
    description: 'Note description 1',
    pubDate: '2026-06-18',
    dateLabel: '2026.06.18',
    category: 'Note',
  },
  {
    slug: 'life-1',
    title: 'Life 1',
    description: 'Life description 1',
    pubDate: '2026-06-17',
    dateLabel: '2026.06.17',
    category: 'Life',
  },
  {
    slug: 'react-2',
    title: 'React 2',
    description: 'React description 2',
    pubDate: '2026-06-16',
    dateLabel: '2026.06.16',
    category: 'React',
  },
];

describe('PostBrowser', () => {
  test('filters posts by category without removing the intro or filter controls', async () => {
    const user = userEvent.setup();
    render(<PostBrowser posts={posts} />);

    expect(screen.getByRole('heading', { name: 'Infra 1', level: 3 })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'React 2' }));

    expect(screen.getByText('글')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전체 6' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /React 1/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Infra 1/ })).not.toBeInTheDocument();
  });

  test('paginates visible posts in groups of five', async () => {
    const user = userEvent.setup();
    render(<PostBrowser posts={posts} />);

    expect(screen.getByRole('link', { name: /Infra 1/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /React 2/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2' }));

    expect(screen.getByRole('link', { name: /React 2/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Infra 1/ })).not.toBeInTheDocument();
  });
});

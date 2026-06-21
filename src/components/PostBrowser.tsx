'use client';

import { useMemo, useState } from 'react';

import type { PostSummary } from '@/lib/content';

import { PostListItem } from './PostListItem';

const PAGE_SIZE = 5;
const ALL_CATEGORY = '전체';

type PostBrowserProps = {
  posts: PostSummary[];
};

type Category = {
  label: string;
  count: number;
};

function buildCategories(posts: PostSummary[]): Category[] {
  const counts = new Map<string, number>();

  for (const post of posts) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }

  return [
    { label: ALL_CATEGORY, count: posts.length },
    ...Array.from(counts.entries()).map(([label, count]) => ({ label, count })),
  ];
}

export function PostBrowser({ posts }: PostBrowserProps) {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [page, setPage] = useState(1);
  const categories = useMemo(() => buildCategories(posts), [posts]);
  const filteredPosts = activeCategory === ALL_CATEGORY
    ? posts
    : posts.filter((post) => post.category === activeCategory);
  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const visiblePosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function selectCategory(category: string) {
    setActiveCategory(category);
    setPage(1);
  }

  return (
    <section aria-labelledby="posts-heading">
      <h2 className="sec" id="posts-heading">
        글
      </h2>
      <div className="filters" aria-label="카테고리 필터">
        {categories.map((category) => (
          <button
            className={category.label === activeCategory ? 'chip on' : 'chip'}
            key={category.label}
            type="button"
            aria-pressed={category.label === activeCategory}
            onClick={() => selectCategory(category.label)}
          >
            {category.label} <span className="cnt">{category.count}</span>
          </button>
        ))}
      </div>
      <div className="posts" aria-live="polite">
        {visiblePosts.length > 0 ? (
          visiblePosts.map((post) => <PostListItem key={post.slug} post={post} />)
        ) : (
          <p className="empty">아직 해당 카테고리의 글이 없습니다.</p>
        )}
      </div>
      {totalPages > 1 ? (
        <nav className="pagination" aria-label="페이지">
          <button
            className="page-btn"
            type="button"
            disabled={page === 1}
            aria-label="이전 페이지"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              className={pageNumber === page ? 'page-btn on' : 'page-btn'}
              key={pageNumber}
              type="button"
              aria-current={pageNumber === page ? 'page' : undefined}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            className="page-btn"
            type="button"
            disabled={page === totalPages}
            aria-label="다음 페이지"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            ›
          </button>
        </nav>
      ) : null}
    </section>
  );
}

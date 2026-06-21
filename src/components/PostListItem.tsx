import Link from 'next/link';

import type { PostSummary } from '@/lib/content';

import { TagBadge } from './TagBadge';
import { Thumbnail } from './Thumbnail';

type PostListItemProps = {
  post: PostSummary;
};

export function PostListItem({ post }: PostListItemProps) {
  return (
    <Link className="post" href={`/posts/${post.slug}/`}>
      <Thumbnail src={post.thumbnail} alt={post.title} />
      <span className="post-meta">
        <span className="post-row">
          <TagBadge label={post.category} />
          <span className="date">{post.dateLabel}</span>
        </span>
        <span className="post-title">{post.title}</span>
        <span className="post-desc">{post.description}</span>
      </span>
    </Link>
  );
}

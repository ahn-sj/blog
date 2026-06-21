import type { Post } from '@/lib/content';

import { TagBadge } from './TagBadge';
import { Thumbnail } from './Thumbnail';

type ArticleHeaderProps = {
  post: Post;
};

export function ArticleHeader({ post }: ArticleHeaderProps) {
  return (
    <header className="article-head">
      <a className="back" href="/">
        ← 홈
      </a>
      <div className="post-row">
        <TagBadge label={post.category} />
        <span className="date">{post.dateLabel}</span>
      </div>
      <h1>{post.title}</h1>
      <p className="article-desc">{post.description}</p>
      <Thumbnail src={post.thumbnail} alt={post.title} variant="hero" />
    </header>
  );
}

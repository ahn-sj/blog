import type { CSSProperties } from 'react';

import { getTagColor } from '@/lib/tags';

type TagBadgeProps = {
  label: string;
};

type TagStyle = CSSProperties & {
  '--tag-fg': string;
  '--tag-bg': string;
};

export function TagBadge({ label }: TagBadgeProps) {
  const color = getTagColor(label);

  return (
    <span className="tag" style={{ '--tag-fg': color.fg, '--tag-bg': color.bg } as TagStyle}>
      {label}
    </span>
  );
}

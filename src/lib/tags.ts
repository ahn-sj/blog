export type TagColor = {
  fg: string;
  bg: string;
};

export const TAG_COLORS: Record<string, TagColor> = {
  Engineer: { fg: '#0f766e', bg: '#e6f4f1' },
  Infra: { fg: '#0f766e', bg: '#e6f4f1' },
  React: { fg: '#1d4ed8', bg: '#e0ecff' },
  Note: { fg: '#b45309', bg: '#fef3c7' },
  TypeScript: { fg: '#4338ca', bg: '#e7e5ff' },
  Life: { fg: '#be123c', bg: '#ffe4e6' },
};

export const DEFAULT_TAG_COLOR: TagColor = {
  fg: '#0f766e',
  bg: '#e6f4f1',
};

export function getTagColor(category: string): TagColor {
  return TAG_COLORS[category] ?? DEFAULT_TAG_COLOR;
}

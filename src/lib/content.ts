import fs from 'node:fs';
import path from 'node:path';

const POSTS_DIR = path.join(process.cwd(), 'src/content/blog');

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  dateLabel: string;
  category: string;
  thumbnail?: string;
};

export type Post = PostSummary & {
  content: string;
};

type Frontmatter = {
  title: string;
  description: string;
  pubDate: string;
  category: string;
  thumbnail?: string;
};

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function readFrontmatter(slug: string, data: Record<string, unknown>): Frontmatter {
  const title = data.title;
  const description = data.description;
  const pubDate = data.pubDate;
  const category = data.category;
  const thumbnail = data.thumbnail;

  if (!isString(title) || !isString(description) || !isString(pubDate) || !isString(category)) {
    throw new Error(`Invalid frontmatter: ${slug}`);
  }

  return {
    title,
    description,
    pubDate,
    category,
    thumbnail: isString(thumbnail) ? thumbnail : undefined,
  };
}

function parseMarkdown(file: string): { data: Record<string, unknown>; content: string } {
  const frontmatterMatch = /^---\n(?<frontmatter>[\s\S]*?)\n---\n?(?<content>[\s\S]*)$/.exec(file);

  if (!frontmatterMatch?.groups) {
    throw new Error('Markdown frontmatter is required');
  }

  const data: Record<string, unknown> = {};

  for (const line of frontmatterMatch.groups.frontmatter.split('\n')) {
    const match = /^(?<key>[A-Za-z][A-Za-z0-9_-]*):\s*(?<value>.*)$/.exec(line.trim());
    if (!match?.groups) {
      continue;
    }

    const rawValue = match.groups.value.trim();
    data[match.groups.key] = rawValue.replace(/^"|"$/g, '');
  }

  return {
    data,
    content: frontmatterMatch.groups.content,
  };
}

function formatDateLabel(pubDate: string): string {
  const date = new Date(`${pubDate}T00:00:00+09:00`);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function readPost(fileName: string): Post {
  const slug = fileName.replace(/\.mdx?$/, '');
  const filePath = path.join(POSTS_DIR, fileName);
  const file = fs.readFileSync(filePath, 'utf8');
  const parsed = parseMarkdown(file);
  const frontmatter = readFrontmatter(slug, parsed.data);

  return {
    slug,
    ...frontmatter,
    dateLabel: formatDateLabel(frontmatter.pubDate),
    content: parsed.content.trim(),
  };
}

export function getAllPosts(): PostSummary[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((fileName) => /\.mdx?$/.test(fileName))
    .map(readPost)
    .sort((a, b) => b.pubDate.localeCompare(a.pubDate))
    .map(({ content, ...post }) => post);
}

export function getPostBySlug(slug: string): Post {
  const fileName = `${slug}.md`;
  return readPost(fileName);
}

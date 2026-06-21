import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleHeader } from '@/components/ArticleHeader';
import { Prose } from '@/components/Prose';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getAllPosts, getPostBySlug } from '@/lib/content';

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  try {
    const post = getPostBySlug(slug);

    return (
      <main className="shell shell-read">
        <SiteHeader />
        <article>
          <ArticleHeader post={post} />
          <Prose content={post.content} />
        </article>
        <SiteFooter />
      </main>
    );
  } catch {
    notFound();
  }
}

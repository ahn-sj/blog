import { PostBrowser } from '@/components/PostBrowser';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getAllPosts } from '@/lib/content';

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <main className="shell">
      <SiteHeader />
      <section className="intro">
        <h1>기록하는 백엔드 엔지니어</h1>
        <p>배운 것, 만든 것, 고민한 것을 글로 남깁니다.</p>
      </section>
      <PostBrowser posts={posts} />
      <SiteFooter />
    </main>
  );
}

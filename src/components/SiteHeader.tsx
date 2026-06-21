import Link from 'next/link';

import { SocialLinks } from './SocialLinks';

export function SiteHeader() {
  return (
    <header className="site-head">
      <Link className="brand" href="/">
        asze.net
      </Link>
      <SocialLinks
        github="https://github.com/ahn-sj"
        linkedin="https://www.linkedin.com/in/anseongjae"
        email="seongjae.dev@gmail.com"
      />
    </header>
  );
}

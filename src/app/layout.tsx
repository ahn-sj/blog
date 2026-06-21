import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://asze.net'),
  title: {
    default: 'asze.net',
    template: '%s | asze.net',
  },
  description: '배운 것, 만든 것, 고민한 것을 글로 남깁니다.',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

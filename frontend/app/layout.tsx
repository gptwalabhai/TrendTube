import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: 'TrendTube AI — Enterprise Viral Discovery & YouTube Publishing Engine',
  description: 'Discover viral public short-form content, analyze trends using AI, organize research, and publish directly to YouTube.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

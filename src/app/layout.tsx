import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Course Dev Agent - AI-Powered Course Development',
  description: 'AI-powered course development agent that guides instructional designers through the ADDIE methodology',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}

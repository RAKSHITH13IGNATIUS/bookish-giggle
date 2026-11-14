import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://quickfile.io'),
  title: {
    default: 'QuickFile.io - 100% Free Client-Side File & Image Utilities',
    template: '%s | QuickFile.io',
  },
  description:
    'Free online photo resizer, signature compressor, image optimizer, and PDF tools. Runs entirely in your browser with zero file uploads for maximum security and speed.',
  keywords: [
    'photo resizer',
    'signature resizer',
    'photo size reducer',
    'compress image to 50kb',
    'compress image to 20kb',
    'passport photo resizer',
    'images to pdf',
    'merge pdf',
    'split pdf',
    'client side file utility',
  ],
  authors: [{ name: 'QuickFile Team' }],
  creator: 'QuickFile.io',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quickfile.io',
    siteName: 'QuickFile.io',
    title: 'QuickFile.io - Fast, Free, In-Browser File Utilities',
    description:
      'Resize exam photos and signatures to exact KB and dimensions, compress images, convert to PDF, and merge/split PDFs securely on your device.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#fafafc] text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

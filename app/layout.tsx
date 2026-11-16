import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getProductionSiteUrl } from '@/lib/seo';

const productionUrl = getProductionSiteUrl();

export const metadata: Metadata = {
  ...(productionUrl ? { metadataBase: new URL(productionUrl) } : {}),
  title: {
    default: 'NimbleFile - Simple Tools for Everyday Files',
    template: '%s | NimbleFile',
  },
  description:
    'Free online photo resizer, signature compressor, HEIC to JPG converter, image optimizer, and PDF tools. Runs entirely in your browser with zero file uploads for maximum security and speed.',
  keywords: [
    'nimblefile',
    'photo resizer',
    'signature resizer',
    'heic to jpg',
    'heic converter',
    'image compressor',
    'compress image to 50kb',
    'images to pdf',
    'merge pdf',
    'split pdf',
    'client side file utility',
  ],
  authors: [{ name: 'NimbleFile Team' }],
  creator: 'NimbleFile',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'NimbleFile',
    title: 'NimbleFile - Simple Tools for Everyday Files',
    description:
      'Resize exam photos and signatures, convert HEIC to JPG, compress images, and merge or split PDFs securely on your device with zero server uploads.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F7FAFF] text-[#203247] antialiased selection:bg-[#3979E6] selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

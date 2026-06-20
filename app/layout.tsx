import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/navbar';
import { EcoProvider } from '@/components/eco-provider';
import QuickTracker from '@/components/quick-tracker';
import AnimatedBackground from '@/components/animated-background';
import EmissionThemeEffect from '@/components/emission-theme-effect';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Carbon Footprint Tracker',
  description: 'Track, analyze, and reduce your personal carbon footprint.',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-hidden h-screen w-screen`}>
        <EcoProvider>
          <EmissionThemeEffect />
          <div id="page-wrapper" className="h-full w-full overflow-y-auto overflow-x-hidden relative bg-slate-50 transition-colors duration-1000">
            <AnimatedBackground />
            <div className="relative z-10 min-h-screen">
              <NavBar />
              <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
          <QuickTracker />
        </EcoProvider>
      </body>
    </html>
  );
}

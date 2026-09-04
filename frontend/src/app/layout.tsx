import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const jbMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Kivi Memory Studio',
  description: 'Deterministic Phonetic Memory',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jbMono.className} bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col`}>
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="text-xl font-bold text-slate-900">
              Kivi Memory
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <Link href="/" className="px-4 py-1.5 text-sm font-medium rounded-md hover:bg-white hover:shadow-sm transition-all text-slate-700 hover:text-slate-900">
                Bulk Train
              </Link>
              <Link href="/infer" className="px-4 py-1.5 text-sm font-medium rounded-md hover:bg-white hover:shadow-sm transition-all text-slate-700 hover:text-slate-900">
                Inference
              </Link>
              <Link href="/state" className="px-4 py-1.5 text-sm font-medium rounded-md hover:bg-white hover:shadow-sm transition-all text-slate-700 hover:text-slate-900">
                State
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-6xl mx-auto w-full p-6 mt-4">
          {children}
        </main>
      </body>
    </html>
  );
}

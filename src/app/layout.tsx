import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sabor & Leña Admin',
  description: 'Restaurant Administration Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`${inter.className} bg-[#faf9f6] flex h-screen overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </body>
    </html>
  );
}

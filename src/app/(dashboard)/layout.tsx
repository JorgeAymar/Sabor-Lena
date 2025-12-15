
import Sidebar from '@/components/Sidebar';
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        {children}
      </main>
    </div>
  );
}

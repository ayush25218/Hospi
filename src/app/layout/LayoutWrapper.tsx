'use client';

import { useState } from 'react';
import { Sidebar } from '../sidebar';
import { LuMenu } from 'react-icons/lu';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* This overlay is for mobile view. 
        It appears when the sidebar is open.
      */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
        ></div>
      )}

      {/* --- Sidebar --- */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* --- Main Content Area --- */}
      <main className="flex-1">
        {/* Top Header Bar (for mobile toggle) */}
        <header className="sticky top-0 z-30 bg-white p-4 shadow-sm lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md"
            aria-label="Open sidebar"
          >
            <LuMenu className="h-6 w-6" />
          </button>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
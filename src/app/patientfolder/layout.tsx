'use client';
import React from 'react';
import { useState } from 'react';
import PSidebar from "@/app/patientsidebar";

// Cast the imported PSidebar to a React component type that accepts the expected props
const PSidebarComponent = PSidebar as unknown as React.ComponentType<{
  isOpen: boolean;
  onClose: () => void;
}>;

export default function patientfolderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <PSidebarComponent isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Main Page Content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}

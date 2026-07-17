import React from 'react';
import { Sidebar } from './Sidebar';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel Content */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};

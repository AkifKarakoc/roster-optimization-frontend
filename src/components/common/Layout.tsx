import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 fixed inset-y-0 left-0 z-50 bg-gray-900">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 min-h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex-shrink-0">
            <Header />
          </div>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
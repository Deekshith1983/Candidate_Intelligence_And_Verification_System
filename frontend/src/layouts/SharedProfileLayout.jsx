import React from 'react';
import { Footer } from '../components/Footer';

/**
 * SharedProfileLayout
 * Layout for publicly shared profiles
 * - No navbar
 * - No authentication UI
 * - Only profile content and footer
 */
export const SharedProfileLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-grow py-8">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default SharedProfileLayout;

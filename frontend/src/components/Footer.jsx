import React from 'react';

export const Footer = () => {
  return (
    <footer
      className="bg-grey-mild border-t border-slate-300 mt-auto"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderTopColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8 flex justify-center items-center">
        <div
          className="text-slate-grey text-xs sm:text-sm text-center"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          © 2026 CredVerify. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

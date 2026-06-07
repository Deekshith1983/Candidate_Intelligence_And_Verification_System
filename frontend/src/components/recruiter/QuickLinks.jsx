import React from 'react';
import { Link } from 'react-router-dom';

/**
 * QuickLinks Component
 * Shows quick action items in a clean row list layout
 */
export const QuickLinks = () => {
  const quickLinks = [
    {
      label: 'Search candidates',
      description: 'Browse and filter verified talent by skills and credibility score',
      to: '/recruiter/search',
    },
    {
      label: 'Starred candidates',
      description: 'View your saved candidates and shortlisted profiles',
      to: '/recruiter/starred',
    },
    {
      label: 'Company profile',
      description: 'Manage your recruiter account and company information',
      to: '/recruiter/profile',
    },
  ];

  return (
    <div className="space-y-2 sm:space-y-3">
      {quickLinks.map((link, idx) => (
        <Link key={idx} to={link.to}>
          <div 
            className="p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:shadow-soft"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border-light)'
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {link.label} →
                </h4>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {link.description}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

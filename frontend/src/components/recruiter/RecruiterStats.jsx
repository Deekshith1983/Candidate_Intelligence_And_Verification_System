import React from 'react';
import { Card } from '../UI';

/**
 * RecruiterStats Component
 * Displays responsive grid with key metrics
 * Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns
 */
export const RecruiterStats = ({
  profilesViewed = 0,
  profilesStarred = 0,
  totalCandidates = 0,
  githubVerified = 0,
  loading = false,
}) => {
  const stats = [
    {
      label: 'Profiles Viewed',
      value: profilesViewed,
      icon: '👁️',
      color: 'text-blue-600',
    },
    {
      label: 'Profiles Starred',
      value: profilesStarred,
      icon: '⭐',
      color: 'text-yellow-600',
    },
    {
      label: 'Total Candidates',
      value: totalCandidates,
      icon: '👥',
      color: 'text-purple-600',
    },
    {
      label: 'GitHub Verified',
      value: githubVerified,
      icon: '✓',
      color: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {stats.map((stat, idx) => (
        <Card key={idx} className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1">
                {stat.label}
              </p>
              {loading ? (
                <div className="h-6 sm:h-8 bg-slate-200 rounded animate-pulse w-12"></div>
              ) : (
                <h3 className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                  {typeof stat.value === 'number'
                    ? stat.value.toLocaleString()
                    : stat.value}
                </h3>
              )}
            </div>
            <div className="text-2xl sm:text-3xl flex-shrink-0">{stat.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
};

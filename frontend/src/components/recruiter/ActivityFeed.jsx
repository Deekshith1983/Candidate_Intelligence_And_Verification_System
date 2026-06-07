import React from 'react';
import { Card } from '../UI';
import { Avatar } from '../Avatar';

/**
 * ActivityFeed Component
 * Displays recent activity with timestamps and user initials
 */
export const ActivityFeed = ({ activities = [], loading = false }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return 'just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // If within the last hour, show relative time like "5m ago"
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    // If today, show time like "2:47 PM"
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();
    }
    
    // If recently, show relative
    if (diffDays < 7) return `${diffDays}d ago`;

    // Otherwise show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <h3 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Recent Activity
        </h3>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Last 10
        </span>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          <>
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="flex gap-2 sm:gap-3 animate-pulse">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}></div>
                <div className="flex-1 min-w-0">
                  <div className="h-3 sm:h-4 rounded w-full sm:w-48 mb-1.5 sm:mb-2" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}></div>
                  <div className="h-2.5 sm:h-3 rounded w-20 sm:w-24" style={{ backgroundColor: 'var(--color-bg-secondary)' }}></div>
                </div>
              </div>
            ))}
          </>
        ) : activities.length > 0 ? (
          activities.map((activity, idx) => {
            const candidateName = activity.candidate?.name || 'Unknown';
            const actionLabel = activity.action === 'viewed' ? 'profile viewed' : 'profile starred';
            return (
              <div key={idx} className="flex items-start gap-2 sm:gap-3 pb-3 sm:pb-4 border-b last:border-0" style={{ borderBottomColor: 'var(--color-border-light)' }}>
                <Avatar name={candidateName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    <span className="font-semibold truncate">{candidateName}</span>
                    {' — '}
                    <span style={{ color: 'var(--color-text-secondary)' }} className="truncate">
                      {actionLabel}
                    </span>
                  </p>
                  <p className="text-xs mt-0.5 sm:mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 sm:py-8" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-xs sm:text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </Card>
  );
};

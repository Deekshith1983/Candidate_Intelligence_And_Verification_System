import React, { useState } from 'react';
import { Card } from '../UI';

/**
 * FilterBar Component
 * Handles skill filtering, score range, and sorting options
 * Responsive: Drawer on mobile, sidebar on desktop
 */
export const FilterBar = ({
  skill = '',
  minScore = 0,
  maxScore = 100,
  sortBy = 'desc',
  onSkillChange = () => {},
  onMinScoreChange = () => {},
  onSortChange = () => {},
  onReset = () => {},
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const sortOptions = [
    { value: 'desc', label: 'Highest Score First' },
    { value: 'asc', label: 'Lowest Score First' },
    { value: 'top10', label: 'Top 10 Only' },
    { value: 'name', label: 'Sort by Name' },
    { value: 'recent', label: 'Most Recent' },
  ];

  const handleClose = () => {
    setIsDrawerOpen(false);
  };

  const handleReset = () => {
    onReset();
    handleClose();
  };

  const FilterContent = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Skill Search */}
      <div>
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2 sm:mb-3">
          Search by Skill
        </h3>
        <input
          type="text"
          value={skill}
          onChange={(e) => onSkillChange(e.target.value)}
          placeholder="e.g., React, Python, AWS..."
          className="w-full px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {/* Score Range */}
      <div>
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2 sm:mb-3">
          Min Score: {minScore}
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex gap-1 sm:gap-2 flex-wrap">
            {[60, 65, 70, 75].map((score) => (
              <button
                key={score}
                onClick={() => onMinScoreChange(score)}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                  minScore === score
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {score}+
              </button>
            ))}
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={minScore}
            onChange={(e) => onMinScoreChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2 sm:mb-3">
          Sort By
        </h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full px-3 sm:px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg text-xs sm:text-sm hover:bg-slate-50 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div
        className={`lg:hidden mobile-drawer ${isDrawerOpen ? 'active' : ''}`}
        onClick={handleClose}
      >
        <div
          className="mobile-drawer-content !max-w-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6 pt-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Filters</h2>
              <button
                onClick={handleClose}
                className="text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Card className="p-4 sm:p-6 mb-6">
          <FilterContent />
        </Card>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 transition-all"
        >
          Filters
        </button>
      </div>
    </>
  );
};

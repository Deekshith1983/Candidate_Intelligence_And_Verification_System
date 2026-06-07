import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../UI';

/**
 * ResultsTable Component
 * Displays search results in table format (desktop) or card layout (mobile)
 */
export const ResultsTable = ({
  candidates = [],
  loading = false,
  onView = () => {},
}) => {
  const getTierBadgeColor = (tier) => {
    const tiers = {
      'High Potential': 'bg-emerald-100 text-emerald-800',
      'Moderate': 'bg-orange-100 text-orange-800',
      'Entry Level': 'bg-blue-100 text-blue-800',
      'Specialist': 'bg-purple-100 text-purple-800',
    };
    return tiers[tier] || 'bg-slate-100 text-slate-800';
  };

  const SkillTag = ({ skill }) => (
    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
      {skill}
    </span>
  );

  const ScoreBar = ({ score }) => {
    const percentage = (score / 100) * 100;
    const barColor = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-200 rounded-full h-2">
          <div
            className={`${barColor} h-full rounded-full transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-slate-900 min-w-fit">
          {score.toFixed(0)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, idx) => (
          <Card key={idx} className="p-4">
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-40"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-32"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card className="p-8 sm:p-12 text-center">
        <p className="text-slate-500 text-xs sm:text-sm">
          No candidates found. Try adjusting your filters.
        </p>
      </Card>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {candidates.map((candidate, idx) => (
          <Card key={idx} className="p-4 space-y-3">
            {/* Header with Name and Avatar */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  {candidate.name
                    .split(' ')
                    .map((n) => n.charAt(0).toUpperCase())
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {candidate.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {candidate.university || 'N/A'}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getTierBadgeColor(
                  candidate.tier || 'N/A'
                )}`}
              >
                {candidate.tier || 'N/A'}
              </span>
            </div>

            {/* Score */}
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Score</p>
              <ScoreBar score={candidate.score || 0} />
            </div>

            {/* Skills */}
            {candidate.topSkills && candidate.topSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Skills</p>
                <div className="flex gap-1 flex-wrap">
                  {candidate.topSkills.slice(0, 3).map((skill, sidx) => (
                    <SkillTag key={sidx} skill={skill} />
                  ))}
                  {candidate.topSkills.length > 3 && (
                    <span className="text-xs text-slate-600">
                      +{candidate.topSkills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <Link
                to={`/recruiter/candidate/${candidate._id || candidate.id}`}
                onClick={() => onView(candidate._id || candidate.id)}
                className="block w-full py-2 text-center bg-teal-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-teal-700 transition-all"
              >
                View Profile
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Score
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Tier
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Top Skills
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                          {candidate.name
                            .split(' ')
                            .map((n) => n.charAt(0).toUpperCase())
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-slate-900">
                            {candidate.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {candidate.university || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <ScoreBar score={candidate.score || 0} />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTierBadgeColor(
                          candidate.tier || 'N/A'
                        )}`}
                      >
                        {candidate.tier || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {candidate.topSkills &&
                          candidate.topSkills.slice(0, 3).map((skill, sidx) => (
                            <SkillTag key={sidx} skill={skill} />
                          ))}
                        {candidate.topSkills &&
                          candidate.topSkills.length > 3 && (
                            <span className="text-xs text-slate-600">
                              +{candidate.topSkills.length - 3}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="action-cell">
                      <Link
                        to={`/recruiter/candidate/${candidate._id || candidate.id}`}
                        onClick={() => onView(candidate._id || candidate.id)}
                        className="view-btn"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
};

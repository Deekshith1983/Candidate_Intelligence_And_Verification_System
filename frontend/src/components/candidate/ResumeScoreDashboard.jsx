import React from 'react';

/**
 * Resume Score Dashboard Component
 * Displays resume ATS score with KPI analysis, section analysis, pie chart, signal strength, and spider chart
 */
export const ResumeScoreDashboard = ({ resumeScore = null, scoreCard = null }) => {
  if (!resumeScore) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-4 sm:p-6 md:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-blue-600 mb-4 sm:mb-6">Resume + ATS Score</h3>
        <div className="text-center py-6 sm:py-8 text-slate-500">
          <p className="text-xs sm:text-sm">No resume score available. Upload and submit your resume to see ATS analysis.</p>
        </div>
      </div>
    );
  }

  // ✅ PHASE 2: Extract all 5 KPI component scores from backend ats_breakdown (0-100 each)
  const atsScore = Math.round(resumeScore.ats_breakdown?.ats_score || resumeScore.final_score || 0);
  const sectionScore = Math.round(resumeScore.ats_breakdown?.section_score || 0);
  const keywordScore = Math.round(resumeScore.ats_breakdown?.keyword_score || 0);
  const formatScore = Math.round(resumeScore.ats_breakdown?.format_score || 0);
  const skillScore = Math.round(resumeScore.ats_breakdown?.skill_score || 0);
  const projectStrength = Math.round(resumeScore.ats_breakdown?.project_strength || 0);
  
  // ✅ FIXED: Resume contribution (ATS × 0.3 = 0-30)
  const resumeScorePercentage = resumeScore.ats_breakdown?.resume_contribution || Math.round((atsScore / 100) * 30);

  // Determine signal strength labels
  const getSignalLabel = (score) => {
    if (score >= 75) return 'Strong';
    if (score >= 50) return 'Moderate';
    return 'Weak';
  };

  const getSignalColor = (score) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // ✅ FIXED: Profile balance radar - uses real backend metrics (not hardcoded)
  // Calculate based on actual section presence and KPI scores
  const radarData = [
    { label: 'Section Completeness', value: sectionScore },
    { label: 'Keyword Relevance', value: keywordScore },
    { label: 'Format Quality', value: formatScore },
    { label: 'Skill Depth', value: skillScore },
    { label: 'Project Strength', value: projectStrength }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <h3 className="text-lg sm:text-xl font-semibold text-blue-600 break-words">Resume + ATS Score</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Scored on {resumeScore?.meta?.scored_at ? new Date(resumeScore.meta.scored_at).toLocaleDateString() : 'recently'}
        </p>
      </div>

      <div className="p-4 sm:p-6 md:p-8">
        {/* KPI Analysis Section - 5 Components */}
        <div className="mb-6 sm:mb-8">
          <h4 className="font-semibold text-slate-900 mb-3 sm:mb-4 text-sm sm:text-base">KPI Analysis</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {/* ATS Score */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200 overflow-hidden">
              <p className="text-xs font-medium text-blue-600 mb-1">ATS Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 break-words">{atsScore}</p>
              <p className="text-xs text-blue-700 mt-2">Out of 100</p>
            </div>

            {/* Section Score */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200 overflow-hidden">
              <p className="text-xs font-medium text-green-600 mb-1">Section Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 break-words">{sectionScore}</p>
              <p className="text-xs text-green-700 mt-2">/100</p>
            </div>

            {/* Keyword Score */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200 overflow-hidden">
              <p className="text-xs font-medium text-purple-600 mb-1">Keyword Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-900 break-words">{keywordScore}</p>
              <p className="text-xs text-purple-700 mt-2">/100</p>
            </div>

            {/* Format Score */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 sm:p-4 border border-orange-200 overflow-hidden">
              <p className="text-xs font-medium text-orange-600 mb-1">Format Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-900 break-words">{formatScore}</p>
              <p className="text-xs text-orange-700 mt-2">/100</p>
            </div>

            {/* Skill Score */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 sm:p-4 border border-cyan-200 overflow-hidden">
              <p className="text-xs font-medium text-cyan-600 mb-1">Skill Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-cyan-900 break-words">{skillScore}</p>
              <p className="text-xs text-cyan-700 mt-2">/100</p>
            </div>
          </div>
        </div>

        {/* Profile Balance Score */}
        {scoreCard && (
          <div className="mb-6 sm:mb-8 bg-slate-50 rounded-lg border border-slate-200 p-3 sm:p-4">
            <div className="flex justify-between items-center gap-2 mb-2 flex-wrap">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">Resume Score Contribution</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 flex-shrink-0">{Math.round(resumeScorePercentage)}/30</p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 sm:h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all"
                style={{ width: `${(resumeScorePercentage / 30) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Out of 30% contribution to total profile score
            </p>
          </div>
        )}

        {/* Main Grid - ATS Breakdown, Signal Strength */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Left Column - ATS Score Breakdown Donut Chart */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 sm:p-6 overflow-hidden min-w-0">
            <h4 className="font-semibold text-slate-900 mb-3 sm:mb-4 text-sm sm:text-base">ATS Score Breakdown</h4>
            <div className="flex justify-center mb-4 sm:mb-6">
              {/* Donut Chart */}
              <div className="relative w-32 sm:w-40 h-32 sm:h-40 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="2.5"
                  />
                  {/* Score circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray={`${(atsScore / 100) * 100}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{atsScore}</span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-slate-700">Section: {sectionScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-slate-700">Keyword: {keywordScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-slate-700">Format: {formatScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                <span className="text-slate-700">Skills: {skillScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                <span className="text-slate-700">Projects: {projectStrength}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Signal Strength */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 sm:p-4 md:p-6 overflow-hidden">
            <h4 className="font-semibold text-slate-900 mb-3 sm:mb-4 text-sm sm:text-base">Signal Strength</h4>
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {/* ✅ FIXED: Use backend KPI scores directly */}
              <div>
                <div className="flex justify-between gap-1 mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-slate-700 min-w-0">Section Completeness</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 flex-shrink-0">{sectionScore}%</span>
                </div>
                <div className="w-full bg-slate-300 rounded-full h-2 sm:h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getSignalColor(sectionScore)}`}
                    style={{ width: `${Math.min(sectionScore, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{getSignalLabel(sectionScore)}</p>
              </div>

              <div>
                <div className="flex justify-between gap-1 mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-slate-700 min-w-0">Keyword Density</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 flex-shrink-0">{keywordScore}%</span>
                </div>
                <div className="w-full bg-slate-300 rounded-full h-2 sm:h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getSignalColor(keywordScore)}`}
                    style={{ width: `${Math.min(keywordScore, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{getSignalLabel(keywordScore)}</p>
              </div>

              <div>
                <div className="flex justify-between gap-1 mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-slate-700 min-w-0">Format Quality</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 flex-shrink-0">{formatScore}%</span>
                </div>
                <div className="w-full bg-slate-300 rounded-full h-2 sm:h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getSignalColor(formatScore)}`}
                    style={{ width: `${Math.min(formatScore, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{getSignalLabel(formatScore)}</p>
              </div>

              <div>
                <div className="flex justify-between gap-1 mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-slate-700 min-w-0">Skill Depth</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 flex-shrink-0">{skillScore}%</span>
                </div>
                <div className="w-full bg-slate-300 rounded-full h-2 sm:h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getSignalColor(skillScore)}`}
                    style={{ width: `${Math.min(skillScore, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{getSignalLabel(skillScore)}</p>
              </div>

              <div>
                <div className="flex justify-between gap-1 mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-slate-700 min-w-0">Project Strength</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 flex-shrink-0">{projectStrength}%</span>
                </div>
                <div className="w-full bg-slate-300 rounded-full h-2 sm:h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getSignalColor(projectStrength)}`}
                    style={{ width: `${Math.min(projectStrength, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{getSignalLabel(projectStrength)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Balance - Radar Chart */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 overflow-hidden">
          <h4 className="font-semibold text-slate-900 mb-3 sm:mb-4 text-sm sm:text-base break-words">Profile Balance (Radar Chart)</h4>
          <div className="flex justify-center overflow-x-auto">
            <svg width="280" height="280" viewBox="0 0 380 380" className="mx-auto md:w-full md:h-auto" style={{ minWidth: '280px' }}>
              {/* Grid lines */}
              {[1, 2, 3, 4, 5].map((level) => {
                const angleSlice = (Math.PI * 2) / radarData.length;
                const points = radarData.map((_, i) => {
                  const angle = angleSlice * i - Math.PI / 2;
                  const r = ((level) / 5) * 100;
                  const x = 190 + r * Math.cos(angle);
                  const y = 190 + r * Math.sin(angle);
                  return `${x},${y}`;
                }).join(' ');
                return (
                  <polygon
                    key={`grid-${level}`}
                    points={points}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Axis lines */}
              {radarData.map((_, i) => {
                const angleSlice = (Math.PI * 2) / radarData.length;
                const angle = angleSlice * i - Math.PI / 2;
                const x = 190 + 100 * Math.cos(angle);
                const y = 190 + 100 * Math.sin(angle);
                return (
                  <line
                    key={`axis-${i}`}
                    x1={190}
                    y1={190}
                    x2={x}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data polygon */}
              {(() => {
                const angleSlice = (Math.PI * 2) / radarData.length;
                const points = radarData.map((data, i) => {
                  const angle = angleSlice * i - Math.PI / 2;
                  const r = (data.value / 100) * 100;
                  const x = 190 + r * Math.cos(angle);
                  const y = 190 + r * Math.sin(angle);
                  return `${x},${y}`;
                }).join(' ');
                return (
                  <polygon
                    points={points}
                    fill="#0d9488"
                    fillOpacity="0.2"
                    stroke="#0d9488"
                    strokeWidth="2"
                  />
                );
              })()}

              {/* Labels */}
              {radarData.map((data, i) => {
                const angleSlice = (Math.PI * 2) / radarData.length;
                const angle = angleSlice * i - Math.PI / 2;
                const r = 145;
                const x = 190 + r * Math.cos(angle);
                const y = 190 + r * Math.sin(angle);
                return (
                  <text
                    key={`label-${i}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dy="0.3em"
                    className="text-xs font-medium fill-slate-700"
                    style={{ fontSize: '11px' }}
                  >
                    {data.label}
                  </text>
                );
              })}
            </svg>
          </div>
          <p className="text-xs text-slate-500 text-center mt-4">
            Overall profile balance across all 5 KPI metrics
          </p>
        </div>

        {/* ✅ FIXED: Improvement Suggestions - Uses backend suggestions only */}
        {resumeScore.improvement_suggestions && resumeScore.improvement_suggestions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-4">💡 Improvement Suggestions</h4>
            <ul className="space-y-2">
              {resumeScore.improvement_suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-blue-800">
                  <span className="font-medium">• {suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* When no suggestions */}
        {(!resumeScore.improvement_suggestions || resumeScore.improvement_suggestions.length === 0) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-900 mb-2">✓ Resume Analysis Complete</h4>
            <p className="text-sm text-green-800">
              Your resume has been analyzed. Check the KPI cards and section analysis above for detailed metrics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

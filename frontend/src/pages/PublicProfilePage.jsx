import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicService } from '../api/publicService';
import { Card } from '../components/UI';
import SharedProfileLayout from '../layouts/SharedProfileLayout';

/**
 * PublicProfilePage - Shared Profile View
 * READ-ONLY candidate profile accessible via public URL
 * Matches recruiter view exactly:
 * - Tabbed interface (Details + Skills, Resume + ATS Score, Projects)
 * - KPI analysis cards with visualizations
 * - Skills with sub-scores
 * - Projects list
 * - Resume download (NO star button)
 * - NO navbar, NO authentication UI
 */
const PublicProfilePage = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'resume', 'projects'
  const [downloadingResume, setDownloadingResume] = useState(false);

  useEffect(() => {
    loadPublicProfile();
  }, [shareId]);

  const loadPublicProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await publicService.getPublicProfile(shareId);
      const data = response?.data || response;
      setCandidate(data);
    } catch (err) {
      console.error('Failed to load public profile:', err);
      setError(err?.message || 'Profile not found or unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!candidate?.resume_url) return;

    try {
      setDownloadingResume(true);
      // ✅ FIXED: Use proper API base URL from environment
      const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
      const downloadUrl = `${API_BASE_URL}/api/public/profile/${shareId}/resume`;
      
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`Failed to download resume (${response.status})`);
      }

      const blob = await response.blob();
      const fileName = `${candidate?.name}_resume.pdf`;
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download resume. Please try again.');
    } finally {
      setDownloadingResume(false);
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      'High Potential': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'Moderate': 'bg-orange-50 text-orange-700 border border-orange-200',
      'Entry Level': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Specialist': 'bg-purple-50 text-purple-700 border border-purple-200',
    };
    return colors[tier] || 'bg-slate-50 text-slate-700 border border-slate-200';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  if (loading) {
    return (
      <SharedProfileLayout>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8">
          <Card className="p-3 sm:p-4 md:p-6 lg:p-8 animate-pulse">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="h-12 bg-slate-200 rounded w-2/3"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
          </Card>
        </div>
      </SharedProfileLayout>
    );
  }

  if (error || !candidate) {
    return (
      <SharedProfileLayout>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8">
          <Card className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
              <p className="text-red-600 mb-4 sm:mb-6 text-xs sm:text-sm">{error || 'This profile is not available'}</p>
              <a
                href="/"
                className="inline-block px-2 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                ← Back to Home
              </a>
            </div>
          </Card>
        </div>
      </SharedProfileLayout>
    );
  }

  return (
    <SharedProfileLayout>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8">

        {/* Header with Profile and Actions */}
        <Card className="p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-3 sm:mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 md:gap-4 lg:gap-6 flex-1 min-w-0">
              {/* Avatar */}
              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <span className="text-xl sm:text-3xl font-bold">{getInitials(candidate.name)}</span>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 break-words">{candidate.name}</h1>
                <p className="text-xs sm:text-sm text-slate-600 mb-1 break-all">{candidate.user_id?.email || 'No email'}</p>
                <p className="text-slate-600 text-xs sm:text-sm mb-3 break-words">{candidate.university || 'N/A'}</p>
                
                {/* ✅ GITHUB LINK - REPLACES BADGES */}
                {candidate.github_username && (
                  <a 
                    href={`https://github.com/${candidate.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 mt-2 sm:mt-3 leading-relaxed font-medium break-all inline-block"
                  >
                    https://github.com/{candidate.github_username}
                  </a>
                )}
              </div>
            </div>

            {/* Actions - Resume Download ONLY (NO Star) */}
            {candidate.resume_url && (
              <button
                onClick={handleDownloadResume}
                disabled={downloadingResume}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 flex-shrink-0"
              >
                {downloadingResume ? '⏳ Downloading...' : '↓ Download resume'}
              </button>
            )}
          </div>

          {/* Overall Score */}
        <div className="bg-slate-50 rounded-lg p-2 sm:p-3 md:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 md:gap-3">
            <div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Overall Credibility Score</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-4xl font-bold text-blue-600 flex-shrink-0">{Math.round(candidate.score || 0)}</p>
              <p className="text-xs sm:text-sm text-slate-600 flex-shrink-0">/100</p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-4 sm:mb-6 md:mb-8 overflow-x-auto">
          <div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-6 md:gap-8 flex-nowrap">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-2 sm:px-4 py-3 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'details'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              Details + skills
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`px-2 sm:px-4 py-3 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'resume'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              Resume + ATS score
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-2 sm:px-4 py-3 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'projects'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              Projects
            </button>
          </div>
        </div>

        {/* TAB 1: DETAILS + SKILLS */}
        {activeTab === 'details' && (
          <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
            {/* Two Column Layout: Personal Info + Candidate Bio */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {/* Left: Personal Info */}
              <Card className="p-3 sm:p-4 md:p-6 lg:p-8">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 md:mb-6">Personal info</h3>
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  {candidate.education?.degree && (
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">Degree</p>
                      <p className="text-slate-900 font-medium mt-1 text-sm break-words">{candidate.education.degree}</p>
                    </div>
                  )}
                  {candidate.education?.institution && (
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">Institution</p>
                      <p className="text-slate-900 font-medium mt-1 text-sm break-words">{candidate.education.institution}</p>
                    </div>
                  )}
                  {candidate.education?.graduation_year && (
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">Graduation year</p>
                      <p className="text-slate-900 font-medium mt-1 text-sm">{candidate.education.graduation_year || candidate.education.year}</p>
                    </div>
                  )}
                  {candidate.github_verified && (
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">GitHub status</p>
                      <p className="text-green-600 font-medium mt-1 text-sm">✓ Verified</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-3 sm:p-4 md:p-6 lg:p-8">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 md:mb-6">About</h3>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm break-words">
                  {candidate.bio ? candidate.bio : "No bio available"}
                </p>
              </Card>
            </div>

            {/* Skills with Sub-scores */}
            {candidate.skills && candidate.skills.length > 0 && (
              <Card className="p-3 sm:p-4 md:p-6 lg:p-8">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 md:mb-6">Skills — with sub-scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                  {candidate.skills.slice(0, 6).map((skill, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-3 sm:p-4">
                      {/* Skill Name & Overall Score */}
                      <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4 flex-wrap">
                        <h4 className="font-semibold text-slate-900 text-xs sm:text-sm break-words flex-1 min-w-0">{skill.name}</h4>
                        <span className="text-lg sm:text-2xl font-bold text-blue-600 flex-shrink-0">{Math.round(skill.sub_score || 0)}</span>
                      </div>

                      {/* Overall Progress Bar */}
                      <div className="mb-3 sm:mb-4">
                        <div className="h-2 bg-slate-200 rounded-full">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.min(skill.sub_score || 0, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Sub-score Breakdown */}
                      <div className="space-y-2 text-xs">
                                         
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: RESUME + ATS SCORE */}
        {activeTab === 'resume' && (
          <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
            {candidate.resumeScoreDetails ? (
              <>
                {/* KPI Analysis Section - 5 Components */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-3 sm:p-4 md:p-6 lg:p-8">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 md:mb-6">KPI Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                    {/* ATS Score */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 sm:p-3 md:p-4 border border-blue-200">
                      <p className="text-xs font-medium text-blue-600 mb-1">ATS Score</p>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-900">{Math.round(candidate.resumeScoreDetails.atsScore || 0)}</p>
                      <p className="text-xs text-blue-700 mt-1 sm:mt-2">Out of 100</p>
                    </div>

                    {/* Section Score */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <p className="text-xs font-medium text-green-600 mb-1">Section Score</p>
                      <p className="text-3xl font-bold text-green-900">{Math.round(candidate.resumeScoreDetails.sectionScore || 0)}</p>
                      <p className="text-xs text-green-700 mt-2">/100</p>
                    </div>

                    {/* Keyword Score */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <p className="text-xs font-medium text-purple-600 mb-1">Keyword Score</p>
                      <p className="text-3xl font-bold text-purple-900">{Math.round(candidate.resumeScoreDetails.keywordScore || 0)}</p>
                      <p className="text-xs text-purple-700 mt-2">/100</p>
                    </div>

                    {/* Format Score */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <p className="text-xs font-medium text-orange-600 mb-1">Format Score</p>
                      <p className="text-3xl font-bold text-orange-900">{Math.round(candidate.resumeScoreDetails.formatScore || 0)}</p>
                      <p className="text-xs text-orange-700 mt-2">/100</p>
                    </div>

                    {/* Skill Score */}
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
                      <p className="text-xs font-medium text-cyan-600 mb-1">Skill Score</p>
                      <p className="text-3xl font-bold text-cyan-900">{Math.round(candidate.resumeScoreDetails.skillScore || 0)}</p>
                      <p className="text-xs text-cyan-700 mt-2">/100</p>
                    </div>
                  </div>
                </div>

                {/* Resume Score Contribution */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-4 sm:p-6 md:p-8">
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 sm:p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-slate-700">Resume Score Contribution</p>
                      <p className="text-sm font-bold text-slate-900">{Math.round(candidate.resumeScoreDetails.resumeContribution || 0)}/30</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min((candidate.resumeScoreDetails.resumeContribution || 0) / 30 * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Out of 30% contribution to total profile score
                    </p>
                  </div>
                </div>

                {/* ✅ RECRUITER-STYLE VISUALIZATIONS: Donut Chart + Signal Strength */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  {/* Left: ATS Score Breakdown - Donut Chart */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-4 sm:p-6 md:p-8">
                    <h4 className="font-semibold text-slate-900 mb-6">ATS Score Breakdown</h4>
                    <div className="flex justify-center mb-6">
                      {/* Donut Chart */}
                      <div className="relative w-40 h-40">
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
                            strokeDasharray={`${((candidate.resumeScoreDetails.atsScore || 0) / 100) * 100}, 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-slate-900">{Math.round(candidate.resumeScoreDetails.atsScore || 0)}</span>
                          <span className="text-xs text-slate-500">/ 100</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-slate-700">Section: {Math.round(candidate.resumeScoreDetails.sectionScore || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-slate-700">Keyword: {Math.round(candidate.resumeScoreDetails.keywordScore || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-slate-700">Format: {Math.round(candidate.resumeScoreDetails.formatScore || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                        <span className="text-slate-700">Skills: {Math.round(candidate.resumeScoreDetails.skillScore || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                        <span className="text-slate-700">Projects: {Math.round(candidate.resumeScoreDetails.projectStrength || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Signal Strength */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-4 sm:p-6 md:p-8">
                    <h4 className="font-semibold text-slate-900 mb-6">Signal Strength</h4>
                    <div className="space-y-4">
                      {/* Section Completeness */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Section Completeness</span>
                          <span className="text-sm font-semibold text-slate-900">{Math.round(candidate.resumeScoreDetails.sectionScore || 0)}%</span>
                        </div>
                        <div className="w-full bg-slate-300 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all bg-green-500"
                            style={{ width: `${Math.min(candidate.resumeScoreDetails.sectionScore || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Keyword Density */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Keyword Density</span>
                          <span className="text-sm font-semibold text-slate-900">{Math.round(candidate.resumeScoreDetails.keywordScore || 0)}%</span>
                        </div>
                        <div className="w-full bg-slate-300 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all bg-yellow-500"
                            style={{ width: `${Math.min(candidate.resumeScoreDetails.keywordScore || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Format Quality */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Format Quality</span>
                          <span className="text-sm font-semibold text-slate-900">{Math.round(candidate.resumeScoreDetails.formatScore || 0)}%</span>
                        </div>
                        <div className="w-full bg-slate-300 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all bg-blue-500"
                            style={{ width: `${Math.min(candidate.resumeScoreDetails.formatScore || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Skill Depth */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Skill Depth</span>
                          <span className="text-sm font-semibold text-slate-900">{Math.round(candidate.resumeScoreDetails.skillScore || 0)}%</span>
                        </div>
                        <div className="w-full bg-slate-300 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all bg-purple-500"
                            style={{ width: `${Math.min(candidate.resumeScoreDetails.skillScore || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Project Strength */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Project Strength</span>
                          <span className="text-sm font-semibold text-slate-900">{Math.round(candidate.resumeScoreDetails.projectStrength || 0)}%</span>
                        </div>
                        <div className="w-full bg-slate-300 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all bg-teal-500"
                            style={{ width: `${Math.min(candidate.resumeScoreDetails.projectStrength || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ Profile Balance - Radar Chart */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-4 sm:p-6 md:p-8">
                  <h4 className="font-semibold text-slate-900 mb-4">Profile Balance (Radar Chart)</h4>
                  <div className="flex justify-center overflow-x-auto">
                    <svg width="380" height="380" viewBox="0 0 380 380" className="mx-auto">
                      {/* Grid lines */}
                      {[1, 2, 3, 4, 5].map((level) => {
                        const radarData = [
                          { label: 'Section Completeness', value: candidate.resumeScoreDetails.sectionScore || 0 },
                          { label: 'Keyword Relevance', value: candidate.resumeScoreDetails.keywordScore || 0 },
                          { label: 'Format Quality', value: candidate.resumeScoreDetails.formatScore || 0 },
                          { label: 'Skill Depth', value: candidate.resumeScoreDetails.skillScore || 0 },
                          { label: 'Project Strength', value: candidate.resumeScoreDetails.projectStrength || 0 }
                        ];
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
                      {(() => {
                        const radarData = [
                          { label: 'Section Completeness', value: candidate.resumeScoreDetails.sectionScore || 0 },
                          { label: 'Keyword Relevance', value: candidate.resumeScoreDetails.keywordScore || 0 },
                          { label: 'Format Quality', value: candidate.resumeScoreDetails.formatScore || 0 },
                          { label: 'Skill Depth', value: candidate.resumeScoreDetails.skillScore || 0 },
                          { label: 'Project Strength', value: candidate.resumeScoreDetails.projectStrength || 0 }
                        ];
                        return radarData.map((_, i) => {
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
                        });
                      })()}

                      {/* Data polygon */}
                      {(() => {
                        const radarData = [
                          { label: 'Section Completeness', value: candidate.resumeScoreDetails.sectionScore || 0 },
                          { label: 'Keyword Relevance', value: candidate.resumeScoreDetails.keywordScore || 0 },
                          { label: 'Format Quality', value: candidate.resumeScoreDetails.formatScore || 0 },
                          { label: 'Skill Depth', value: candidate.resumeScoreDetails.skillScore || 0 },
                          { label: 'Project Strength', value: candidate.resumeScoreDetails.projectStrength || 0 }
                        ];
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
                      {(() => {
                        const radarData = [
                          { label: 'Section Completeness', value: candidate.resumeScoreDetails.sectionScore || 0 },
                          { label: 'Keyword Relevance', value: candidate.resumeScoreDetails.keywordScore || 0 },
                          { label: 'Format Quality', value: candidate.resumeScoreDetails.formatScore || 0 },
                          { label: 'Skill Depth', value: candidate.resumeScoreDetails.skillScore || 0 },
                          { label: 'Project Strength', value: candidate.resumeScoreDetails.projectStrength || 0 }
                        ];
                        return radarData.map((data, i) => {
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
                        });
                      })()}
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-slate-600">Resume score data not available yet.</p>
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            {candidate.projects && candidate.projects.length > 0 ? (
              <div className="space-y-6">
                {candidate.projects.map((project, idx) => (
                  <Card key={idx} className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 break-words">{project.title}</h4>
                        <p className="text-slate-600 mb-4 text-sm sm:text-base break-words">{project.description}</p>
                      </div>
                      {project.score && (
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{Math.round(project.score)}</p>
                          <p className="text-xs sm:text-sm text-slate-600">Score</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      {/* Technologies */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-700 mb-2">Technologies</p>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, tidx) => (
                              <span
                                key={tidx}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-700 mb-2">Stats</p>
                        <div className="text-xs sm:text-sm text-slate-600 space-y-1">
                          {project.total_commits > 0 && (
                            <p><strong>Total commits:</strong> {project.total_commits}</p>
                          )}
                          {project.your_commits > 0 && (
                            <p><strong>His commits:</strong> {project.your_commits}</p>
                          )}
                          {project.visibility && (
                            <p> {project.visibility}</p>
                          )}
                        </div>
                      </div>

                      {/* Link */}
                      {project.github_url && (
                        <div className="flex items-end">
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm"
                          >
                            View on GitHub →
                          </a>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-slate-600">No projects available.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </SharedProfileLayout>
  );
};

export default PublicProfilePage;


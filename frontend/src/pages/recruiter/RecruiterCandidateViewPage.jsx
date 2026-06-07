import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { recruiterService } from '../../api/recruiterService';
import { Card } from '../../components/UI';
import { Footer } from '../../components/Footer';

/**
 * RecruiterCandidateViewPage
 * Detailed read-only view of a candidate from recruiter perspective
 * Features: Tabbed interface, star/unstar, resume viewing, score breakdown
 */
const RecruiterCandidateViewPage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'resume', 'projects'

  useEffect(() => {
    if (isAuthenticated && user?.role === 'recruiter' && candidateId) {
      loadCandidateDetail();
    }
  }, [isAuthenticated, user, candidateId]);

  const loadCandidateDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await recruiterService.getCandidateDetail(candidateId);
      const candidateData = response?.data || response;

      setCandidate(candidateData);
      setIsStarred(candidateData?.isStarred || false);
    } catch (err) {
      console.error('Failed to load candidate:', err);
      setError('Failed to load candidate details');
    } finally {
      setLoading(false);
    }
  };

  const handleStarToggle = async () => {
    try {
      setIsToggling(true);

      if (isStarred) {
        await recruiterService.unstarCandidate(candidateId);
        setIsStarred(false);
      } else {
        await recruiterService.starCandidate(candidateId);
        setIsStarred(true);
      }
    } catch (err) {
      console.error('Failed to update star status:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!candidate?.resume_url) return;
    
    try {
      // Import axios instance with authentication
      const { default: axiosInstance } = await import('../../api/axios');
      
      // Fetch file as blob with proper auth headers
      const response = await axiosInstance.get(
        `/api/recruiter/candidates/${candidateId}/resume/download`,
        { responseType: 'blob' }
      );
      
      // Extract filename from content-disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `${candidate?.name}_resume.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);  
        if (match) fileName = match[1];
      }
      
      // Create blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  if (!isAuthenticated || user?.role !== 'recruiter') {
    return (
      <div className="p-6">
        <p className="text-slate-600">Access denied. This page is for recruiters only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Card className="p-3 sm:p-4 md:p-6 lg:p-8 animate-pulse">
            <div className="space-y-4">
              <div className="h-12 bg-slate-200 rounded w-2/3"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Card className="p-8">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Candidate not found'}</p>
              <button
                onClick={() => navigate('/recruiter/search')}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Back to Search
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-grow py-3 sm:py-4 md:py-6 lg:py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/recruiter/search')}
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm"
        >
          ← Back to search
        </button>

        {/* Header with Profile and Actions */}
        <Card className="p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold">{getInitials(candidate.name)}</span>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900">{candidate.name}</h1>
                </div>
                <p className="text-sm text-slate-600 mb-1">{candidate.user_id?.email || 'No email'}</p>
                <p className="text-slate-600 mb-3">{candidate.university || 'N/A'}</p>
                <div className="flex items-center gap-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getTierColor(candidate.tier)}`}>
                    {candidate.tier || 'Not Rated'}
                  </span>
                  {candidate.github_verified && (
                    <span className="text-green-600 font-medium text-sm flex items-center gap-1">
                      ✓ GitHub Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleStarToggle}
                disabled={isToggling}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isStarred
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                } disabled:opacity-50`}
              >
                {isStarred ? '⭐ Starred' : '☆ Star'}
              </button>
              {candidate.resume_url && (
                <button
                  onClick={handleDownloadResume}
                  className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all"
                >
                  ↓ Download resume
                </button>
              )}
            </div>
          </div>

          {/* Overall Score */}
          <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Overall Score</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-blue-600">{Math.round(candidate.score || 0)}</p>
              <p className="text-sm text-slate-600">/100</p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-4 sm:mb-6 md:mb-8 overflow-x-auto">
          <div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-8 flex-nowrap">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              Details + skills
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'resume'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              Resume + ATS score
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
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
          <div className="space-y-8">
            {/* Two Column Layout: Personal Info + Score Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Personal Info */}
              <Card className="p-3 sm:p-4 md:p-6 lg:p-8">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 md:mb-6">Personal info</h3>
                <div className="space-y-4">
                  {candidate.education?.degree && (
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Degree</p>
                      <p className="text-slate-900 font-medium mt-1">{candidate.education.degree}</p>
                    </div>
                  )}
                  {candidate.education?.institution && (
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Institution</p>
                      <p className="text-slate-900 font-medium mt-1">{candidate.education.institution}</p>
                    </div>
                  )}
                  {candidate.education?.graduation_year && (
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Graduation year</p>
                      <p className="text-slate-900 font-medium mt-1">{candidate.education.graduation_year || candidate.education.year}</p>
                    </div>
                  )}
                  {candidate.github_verified && (
                    <div>
                      <p className="text-sm text-slate-600 font-medium">GitHub status</p>
                      <p className="text-green-600 font-medium mt-1">✓ Verified</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Right: Score Breakdown */}
              {candidate.scoreBreakdown && (
                <Card className="p-3 sm:p-4 md:p-6 lg:p-8">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 md:mb-6">Score breakdown</h3>
                  <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
                    {/* Skills */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-700">Skills</p>
                        <p className="text-sm font-bold text-slate-900">
                          {candidate.scoreBreakdown.skills || 0}/40
                        </p>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${Math.min((candidate.scoreBreakdown.skills || 0) / 40 * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Resume */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-700">Resume</p>
                        <p className="text-sm font-bold text-slate-900">
                          {candidate.scoreBreakdown.resume || 0}/30
                        </p>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-full rounded-full"
                          style={{ width: `${Math.min((candidate.scoreBreakdown.resume || 0) / 30 * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Projects */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-700">Projects</p>
                        <p className="text-sm font-bold text-slate-900">
                          {candidate.scoreBreakdown.projects || 0}/30
                        </p>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: `${Math.min((candidate.scoreBreakdown.projects || 0) / 30 * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">Total</p>
                        <p className="text-lg font-bold text-slate-900">
                          {Math.round(candidate.score || 0)}/100
                        </p>
                      </div>
                      
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Skills with Sub-scores */}
            {candidate.skills && candidate.skills.length > 0 && (
              <Card className="p-3 sm:p-4 md:p-6 lg:p-8">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 md:mb-6">Skills — with sub-scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {candidate.skills.slice(0, 6).map((skill, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      {/* Skill Name & Overall Score */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-slate-900">{skill.name}</h4>
                        <span className="text-2xl font-bold text-blue-600">{Math.round(skill.sub_score || 0)}</span>
                      </div>

                      {/* Overall Progress Bar */}
                      <div className="mb-4">
                        <div className="h-2 bg-slate-200 rounded-full">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.min(skill.sub_score || 0, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Sub-score Breakdown */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">📊 Project Score</span>
                          <span className="font-semibold text-slate-900">{Math.round(skill.project_score || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">📄 Resume Score</span>
                          <span className="font-semibold text-slate-900">{Math.round(skill.resume_score || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">🏷️ Declared Score</span>
                          <span className="font-semibold text-slate-900">{Math.round(skill.decl_score || 0)}</span>
                        </div>
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
          <div className="space-y-8">
            {candidate.resumeScoreDetails ? (
              <>
                {/* KPI Analysis Section - 5 Components */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-8">
                  <h3 className="text-lg font-semibold text-primary-dark mb-4">KPI Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* ATS Score */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs font-medium text-blue-600 mb-1">ATS Score</p>
                      <p className="text-3xl font-bold text-blue-900">{Math.round(candidate.resumeScoreDetails.atsScore || 0)}</p>
                      <p className="text-xs text-blue-700 mt-2">Out of 100</p>
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
                <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-8">
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
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

                {/* ATS Score Breakdown Donut Chart + Signal Strength */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: ATS Score Breakdown */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-8">
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
                  <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-8">
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

                {/* Profile Balance - Radar Chart */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-8">
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
                <p className="text-slate-600">Resume scoring not available yet. Score the resume to see detailed analysis.</p>
                {candidate.resume_url && (
                  <button
                    onClick={handleDownloadResume}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    View Resume
                  </button>
                )}
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: PROJECTS */}
        {activeTab === 'projects' && (
          <div>
            {candidate.projects && candidate.projects.length > 0 ? (
              <div className="space-y-6">
                {candidate.projects.map((project, idx) => (
                  <Card key={idx} className="p-4 sm:p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 mb-6">
                      <div className="flex-1 min-w-0">
                        {/* Project Header */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <h3 className="text-base sm:text-lg font-semibold text-slate-900 break-words">{project.title}</h3>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold flex-shrink-0">
                            ✓ GitHub Verified
                          </span>
                        </div>

                        {/* GitHub Link */}
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs sm:text-sm mb-3 block break-all"
                          >
                            {project.github_url}
                          </a>
                        )}

                        {/* Description */}
                        <p className="text-slate-600 mb-4 text-xs sm:text-sm break-words">{project.description}</p>

                        {/* Technologies */}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                            {project.technologies.map((tech, tidx) => (
                              <span
                                key={tidx}
                                className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                          <div className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                            <p className="text-xs text-slate-600 font-medium">Total Commits</p>
                            <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">{project.total_commits || 0}</p>
                          </div>
                          <div className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                            <p className="text-xs text-slate-600 font-medium">His Commits</p>
                            <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">{project.your_commits || 0}</p>
                          </div>
                          <div className="border-l-4 border-slate-400 pl-3 sm:pl-4">
                            <p className="text-xs text-slate-600 font-medium">Visibility</p>
                            <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">{project.visibility}</p>
                          </div>
                          <div className={`border-l-4 pl-3 sm:pl-4 ${project.has_readme ? 'border-green-500' : 'border-red-500'}`}>
                            <p className="text-xs text-slate-600 font-medium">README</p>
                            <p className={`text-base sm:text-lg font-bold mt-1 ${project.has_readme ? 'text-green-600' : 'text-red-600'}`}>
                              {project.has_readme ? 'Yes' : 'No'}
                            </p>
                          </div>
                          <div className="border-l-4 border-slate-400 pl-3 sm:pl-4">
                            <p className="text-xs text-slate-600 font-medium">Last Push</p>
                            <p className="text-base sm:text-lg font-bold text-slate-900 mt-1 break-words">{project.last_push}</p>
                          </div>
                        </div>
                      </div>

                      {/* Project Score */}
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-6 text-center">
                          <p className="text-xs text-blue-600 font-medium uppercase mb-2">Score</p>
                          <p className="text-3xl sm:text-4xl font-bold text-blue-600">{project.score}</p>
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown (if available) */}
                    {project.score_breakdown && Object.keys(project.score_breakdown).length > 0 && (
                      <div className="border-t border-slate-200 pt-4">
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-3">Score Breakdown</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                          {Object.entries(project.score_breakdown).map(([key, value]) => (
                            <div key={key} className="bg-slate-50 rounded p-2 sm:p-3">
                              <p className="text-xs text-slate-600 capitalize">{key.replace(/_/g, ' ')}</p>
                              <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">{Math.round(value || 0)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-slate-600 mb-3">No projects added yet</p>
                <p className="text-xs text-slate-500">Projects from GitHub will appear here once verified</p>
              </Card>
            )}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default RecruiterCandidateViewPage;

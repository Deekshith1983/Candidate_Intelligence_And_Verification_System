import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { candidateService } from '../../api/candidateService';
import { useSocketNotifications } from '../../hooks/useSocketNotifications';
import { ToastContainer } from '../../components/NotificationToast';
import { Footer } from '../../components/Footer';

export default function CandidateDashboardPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [scoreCard, setScoreCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState({
    profileViews: 0,
    starsReceived: 0,
    lastScored: null,
    verifiedProjects: 0,
  });

  // Real-time socket notifications
  const { notifications, removeNotification } = useSocketNotifications(
    authUser?._id,
    !!authUser
  );

  // Update activity data when a real-time notification is received
  useEffect(() => {
    if (notifications.length > 0) {
      // Immediately fetch updated profile to show new stats
      loadDashboardData();
    }
  }, [notifications.length]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real-time profile activity polling (5-second interval)
  useEffect(() => {
    if (!authUser) return;

    const activityInterval = setInterval(async () => {
      try {
        const profileResponse = await candidateService.getProfile();
        if (profileResponse?.success) {
          const profileData = profileResponse.data;
          
          // Update score card
          setScoreCard({
            skills: profileData.skills_score || 0,
            resume: profileData.resume_score || 0,
            projects: profileData.projects_score || 0,
            total: profileData.total_score || 0,
          });

          // Count verified projects
          const verifiedCount = (profileData.projects || []).filter(p => p.verified).length;
          
          // Update activity data
          setActivity({
            profileViews: profileData.profile_views || 0,
            starsReceived: profileData.profile_stars || 0,
            lastScored: profileData.last_scored ? new Date(profileData.last_scored) : null,
            verifiedProjects: verifiedCount,
          });
        }
      } catch (err) {
        console.warn('[ActivityPolling] Failed to fetch profile activity:', err.message);
        // Don't show error for polling failures, silently retry
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(activityInterval);
  }, [authUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load candidate profile
      const profileResponse = await candidateService.getProfile();
      if (profileResponse?.success) {
        const profileData = profileResponse.data;
        setProfile(profileData);
        
        // Extract score data
        setScoreCard({
          skills: profileData.skills_score || 0,
          resume: profileData.resume_score || 0,
          projects: profileData.projects_score || 0,
          total: profileData.total_score || 0,
        });

        // Count verified projects
        const verifiedCount = (profileData.projects || []).filter(p => p.verified).length;
        
        // Extract activity data
        setActivity({
          profileViews: profileData.profile_views || 0,
          starsReceived: profileData.profile_stars || 0,
          lastScored: profileData.last_scored ? new Date(profileData.last_scored) : null,
          verifiedProjects: verifiedCount,
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate tier badge based on total score
  const getTierBadge = (score) => {
    if (score >= 75) return { label: 'High Potential', color: 'bg-green-100 text-green-700' };
    if (score >= 50) return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-700' };
  };

  // Format time since last scored
  const getTimeSinceScored = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    if (days < 30) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const tier = getTierBadge(scoreCard?.total || 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Real-time notification toasts */}
      <ToastContainer 
        notifications={notifications} 
        onDismiss={removeNotification}
      />

      <div className="flex-grow py-3 sm:py-4 md:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Welcome back, {profile?.user_id?.username || 'Candidate'}!</h1>
          <p className="text-xs text-slate-600 mt-1">Here's your profile overview and activity</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* Credibility Score Circle */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center">
            <div className="relative w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 mb-2 sm:mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="2"
                />
                {/* Progress circle */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray={`${(scoreCard?.total || 0) / 100 * 100}, 100`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{scoreCard?.total || 0}</p>
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">Credibility score</p>
            <span className={`inline-block mt-2 sm:mt-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${tier.color}`}>
              {tier.label}
            </span>
          </div>

          {/* Skills Score */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 shadow-soft-lg p-3 sm:p-4 md:p-6">
            <p className="text-xs font-semibold text-blue-600 mb-1 sm:mb-2">Skills</p>
            <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600 mb-2 sm:mb-3 md:mb-4">
              {scoreCard?.skills || 0}<span className="text-xs sm:text-lg text-blue-500">/40</span>
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(scoreCard?.skills || 0) / 40 * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Resume Score */}
          <div className="bg-green-50 rounded-xl border border-green-200 shadow-soft-lg p-3 sm:p-4 md:p-6">
            <p className="text-xs font-semibold text-green-600 mb-1 sm:mb-2">Resume</p>
            <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 mb-2 sm:mb-3 md:mb-4">
              {scoreCard?.resume || 0}<span className="text-xs sm:text-lg text-green-500">/30</span>
            </p>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${Math.min((scoreCard?.resume || 0), 30) / 30 * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Projects Score */}
          <div className="bg-purple-50 rounded-xl border border-purple-200 shadow-soft-lg p-3 sm:p-4 md:p-6">
            <p className="text-xs font-semibold text-purple-600 mb-1 sm:mb-2">Projects</p>
            <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">
              {scoreCard?.projects || 0}<span className="text-xs sm:text-lg text-purple-500">/30</span>
            </p>
            <p className="text-xs text-slate-600 font-semibold">
              Verified: <span className="font-bold text-purple-600">{activity.verifiedProjects}</span>
            </p>
          </div>
        </div>

        {/* Score Breakdown + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {/* Score Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-3 sm:p-4 md:p-6 lg:p-8">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-3 sm:mb-4 md:mb-6">Score breakdown</h3>
            
            <div className="space-y-6">
              {/* Skills Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Skills (40%)</span>
                  <span className="text-sm font-bold text-slate-900">{scoreCard?.skills || 0}/40</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${(scoreCard?.skills || 0) / 40 * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Resume Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Resume (30%)</span>
                  <span className="text-sm font-bold text-slate-900">{scoreCard?.resume || 0}/30</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((scoreCard?.resume || 0), 30) / 30 * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Projects Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Projects (30%)</span>
                  <span className="text-sm font-bold text-slate-900">{scoreCard?.projects || 0}/30</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${(scoreCard?.projects || 0) / 30 * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Activity */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Profile activity</h3>
            
            <div className="space-y-5">
              {/* Profile Views */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-sm text-slate-600 font-medium">Profile views</span>
                <span className="text-2xl font-bold text-slate-900">{activity.profileViews}</span>
              </div>

              {/* Stars Received */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-sm text-slate-600 font-medium">Stars received</span>
                <span className="text-2xl font-bold text-slate-900">{activity.starsReceived}</span>
              </div>

              {/* Last Scored */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-sm text-slate-600 font-medium">Last scored</span>
                <span className="text-sm font-semibold text-slate-900">
                  {getTimeSinceScored(activity.lastScored)}
                </span>
              </div>

              {/* GitHub Status */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-sm text-slate-600 font-medium">GitHub status</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  {authUser?.github_verified ? 'Verified' : 'Not connected'}
                </span>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => navigate('/candidate/profile')}
                className="w-full mt-6 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold transition-colors"
              >
                Edit profile
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}

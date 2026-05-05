import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { candidateService } from '../../api/candidateService';
import { projectService } from '../../api/projectService';
import { triggerScore } from '../../api/score.api';
import { InlineSkillEditor } from '../../components/candidate/InlineSkillEditor';
import { InlineResumeEditor } from '../../components/candidate/InlineResumeEditor';
import { ResumeScoreDashboard } from '../../components/candidate/ResumeScoreDashboard';
import { Footer } from '../../components/Footer';

const ProfilePageNew = () => {
  const navigate = useNavigate();
  const { user: authUser, login } = useAuth();

  // State management
  const [profile, setProfile] = useState(null);
  const [scoreCard, setScoreCard] = useState(null);
  const [resumeScore, setResumeScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalTab, setEditModalTab] = useState('basic');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const [verifyingGithub, setVerifyingGithub] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    education: null,
    about: '',
    skills: [],
  });

  // Project form state
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    github_link: '',
    tech_stack: [],
  });
  const [projectTechInput, setProjectTechInput] = useState('');

  // Load profile data on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load profile
      const profileRes = await candidateService.getProfile();

      setProfile(profileRes.data);
      // Set scoreCard from profile data - extract scores
      setScoreCard({
        skills: profileRes.data?.skills_score || 0,
        resume: profileRes.data?.resume_score || 0,
        projects: profileRes.data?.projects_score || 0,
        total: profileRes.data?.total_score || 0,
      });

      // Initialize edit form
      setEditForm({
        education: profileRes.data?.education || null,
        about: profileRes.data?.about || '',
        skills: profileRes.data?.skills || [],
      });

      // Load projects
      try {
        const projectsRes = await projectService.getProjects();
        const projectsList = projectsRes.data || projectsRes || [];
        setProjects(Array.isArray(projectsList) ? projectsList : []);
      } catch (projErr) {
        console.error('Failed to load projects:', projErr);
        setProjects([]);
      }

      // Load resume score
      try {
        const resumeRes = await candidateService.getResumeScore();
        setResumeScore(resumeRes.data);
      } catch (resumeErr) {
        console.error('Failed to load resume score:', resumeErr);
        setResumeScore(null);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGithub = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/auth/github`;
  };

  const handleVerifyGithub = async () => {
    try {
      setVerifying(true);
      setError(null);

      const response = await candidateService.verifyGithub();

      if (response.success) {
        setSuccessMessage('GitHub verification successful! All features unlocked.');
        
        // Fetch latest user data from /api/auth/me to get updated verification flags
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        
        try {
          const userResponse = await fetch(`${apiUrl}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            // Update Auth context with latest user data including github_verification_locked
            login(userData.user, token);
          }
        } catch (err) {
          console.error('Failed to fetch updated user data:', err);
        }
        
        // Reload profile to get updated verification status
        await loadProfileData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to verify GitHub');
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setVerifying(true);
      setError(null);

      let updateData = {};

      if (editModalTab === 'basic') {
        updateData = {
          education: editForm.education,
          about: editForm.about,
        };
      } else if (editModalTab === 'skills') {
        updateData = {
          skills: editForm.skills.map(skill => typeof skill === 'object' ? skill : { name: skill }),
        };
      }

      const response = await candidateService.updateProfile(updateData);

      if (response.success) {
        // ✅ FIXED: Immediately update state with returned data and scores
        // Backend now calls orchestrate automatically, so scores are fresh
        setProfile(response.data);
        
        // Update score card if scores were recalculated
        setScoreCard({
          skills: response.data?.skills_score || 0,
          resume: response.data?.resume_score || 0,
          projects: response.data?.projects_score || 0,
          total: response.data?.total_score || 0,
        });

        // Update edit form for display
        setEditForm({
          education: response.data?.education || null,
          about: response.data?.about || '',
          skills: response.data?.skills || [],
        });
        
        setShowEditModal(false);
        setSuccessMessage('Profile and skill scores updated successfully!');
        
        // Reload full data in background for complete sync
        setTimeout(() => {
          loadProfileData().catch(err => console.error('Background reload failed:', err));
        }, 800);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setVerifying(false);
    }
  };

  // Handle skill saving from inline editor
  const handleSaveSkills = async (skills) => {
    try {
      setVerifying(true);
      setError(null);

      const updateData = {
        skills: skills.map(skill => typeof skill === 'object' ? skill : { name: skill }),
      };

      const response = await candidateService.updateProfile(updateData);

      if (response.success) {
        // ✅ FIXED: Immediately update state with returned data and scores
        // Backend now calls orchestrate automatically after skills update
        setProfile(response.data);
        
        // Update score card with fresh calculations
        setScoreCard({
          skills: response.data?.skills_score || 0,
          resume: response.data?.resume_score || 0,
          projects: response.data?.projects_score || 0,
          total: response.data?.total_score || 0,
        });

        setSuccessMessage('Skills updated and scored successfully!');
        
        // Reload full data in background for complete sync
        setTimeout(() => {
          loadProfileData().catch(err => console.error('Background reload failed:', err));
        }, 800);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update skills');
    } finally {
      setVerifying(false);
    }
  };

  // Handle resume upload from inline editor
  const handleResumeUpload = async (file) => {
    try {
      setResumeUploading(true);
      setError(null);

      // Pass file directly - candidateService.uploadResume will create FormData
      const response = await candidateService.uploadResume(file);

      if (response.success) {
        // ✅ FIXED: Extract FULL KPI breakdown from backend response
        // Backend now returns ats_breakdown with all component scores
        const atsBreakdown = response.data.ats_breakdown || {
          section_score: 0,
          keyword_score: 0,
          format_score: 0,
          length_score: 0,
          ats_score: 0,
          resume_contribution: 0
        };
        
        const sectionPresence = response.data.section_presence || {};
        
        // ✅ FIXED: Immediately update state with new resume and recalculated scores
        // Backend now calls orchestrate automatically, so scores are fresh
        setProfile(prev => ({
          ...prev,
          resume_url: response.data.resume_url,
          resume_score: atsBreakdown.resume_contribution || response.data.scores?.resume_score || 0,
          skills_score: response.data.scores?.skills_score || 0,
          projects_score: response.data.scores?.projects_score || 0,
          total_score: response.data.scores?.total_score || 0,
          ats_breakdown: atsBreakdown,
          section_presence: sectionPresence,
          skills: response.data.skills || prev.skills
        }));

        // ✅ FIXED: Update score card with ALL KPI component values
        // Use backend values ONLY, no local calculations
        setScoreCard({
          skills: response.data.scores?.skills_score || 0,
          resume: atsBreakdown.resume_contribution || 0,
          projects: response.data.scores?.projects_score || 0,
          total: response.data.scores?.total_score || 0,
          // ✅ Also store KPI component scores for dashboard display
          section_score: atsBreakdown.section_score || 0,
          keyword_score: atsBreakdown.keyword_score || 0,
          format_score: atsBreakdown.format_score || 0,
          ats_score: atsBreakdown.ats_score || 0
        });

        setSuccessMessage('Resume uploaded and skill scores recalculated!');
        
        // Reload full data in background to ensure complete sync
        setTimeout(() => {
          loadProfileData().catch(err => console.error('Background reload failed:', err));
        }, 1000);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setResumeUploading(false);
    }
  };

  // Handle resume score submission
  const handleResumeScoreSubmit = async () => {
    try {
      await loadProfileData();
      setSuccessMessage('Resume scored successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to load resume score');
    }
  };

  // Handle resume download
  const handleDownloadResume = async () => {
    if (!profile?.resume_url) return;
    
    try {
      // Import axios instance with authentication
      const { default: axiosInstance } = await import('../../api/axios');
      
      // Fetch file as blob with proper auth headers
      const response = await axiosInstance.get(
        '/api/candidate/resume-download',
        { responseType: 'blob' }
      );
      
      // Extract filename from content-disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `resume_${profile?._id}.pdf`;
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

  const handleAddProject = async () => {
    try {
      setVerifying(true);
      setError(null);

      const response = await projectService.createProject(projectForm);

      if (response.project || response.message) {
        setSuccessMessage('Project added and verified successfully!');
        setShowProjectModal(false);
        setProjectForm({
          title: '',
          description: '',
          github_link: '',
          tech_stack: [],
        });
        setProjectTechInput('');
        // Reload projects
        await loadProfileData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to add project');
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      setVerifying(true);
      setError(null);

      const response = await projectService.deleteProject(projectId);

      if (response) {
        setSuccessMessage('Project deleted successfully!');
        // Reload projects
        await loadProfileData();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    } finally {
      setVerifying(false);
    }
  };

  const handleAddTechStack = () => {
    if (projectTechInput.trim()) {
      setProjectForm({
        ...projectForm,
        tech_stack: [...projectForm.tech_stack, projectTechInput.trim()],
      });
      setProjectTechInput('');
    }
  };

  const handleRemoveTechStack = (index) => {
    setProjectForm({
      ...projectForm,
      tech_stack: projectForm.tech_stack.filter((_, i) => i !== index),
    });
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      const newSkill = {
        name: skillInput.trim(),
        sub_score: 0,
        project_score: 0,
        resume_score: 0,
        decl_score: 20,
      };
      setEditForm({
        ...editForm,
        skills: [...editForm.skills, newSkill],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter((_, i) => i !== index),
    });
  };

  /**
   * Handle Share Profile
   * Generate or get shareable link and copy to clipboard
   */
  const handleShareProfile = async () => {
    try {
      setShareLoading(true);
      const response = await candidateService.generateShareLink();
      if (response.success) {
        const shareUrl = response.data.shareUrl;
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl);
        setSuccessMessage(`✅ Profile link copied to clipboard!\n${shareUrl}`);
        setShareStatus(response.data);
        // Clear message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      setError(error.message || 'Failed to generate share link');
    } finally {
      setShareLoading(false);
    }
  };

  // Check if GitHub is verified
  const isGithubVerified = authUser?.github_verified && authUser?.github_verification_locked;
  const isVerificationLocked = authUser?.github_verification_locked;

  // Feature lock check
  const canAccessRestrictedFeatures = isGithubVerified;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* GitHub Connection Alert */}
        {!isGithubVerified && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-yellow-900">
                Connect your GitHub account to unlock Resume ATS scoring and Project verification
              </h3>
              <p className="text-sm text-yellow-800 mt-2">
                {isVerificationLocked
                  ? 'Complete the verification below'
                  : 'Start by connecting your GitHub account'}
              </p>
            </div>
            <button
              onClick={handleConnectGithub}
              className="ml-4 px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 whitespace-nowrap"
            >
              Connect GitHub
            </button>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-8 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {authUser?.username?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-primary-dark">{authUser?.username}</h2>
                  {isGithubVerified ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                      Not Verified
                    </span>
                  )}
                </div>
                <p className="text-slate-600">
                  {authUser?.email}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {profile?.education?.degree || 'No degree'} • {profile?.education?.institution || 'No institution'}
                </p>
              </div>
            </div>
            <div className="text-right space-y-3">
              <div className="text-4xl font-bold text-primary-dark mb-2">
                {scoreCard?.total || 0} / 100
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  Edit profile
                </button>
                {isGithubVerified && (
                  <button
                    onClick={handleShareProfile}
                    disabled={shareLoading}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 font-semibold transition-colors"
                  >
                    {shareLoading ? 'Sharing...' : '🔗 Share'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Button - Show after GitHub OAuth but before verification */}
        {authUser?.github_verified && !authUser?.github_verification_locked && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-blue-900">Complete GitHub Verification</h3>
              <p className="text-sm text-blue-800 mt-2">
                Click the button below to verify your GitHub connection and unlock all features
              </p>
            </div>
            <button
              onClick={handleVerifyGithub}
              disabled={verifying}
              className="ml-4 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {verifying ? 'Verifying...' : 'Verify GitHub'}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-primary-dark text-primary-dark'
                  : 'border-transparent text-slate-600 hover:text-primary-dark'
              }`}
            >
              Details + Skills
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              disabled={!canAccessRestrictedFeatures}
              className={`pb-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'resume'
                  ? 'border-primary-dark text-primary-dark'
                  : 'border-transparent text-slate-600 hover:text-primary-dark'
              } ${!canAccessRestrictedFeatures ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Resume + ATS score {!canAccessRestrictedFeatures && '🔒'}
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              disabled={!canAccessRestrictedFeatures}
              className={`pb-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'projects'
                  ? 'border-primary-dark text-primary-dark'
                  : 'border-transparent text-slate-600 hover:text-primary-dark'
              } ${!canAccessRestrictedFeatures ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Projects {!canAccessRestrictedFeatures && '🔒'}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-8">
              <h3 className="text-xl font-semibold text-primary-dark mb-6">Personal Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Degree</p>
                  <p className="font-semibold text-slate-900">
                    {profile?.education?.degree || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Institution</p>
                  <p className="font-semibold text-slate-900">
                    {profile?.education?.institution || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Graduation Year</p>
                  <p className="font-semibold text-slate-900">
                    {profile?.education?.year || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">GitHub Status</p>
                  <p className="font-semibold text-slate-900">
                    {isGithubVerified ? '✓ Connected & Verified' : 'Not connected'}
                  </p>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-8">
              <h3 className="text-xl font-semibold text-primary-dark mb-6">Score Breakdown</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">Skills</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {scoreCard?.skills || 0}/40
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(scoreCard?.skills || 0) / 40 * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">Resume</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {Math.min(scoreCard?.resume || 0, 30)}/30
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min((scoreCard?.resume || 0), 30) / 30 * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">Projects</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {scoreCard?.projects || 0}/30
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(scoreCard?.projects || 0) / 30 * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-lg font-bold text-primary-dark">
                    Total: {scoreCard?.total || 0} / 100
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills Section with Inline Editor */}
        {activeTab === 'details' && (
          <div className="mt-8">
            <InlineSkillEditor
              skills={profile?.skills || []}
              scoreCard={scoreCard}
              loading={verifying}
              onSave={handleSaveSkills}
            />
          </div>
        )}

        {activeTab === 'resume' && (
          <div>
            {!canAccessRestrictedFeatures ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-8">
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Feature Locked</h3>
                  <p className="text-slate-600 mb-6">
                    Please complete GitHub verification to access Resume features
                  </p>
                  <button
                    onClick={handleConnectGithub}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect GitHub
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Inline Resume Editor */}
                <InlineResumeEditor
                  resumeUrl={profile?.resume_url}
                  resumeScore={resumeScore}
                  scoreCard={scoreCard}
                  loading={resumeUploading}
                  onUpload={handleResumeUpload}
                  onScoreSubmit={handleResumeScoreSubmit}
                  profileId={profile?._id}
                />

                {/* Resume Score Dashboard - New Redesigned Layout */}
                <ResumeScoreDashboard 
                  resumeScore={resumeScore}
                  scoreCard={scoreCard}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-soft-lg p-8">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-primary-dark">Projects</h3>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  + Add project
                </button>
              </div>

              {projects.length === 0 ? (
                <p className="text-slate-600 text-center py-12">No projects added yet. Click the button above to add your first project!</p>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project._id} className="bg-slate-50 rounded-lg border border-slate-200 p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-primary-dark">{project.title}</h4>
                          <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                            {project.github_link}
                          </a>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-dark">{project.project_score || 0}</div>
                          <p className="text-xs text-slate-500">Project Score</p>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm mb-3">{project.description}</p>

                      {/* Tech Stack */}
                      {project.tech_stack && project.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.tech_stack.map((tech, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded-full text-xs font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Project Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                        <div>
                          <p className="text-slate-500">Total Commits</p>
                          <p className="font-semibold text-slate-900">{project.total_commits || 0}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Your Commits</p>
                          <p className="font-semibold text-slate-900">{project.user_commits || 0}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Visibility</p>
                          <p className="font-semibold text-slate-900">{project.is_public ? 'Public' : 'Private'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Status</p>
                          <p className={`font-semibold ${project.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                            {project.verified ? '✓ Verified' : 'Pending'}
                          </p>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                        disabled={verifying}
                        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary-dark">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Tabs */}
              <div className="flex gap-4 border-b border-slate-200">
                <button
                  onClick={() => setEditModalTab('basic')}
                  className={`pb-4 px-4 font-semibold border-b-2 transition-colors ${
                    editModalTab === 'basic'
                      ? 'border-primary-dark text-primary-dark'
                      : 'border-transparent text-slate-600 hover:text-primary-dark'
                  }`}
                >
                  Basic Info
                </button>
              </div>

              {/* Form Fields */}
              {editModalTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={authUser?.name || ''}
                      disabled
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={authUser?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-100"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Degree
                      </label>
                      <input
                        type="text"
                        value={editForm.education?.degree || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            education: { ...editForm.education, degree: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                        placeholder="B.Tech Computer Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={editForm.education?.institution || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            education: { ...editForm.education, institution: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                        placeholder="MIT"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Graduation Year
                      </label>
                      <input
                        type="number"
                        value={editForm.education?.year || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            education: { ...editForm.education, year: parseInt(e.target.value) },
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      About
                    </label>
                    <textarea
                      value={editForm.about}
                      onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      {editForm.about.length}/500 characters
                    </p>
                  </div>
                </div>
              )}





            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-end gap-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={verifying}
                className="px-6 py-2 bg-primary-dark text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {verifying ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary-dark">Add a project</h2>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project title
                </label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                  placeholder="Project title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  GitHub repository URL
                </label>
                <input
                  type="url"
                  value={projectForm.github_link}
                  onChange={(e) => setProjectForm({ ...projectForm, github_link: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Add tech stack (press Enter)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={projectTechInput}
                    onChange={(e) => setProjectTechInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTechStack();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                  <button
                    onClick={handleAddTechStack}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  >
                    Add
                  </button>
                </div>
                {projectForm.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {projectForm.tech_stack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {tech}
                        <button
                          onClick={() => handleRemoveTechStack(idx)}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project description (max 500 chars)
                </label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                  placeholder="Describe your project..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-slate-500 mt-2">
                  {projectForm.description.length}/500 characters
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-end gap-4">
              <button
                onClick={() => setShowProjectModal(false)}
                className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                disabled={verifying || !projectForm.title || !projectForm.github_link || !projectForm.description}
                className="px-6 py-2 bg-primary-dark text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {verifying ? 'Submitting...' : 'Submit and verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </div>
  );
};

export default ProfilePageNew;

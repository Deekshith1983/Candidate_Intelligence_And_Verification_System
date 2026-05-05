const Candidate = require('../models/Candidate');
const ResumeScore = require('../models/ResumeScore');
const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');

/**
 * PUBLIC CONTROLLER
 * Handles public endpoints (no authentication required)
 */

/**
 * GET /api/public/profile/:shareId
 * Get candidate's public profile by shareId
 * Returns the same data as recruiter view but without modifying profile views/activity
 */
exports.getPublicProfile = async (req, res) => {
  try {
    const { shareId } = req.params;

    // Validate shareId
    if (!shareId || shareId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid share ID'
      });
    }

    // Find candidate by shareId
    const candidate = await Candidate.findOne({ 
      shareId: shareId,
      sharing_enabled: true  // Only return if sharing is enabled
    }).populate('user_id', 'username email');
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or unavailable'
      });
    }

    // Get resume score details
    const resumeScore = await ResumeScore.findOne({ candidate_id: candidate._id });

    // Get all projects for the candidate
    const projects = await Project.find({ candidate_id: candidate._id });

    // Transform candidate data to match recruiter view (without recruiting actions)
    const candidateObj = candidate.toObject ? candidate.toObject() : candidate;
    const transformedCandidate = {
      ...candidateObj,
      name: candidateObj.user_id?.username || 'Unknown',
      university: candidateObj.education?.institution || 'N/A',
      score: candidateObj.total_score || 0,
      bio: candidateObj.about || '',  // ✅ Include bio/about from candidate profile
      topSkills: candidateObj.skills?.slice(0, 5).map(s => s.name) || [],
      education: {
        ...candidateObj.education,
        graduation_year: candidateObj.education?.year || candidateObj.education?.graduation_year
      },
      scoreBreakdown: {
        resume: candidateObj.resume_score || 0,
        skills: candidateObj.skills_score || 0,
        projects: candidateObj.projects_score || 0
      },
      resumeScoreDetails: resumeScore ? {
        // Old fields (for backward compatibility)
        final_score: resumeScore.final_score || 0,
        detected_role: resumeScore.detected_role || 'Unknown',
        dimensions: resumeScore.dimension_scores || {},
        penalties: resumeScore.penalties_applied || {},
        // KPI data for clean dashboard
        atsScore: resumeScore.ats_breakdown?.ats_score || resumeScore.final_score || 0,
        sectionScore: resumeScore.ats_breakdown?.section_score || 0,
        keywordScore: resumeScore.ats_breakdown?.keyword_score || 0,
        formatScore: resumeScore.ats_breakdown?.format_score || 0,
        skillScore: resumeScore.ats_breakdown?.skill_score || 0,
        projectStrength: resumeScore.ats_breakdown?.project_strength || 0,
        resumeContribution: resumeScore.ats_breakdown?.resume_contribution || 0,
        sectionPresence: resumeScore.section_presence || {
          summary: false,
          experience: false,
          education: false,
          skills: false,
          projects: false,
          certifications: false
        },
        // Profile balance radar data
        profileBalance: {
          sectionCompleteness: resumeScore.ats_breakdown?.section_score || 0,
          keywordRelevance: resumeScore.ats_breakdown?.keyword_score || 0,
          formatQuality: resumeScore.ats_breakdown?.format_score || 0,
          skillDepth: resumeScore.ats_breakdown?.skill_score || 0,
          projectStrength: resumeScore.ats_breakdown?.project_strength || 0
        }
      } : null,
      // Add projects
      projects: projects.map(p => ({
        _id: p._id,
        title: p.title,
        description: p.description,
        github_url: p.github_link,
        technologies: p.tech_stack || [],
        total_commits: p.total_commits || 0,
        your_commits: p.user_commits || 0,
        visibility: p.is_public ? 'Public' : 'Private',
        has_readme: p.has_readme,
        last_push: p.last_pushed_at ? new Date(p.last_pushed_at).toLocaleDateString() : 'Unknown',
        score: p.project_score || 0,
        score_breakdown: p.score_breakdown || {}
      }))
    };

    // Do NOT increment profile_views for public profile
    // This keeps the metric clean for recruiter views only

    res.json({
      success: true,
      data: transformedCandidate,
    });
  } catch (error) {
    console.error('Error in getPublicProfile:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/public/profile/:shareId/resume
 * Download resume for shared public profile
 * Validates sharing is enabled before allowing download
 */
exports.downloadPublicResume = async (req, res) => {
  try {
    const { shareId } = req.params;

    // Validate shareId
    if (!shareId || shareId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid share ID'
      });
    }

    // Find candidate by shareId - check if sharing is enabled
    const candidate = await Candidate.findOne({ 
      shareId: shareId,
      sharing_enabled: true
    });
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or unavailable'
      });
    }

    // Check if resume exists
    if (!candidate.resume_url) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // ✅ FIXED: Construct correct resume file path
    // Resumes are stored in: backend/uploads/resumes/filename.pdf
    const resumePath = path.join(__dirname, '../uploads/resumes', candidate.resume_url);

    // Check if file exists
    if (!fs.existsSync(resumePath)) {
      console.error(`Resume file not found at: ${resumePath}`);
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server',
        debug: process.env.NODE_ENV === 'development' ? { path: resumePath } : undefined
      });
    }

    // Get file name
    const fileName = `${candidate.user_id?.username || 'Resume'}_resume.pdf`;

    // Send file
    res.download(resumePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading resume:', err);
      }
    });
  } catch (error) {
    console.error('Error in downloadPublicResume:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const User = require('../models/User');
const Candidate = require('../models/Candidate');
const ResumeScore = require('../models/ResumeScore');
const { scoreResume } = require('../services/atsScorer');
const fs = require('fs').promises;
const path = require('path');

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user_id: req.user.id });
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    // ✅ FETCH PROJECTS for this candidate
    const Project = require('../models/Project');
    const projects = await Project.find({ candidate_id: candidate._id }).sort({ createdAt: -1 });

    // Transform candidate to include projects
    const candidateObj = candidate.toObject ? candidate.toObject() : candidate;
    const responseData = {
      ...candidateObj,
      projects: projects.map(p => ({
        _id: p._id,
        title: p.title,
        description: p.description,
        github_link: p.github_link,
        tech_stack: p.tech_stack || [],
        project_score: p.project_score || 0,
        verified: p.verified,
        score_breakdown: p.score_breakdown || {}
      }))
    };

    res.json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { education, about, skills } = req.body;

    // Validate input
    if (about && about.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'About section must be 500 characters or less'
      });
    }

    // Get existing candidate
    let candidate = await Candidate.findOne({ user_id: req.user.id });
    
    // ✅ If no candidate exists, create one with user_id
    if (!candidate) {
      const newCandidate = await Candidate.create({
        user_id: req.user.id,
        education,
        about,
        skills
      });
      return res.json({ success: true, data: newCandidate });
    }
    
    // Prevent modification of GitHub-related fields if locked
    if (candidate.github_verification_locked) {
      if (req.body.github_verified !== undefined || 
          req.body.github_username !== undefined || 
          req.body.github_access_token !== undefined ||
          req.body.github_verification_locked !== undefined) {
        return res.status(403).json({
          success: false,
          message: 'GitHub verification is locked and cannot be modified'
        });
      }
    }

    // ✅ Update existing candidate
    const updated = await Candidate.findOneAndUpdate(
      { user_id: req.user.id },
      { education, about, skills, last_scored: new Date() },
      { returnDocument: 'after' }
    );

    // ✅ FIXED: Automatically trigger skill score recalculation when skills are updated
    // This ensures skill scores are always fresh when skills change
    const { orchestrate } = require('../services/scoreOrchestrator');
    
    try {
      console.log('[Profile Update] Skills updated, triggering orchestrate for recalculation...');
      const scores = await orchestrate(updated._id);
      console.log('[Profile Update] Orchestrate completed successfully');
      
      // Fetch updated candidate with new scores
      const finalCandidate = await Candidate.findById(updated._id);
      
      res.json({
        success: true,
        message: 'Profile and skill scores updated successfully',
        data: finalCandidate
      });
    } catch (orchestrateError) {
      console.error('[Profile Update] Orchestrate error:', orchestrateError.message);
      // Profile was updated successfully, but scoring failed
      // Still return the updated profile, scoring can retry
      res.json({
        success: true,
        message: 'Profile updated successfully. Skill recalculation encountered an issue.',
        data: updated
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * GITHUB VERIFY
 * Verifies GitHub connection through OAuth and locks the verification
 * After one successful verification, user cannot re-verify
 */
exports.verifyGithub = async (req, res) => {
  try {
    // ✅ FETCH FRESH USER DATA FROM DATABASE (not from old JWT token)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has authenticated with GitHub via OAuth
    if (!user.github_verified || !user.github_access_token) {
      return res.status(403).json({
        success: false,
        message: 'GitHub OAuth not completed. Please authenticate with GitHub first.',
        help: 'Use /api/auth/github to authenticate with your GitHub account'
      });
    }

    // Get or create candidate profile
    let candidate = await Candidate.findOne({ user_id: user._id });

    if (!candidate) {
      // Create new candidate profile with GitHub verification
      candidate = await Candidate.create({
        user_id: user._id,
        github_username: user.githubProfile.username,
        github_access_token: user.github_access_token,
        github_verified: true,
        github_verified_at: new Date(),
        github_verification_locked: true
      });
      
      // ✅ ALSO UPDATE USER MODEL TO LOCK VERIFICATION
      user.github_verification_locked = true;
      await user.save();
    } else if (candidate.github_verification_locked) {
      // GitHub verification already completed and locked
      return res.status(403).json({
        success: false,
        message: 'GitHub verification already completed and locked. Cannot re-verify.',
        data: {
          github_verified: candidate.github_verified,
          github_verified_at: candidate.github_verified_at,
          locked: true
        }
      });
    } else {
      // Update candidate with GitHub verification and lock it
      candidate.github_username = user.githubProfile.username;
      candidate.github_access_token = user.github_access_token;
      candidate.github_verified = true;
      candidate.github_verified_at = new Date();
      candidate.github_verification_locked = true;
      await candidate.save();
    }

    // ✅ ALSO UPDATE USER MODEL TO LOCK VERIFICATION
    user.github_verification_locked = true;
    await user.save();

    res.json({
      success: true,
      message: 'GitHub verified and locked successfully',
      data: {
        github_verified: candidate.github_verified,
        github_username: candidate.github_username,
        github_verified_at: candidate.github_verified_at,
        locked: candidate.github_verification_locked
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPLOAD RESUME
exports.uploadResume = async (req, res, next) => {
  let filePath = null;
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded'
      });
    }

    filePath = req.file.path;

    // ✅ Validate file type - only PDF and DOCX allowed
    const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.docx'];
    
    const fileName = req.file.originalname.toLowerCase();
    const fileMimeType = req.file.mimetype.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    if (!allowedMimeTypes.includes(fileMimeType) || !allowedExtensions.includes(fileExtension)) {
      // Clean up file before returning error
      await fs.unlink(filePath).catch(() => {});
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Only PDF and DOCX files are accepted.',
        details: {
          received: `${fileExtension || 'unknown'} (${fileMimeType || 'unknown'})`
        }
      });
    }

    // Verify candidate exists and GitHub is verified AND locked
    let candidate = await Candidate.findOne({ user_id: req.user.id });

    if (!candidate) {
      // Clean up file before returning error
      await fs.unlink(filePath).catch(() => {});
      return res.status(403).json({
        success: false,
        message: 'Candidate profile not found. Please verify your GitHub account first.',
        help: 'Visit POST /api/candidate/github/verify to lock GitHub verification'
      });
    }

    if (!candidate.github_verified) {
      // Clean up file before returning error
      await fs.unlink(filePath).catch(() => {});
      return res.status(403).json({
        success: false,
        message: 'GitHub account not verified. Please authenticate with GitHub first.',
        help: 'Use /api/auth/github to authenticate, then POST /api/candidate/github/verify'
      });
    }

    if (!candidate.github_verification_locked) {
      // Clean up file before returning error
      await fs.unlink(filePath).catch(() => {});
      return res.status(403).json({
        success: false,
        message: 'GitHub verification not locked. Please complete verification first.',
        help: 'Visit POST /api/candidate/github/verify to lock GitHub verification'
      });
    }

    // ✅ FIXED: Delete old resume before storing new one (single resume policy)
    const oldResumeUrl = candidate.resume_url;
    if (oldResumeUrl) {
      try {
        const oldResumePath = path.join(__dirname, "../uploads/resumes", oldResumeUrl);
        // Check if file exists before trying to delete
        try {
          await fs.stat(oldResumePath);
          await fs.unlink(oldResumePath);
          console.log(`[Resume Upload] Old resume deleted: ${oldResumeUrl}`);
        } catch (err) {
          // File doesn't exist, that's ok
          console.log(`[Resume Upload] Old resume file not found: ${oldResumeUrl}`);
        }
      } catch (error) {
        console.error(`[Resume Upload] Error deleting old resume:`, error.message);
        // Don't fail the upload if we can't delete the old file
      }
    }

    // ✅ UPDATE: Just store the resume file, don't score yet
    // Update candidate with resume metadata
    await Candidate.findByIdAndUpdate(candidate._id, {
      resume_url: req.file.filename,
      resume_uploaded_at: new Date()
    });

    console.log(`[Resume Upload] File stored for user ${req.user.id}: ${req.file.filename}`);

    // ✅ FIXED: Automatically trigger skill score recalculation with new resume
    // This ensures skills are re-scored based on resume content immediately
    const { orchestrate } = require('../services/scoreOrchestrator');
    
    try {
      console.log('[Resume Upload] Triggering orchestrate for skill recalculation...');
      const scores = await orchestrate(candidate._id);
      console.log('[Resume Upload] Orchestrate completed successfully');
      
      // Fetch updated candidate with new scores
      const updatedCandidate = await Candidate.findById(candidate._id);
      
      // ✅ Return FULL KPI breakdown for frontend
      res.status(200).json({
        success: true,
        message: 'Resume uploaded and skill scores recalculated successfully',
        data: {
          resume_url: req.file.filename,
          filename: req.file.originalname,
          file_size: req.file.size,
          upload_time: new Date(),
          
          // ✅ CRITICAL: Return all KPI component scores (0-100 normalized)
          scores: {
            resume_score: updatedCandidate.resume_score,              // 0-30
            skills_score: updatedCandidate.skills_score,              // 0-40
            projects_score: updatedCandidate.projects_score,          // 0-30
            total_score: updatedCandidate.total_score                 // 0-100
          },
          
          // ✅ CRITICAL: Return ATS breakdown for KPI Analysis cards
          ats_breakdown: {
            section_score: updatedCandidate.ats_breakdown?.section_score || 0,   // 0-100
            keyword_score: updatedCandidate.ats_breakdown?.keyword_score || 0,   // 0-100
            format_score: updatedCandidate.ats_breakdown?.format_score || 0,     // 0-100
            length_score: updatedCandidate.ats_breakdown?.length_score || 0,     // 0-100
            ats_score: updatedCandidate.ats_breakdown?.ats_score || 0,           // 0-100
            resume_contribution: updatedCandidate.ats_breakdown?.resume_contribution || 0  // 0-30
          },
          
          // ✅ CRITICAL: Return section presence for Section Analysis UI
          section_presence: updatedCandidate.section_presence || {
            summary: false,
            experience: false,
            education: false,
            skills: false,
            projects: false,
            certifications: false
          },
          
          skills: updatedCandidate.skills
        }
      });
    } catch (orchestrateError) {
      console.error('[Resume Upload] Orchestrate error:', orchestrateError.message);
      // Resume was uploaded successfully, but scoring failed
      // Still return success with resume info, user can retry scoring
      res.status(200).json({
        success: true,
        message: 'Resume uploaded successfully. Skill recalculation encountered an issue, but will retry automatically.',
        data: {
          resume_url: req.file.filename,
          filename: req.file.originalname,
          file_size: req.file.size,
          upload_time: new Date()
        }
      });
    }
  } catch (error) {
    console.error('[Resume Upload] Error:', error.message);
    
    // Clean up file on error
    if (filePath) {
      await fs.unlink(filePath).catch(() => {});
    }

    res.status(500).json({
      success: false,
      message: `Resume processing failed: ${error.message}`
    });
  }
};

// GET RESUME SCORE
exports.getResumeScore = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user_id: req.user.id });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const score = await ResumeScore.findOne({ candidate_id: candidate._id });

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'No resume score found. Please upload a resume first.'
      });
    }

    // ✅ FIXED: Transform response to match frontend expectations
    // Frontend expects: All 5 KPI components, section_presence, improvement_suggestions
    // All component scores are 0-100 normalized from Phase 2 ATS pipeline
    const transformedScore = {
      ...score.toObject(),
      
      // ✅ Return all 5 KPI component scores (0-100 each) for dashboard display
      ats_breakdown: {
        section_score: score.ats_breakdown?.section_score || score.components?.section_score || 0,
        keyword_score: score.ats_breakdown?.keyword_score || score.components?.keyword_score || 0,
        format_score: score.ats_breakdown?.format_score || score.components?.format_score || 0,
        skill_score: score.ats_breakdown?.skill_score || score.components?.skill_score || 0,
        project_strength: score.ats_breakdown?.project_strength || score.components?.project_strength || 0,
        ats_score: score.ats_breakdown?.ats_score || score.final_score || 0,
        resume_contribution: score.ats_breakdown?.resume_contribution || Math.round(((score.ats_breakdown?.ats_score || score.final_score || 0) / 100) * 30)
      },
      
      // ✅ FIXED: Return section presence for Section Analysis UI
      section_presence: score.section_presence || {
        summary: false,
        experience: false,
        education: false,
        skills: false,
        projects: false,
        certifications: false
      },
      
      // ✅ Return improvement suggestions from Stage 10
      improvement_suggestions: score.improvement_suggestions || [],
      
      // ✅ Main ATS score that should be displayed (0-100)
      total_ats_score: score.ats_breakdown?.ats_score || score.final_score || 0,
      final_score: score.ats_breakdown?.ats_score || score.final_score || 0,
      
      // Legacy fields for backward compatibility
      sections: {
        section_score: score.ats_breakdown?.section_score || score.components?.section_score || 0
      },
      
      keywords: {
        keyword_score: score.ats_breakdown?.keyword_score || score.components?.keyword_score || 0,
        total_word_count: score.meta?.word_count || 0
      },
      
      format: {
        format_score: score.ats_breakdown?.format_score || score.components?.format_score || 0
      }
    };

    res.json({ success: true, data: transformedScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DOWNLOAD RESUME (Latest only)
exports.downloadResume = async (req, res) => {
  try {
    console.log(`[Resume Download] Request from user: ${req.user?.id}`);
    
    const candidate = await Candidate.findOne({ user_id: req.user.id });

    if (!candidate) {
      console.log(`[Resume Download] Candidate not found for user: ${req.user?.id}`);
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    // ✅ Only serve the latest resume
    if (!candidate.resume_url) {
      console.log(`[Resume Download] No resume_url found for candidate: ${candidate._id}`);
      return res.status(404).json({
        success: false,
        message: 'No resume found. Please upload a resume first.'
      });
    }

    const resumePath = path.join(__dirname, "../uploads/resumes", candidate.resume_url);
    console.log(`[Resume Download] Resume path: ${resumePath}`);

    // Check if file exists and get file stats
    let fileStats;
    try {
      fileStats = await fs.stat(resumePath);
      console.log(`[Resume Download] File found, size: ${fileStats.size} bytes`);
    } catch (err) {
      console.error(`[Resume Download] File not found at: ${resumePath}`, err.message);
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server'
      });
    }

    // Set response headers for file download
    const fileExtension = candidate.resume_url.split('.').pop().toLowerCase();
    const fileName = `resume_${candidate._id}.${fileExtension}`;
    
    // Set proper content type based on file extension
    let contentType = 'application/octet-stream';
    if (fileExtension === 'pdf') {
      contentType = 'application/pdf';
    } else if (fileExtension === 'docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (fileExtension === 'doc') {
      contentType = 'application/msword';
    }
    
    console.log(`[Resume Download] Serving file: ${fileName}, type: ${contentType}`);
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileStats.size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Stream the file with error handling
    const stream = require('fs').createReadStream(resumePath);
    
    stream.on('error', (err) => {
      console.error('[Resume Download] Stream error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading resume'
        });
      }
    });
    
    stream.on('end', () => {
      console.log(`[Resume Download] File successfully streamed to client`);
    });
    
    res.on('error', (err) => {
      console.error('[Resume Download] Response error:', err.message);
    });
    
    stream.pipe(res);
  } catch (error) {
    console.error('[Resume Download] Error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error downloading resume: ' + error.message
      });
    }
  }
};

/**
 * GENERATE SHARE LINK
 * Generate a unique shareId for a candidate's public profile
 * POST /api/candidate/share
 */
exports.generateShareLink = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user_id: req.user.id });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    // If shareId already exists, just enable sharing
    if (candidate.shareId && candidate.sharing_enabled) {
      return res.json({
        success: true,
        message: 'Profile already shared',
        data: {
          shareId: candidate.shareId,
          sharing_enabled: true,
          shareUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/share/${candidate.shareId}`
        }
      });
    }

    // Generate new shareId if needed (using crypto UUID)
    if (!candidate.shareId) {
      const crypto = require('crypto');
      candidate.shareId = crypto.randomBytes(16).toString('hex');
    }

    // Enable sharing
    candidate.sharing_enabled = true;
    await candidate.save();

    res.json({
      success: true,
      message: 'Profile share link generated',
      data: {
        shareId: candidate.shareId,
        sharing_enabled: true,
        shareUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/share/${candidate.shareId}`
      }
    });
  } catch (error) {
    console.error('[Generate Share Link] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating share link: ' + error.message
    });
  }
};

/**
 * GET SHARE STATUS
 * Get current sharing status and shareId
 * GET /api/candidate/share
 */
exports.getShareStatus = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user_id: req.user.id });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        sharing_enabled: candidate.sharing_enabled || false,
        shareId: candidate.shareId || null,
        shareUrl: candidate.shareId ? `${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/share/${candidate.shareId}` : null
      }
    });
  } catch (error) {
    console.error('[Get Share Status] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching share status: ' + error.message
    });
  }
};

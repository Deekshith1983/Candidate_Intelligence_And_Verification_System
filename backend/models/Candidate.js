const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sub_score: { type: Number, default: 0 },
  project_score: { type: Number, default: 0 },
  resume_score: { type: Number, default: 0 },
  decl_score: { type: Number, default: 20 }
});

const CandidateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  education: {
    degree: String,
    institution: String,
    year: Number
  },

  about: { type: String, maxlength: 500 },

  skills: [SkillSchema],

  resume_url: { type: String, default: null },
  resume_text: { type: String, default: null },
  extracted_skills: [String], // Skills extracted from the uploaded resume content
  resume_uploaded_at: { type: Date, default: null },

  // ✅ FIXED: Store detailed ATS score breakdown for transparency
  // New formula: Section(30%) + Keyword(25%) + Format(20%) + Skill(15%) + Project(10%)
  ats_breakdown: {
    section_score: { type: Number, default: 0 },      // 0-100 normalized
    keyword_score: { type: Number, default: 0 },      // 0-100 normalized
    format_score: { type: Number, default: 0 },       // 0-100 normalized
    skill_score: { type: Number, default: 0 },        // 0-100 normalized (NEW)
    project_strength: { type: Number, default: 0 },   // 0-100 normalized (NEW)
    ats_score: { type: Number, default: 0 },          // Final ATS score (0-100)
    resume_contribution: { type: Number, default: 0 } // ATS × 0.3 (0-30)
  },

  // ✅ FIXED: Store section presence for Section Analysis UI
  section_presence: {
    summary: { type: Boolean, default: false },
    experience: { type: Boolean, default: false },
    education: { type: Boolean, default: false },
    skills: { type: Boolean, default: false },
    projects: { type: Boolean, default: false },
    certifications: { type: Boolean, default: false }
  },

  resume_score: { type: Number, default: 0 },
  skills_score: { type: Number, default: 0 },
  projects_score: { type: Number, default: 0 },
  total_score: { type: Number, default: 0 },

  github_username: { type: String, default: null },
  github_access_token: { type: String, default: null },
  github_verified: { type: Boolean, default: false },
  github_verified_at: { type: Date, default: null },
  github_verification_locked: { type: Boolean, default: false },

  tier: {
    type: String,
    enum: ['High Potential', 'Moderate', 'Needs Improvement'],
    default: 'Needs Improvement'
  },

  last_scored: { type: Date, default: null },

  profile_views: { type: Number, default: 0 },
  profile_stars: { type: Number, default: 0 },

  // ✅ NEW: Unique share ID for public profile link
  shareId: { type: String, unique: true, sparse: true, default: null },
  sharing_enabled: { type: Boolean, default: false }

}, { timestamps: true });

CandidateSchema.pre('save', async function() {
  try {
    if (this.total_score >= 75) {
      this.tier = 'High Potential';
    } else if (this.total_score >= 50) {
      this.tier = 'Moderate';
    } else {
      this.tier = 'Needs Improvement';
    }
    // No next() needed - async functions return promises
  } catch (err) {
    console.error('Error in Candidate pre-save hook:', err);
    throw err; // Rethrow to stop save
  }
});

module.exports = mongoose.model('Candidate', CandidateSchema);
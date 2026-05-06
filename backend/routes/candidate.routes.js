const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const controller = require('../controllers/candidate.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/profile', verifyToken, controller.getProfile);
router.put('/profile', verifyToken, controller.updateProfile);

router.post('/github/verify', verifyToken, controller.verifyGithub);

router.post('/resume', verifyToken, upload.single('resume'), controller.uploadResume);

router.get('/resume-download', verifyToken, controller.downloadResume);

router.get('/resume-score', verifyToken, controller.getResumeScore);

// ✅ Profile Sharing Routes
router.post('/share', verifyToken, controller.generateShareLink);
router.get('/share', verifyToken, controller.getShareStatus);

// ✅ Note: Projects are fetched via /api/projects from project.routes.js
// This gives candidates immediate access to their own projects

module.exports = router;
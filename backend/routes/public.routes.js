const express = require('express');
const router = express.Router();

const publicController = require('../controllers/public.controller');

// ========================================
// 🌐 PUBLIC ROUTES (No Authentication)
// ========================================

/**
 * GET /api/public/profile/:shareId
 * Get a candidate's public profile by shareId
 * No authentication required
 */
router.get('/profile/:shareId', publicController.getPublicProfile);

/**
 * GET /api/public/profile/:shareId/resume
 * Download resume for shared public profile
 * No authentication required (if sharing is enabled)
 */
router.get('/profile/:shareId/resume', publicController.downloadPublicResume);

module.exports = router;

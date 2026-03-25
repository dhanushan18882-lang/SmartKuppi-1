// backend/routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Upload and get resources for a course
router.get('/common', protect, resourceController.getCommonResources);
router.post('/courses/:courseId/resources', protect, authorize('tutor', 'admin'), resourceController.uploadResourceFile, resourceController.createResource);
router.get('/courses/:courseId/resources', protect, resourceController.getCourseResources);

router.delete('/resources/:id', protect, authorize('tutor', 'admin'), resourceController.deleteResource);
router.put('/resources/:id/download', protect, resourceController.incrementDownload);

// No /file/:id route – files are served statically via /api/uploads/

module.exports = router;
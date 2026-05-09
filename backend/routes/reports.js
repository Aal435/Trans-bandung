const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/multer');
const fileUpload = require('express-fileupload');

const router = express.Router();

// Use fileUpload middleware for multiple file uploads
router.use(fileUpload());

// Public routes
router.get('/', reportController.getAllReports);
router.get('/user/my-reports', authenticateToken, reportController.getUserReports);
router.get('/:id', reportController.getReportById);

// Protected routes
router.post('/', authenticateToken, reportController.createReport);

// Admin routes
router.patch('/:id/status', authenticateToken, isAdmin, reportController.updateReportStatus);
router.delete('/:id', authenticateToken, reportController.deleteReport);

module.exports = router;

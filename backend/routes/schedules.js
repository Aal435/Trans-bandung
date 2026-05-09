const express = require('express');
const scheduleController = require('../controllers/scheduleController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/route/:route_id', scheduleController.getSchedulesByRoute);

// Admin routes
router.post('/', authenticateToken, isAdmin, scheduleController.createSchedule);
router.patch('/:id', authenticateToken, isAdmin, scheduleController.updateSchedule);
router.delete('/:id', authenticateToken, isAdmin, scheduleController.deleteSchedule);

module.exports = router;

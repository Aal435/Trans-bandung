const express = require('express');
const monitoringController = require('../controllers/monitoringController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', monitoringController.getAllMonitoring);
router.get('/route/:route_id', monitoringController.getMonitoringByRoute);
router.get('/vehicle/:vehicle_id', monitoringController.getVehicleMonitoring);

// Admin routes for updating vehicle status
router.post('/update', authenticateToken, isAdmin, monitoringController.updateVehicleStatus);

module.exports = router;

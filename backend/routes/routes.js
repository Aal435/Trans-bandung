const express = require('express');
const routeController = require('../controllers/routeController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);

// Admin routes
router.post('/', authenticateToken, isAdmin, routeController.createRoute);
router.patch('/:id', authenticateToken, isAdmin, routeController.updateRoute);
router.delete('/:id', authenticateToken, isAdmin, routeController.deleteRoute);

module.exports = router;

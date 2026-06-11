const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin routes for managing repair requests
router.get('/pending-requests', adminController.getPendingRequests);
router.put('/assign-request/:requestId', adminController.assignRequestToMechanic);

module.exports = router;
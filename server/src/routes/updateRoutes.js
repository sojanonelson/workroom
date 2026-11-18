const express = require('express');
const router = express.Router();
const { createUpdate, deleteUpdate } = require('../controllers/updateController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);

// Admin post milestone update
router.post('/project/:projectId', requireAdmin, createUpdate);

// Admin delete update
router.delete('/:id', requireAdmin, deleteUpdate);

module.exports = router;

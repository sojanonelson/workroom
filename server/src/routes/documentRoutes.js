const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadDocument, deleteDocument } = require('../controllers/documentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);

// Admin upload document (Invoice, budget, technical, etc.)
router.post('/project/:projectId', requireAdmin, upload.single('file'), uploadDocument);

// Admin delete document
router.delete('/:id', requireAdmin, deleteDocument);

module.exports = router;

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createProject,
  getProjects,
  getProjectById,
  updateStatus,
  updateBuildLink,
  updateProject,
  acceptDeclaration,
  deleteProject,
} = require('../controllers/projectController');
const { authenticateToken, requireAdmin, requireCustomerOrAdmin } = require('../middleware/auth');

router.use(authenticateToken);

// List projects (Admin: all, Customer: their own)
router.get('/', requireCustomerOrAdmin, getProjects);

// Get single project workspace
router.get('/:id', requireCustomerOrAdmin, getProjectById);

// Admin: create project (with optional QR code image upload)
router.post('/', requireAdmin, upload.single('payment_qr_file'), createProject);

// Admin: update project details
router.put('/:id', requireAdmin, upload.single('payment_qr_file'), updateProject);

// Admin: update development status
router.patch('/:id/status', requireAdmin, updateStatus);

// Admin: update dynamic build link
router.patch('/:id/build-link', requireAdmin, updateBuildLink);

// Customer or Admin: accept declaration
router.post('/:id/accept-declaration', requireCustomerOrAdmin, acceptDeclaration);

// Admin: delete project
router.delete('/:id', requireAdmin, deleteProject);

module.exports = router;

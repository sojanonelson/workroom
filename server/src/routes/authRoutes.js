const express = require('express');
const router = express.Router();
const {
  register,
  login,
  resetFirstPassword,
  getAllUsers,
  updateUserRole,
  updateUserName,
  createAdminUser,
  getMe,
} = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/reset-first-password', authenticateToken, resetFirstPassword);
router.get('/me', authenticateToken, getMe);

// Admin-only user management routes
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.patch('/users/:id/role', authenticateToken, requireAdmin, updateUserRole);
router.patch('/users/:id/name', authenticateToken, requireAdmin, updateUserName);
router.post('/users/create-admin', authenticateToken, requireAdmin, createAdminUser);

module.exports = router;

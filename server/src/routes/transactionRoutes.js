const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  recordTransaction,
  submitClientProof,
  updateTransactionStatus,
  deleteTransaction,
} = require('../controllers/transactionController');
const { authenticateToken, requireAdmin, requireCustomerOrAdmin } = require('../middleware/auth');

router.use(authenticateToken);

// Admin manually records transaction (direct payment, wire, cash, etc.)
router.post('/project/:projectId/manual', requireAdmin, upload.single('receipt'), recordTransaction);

// Customer submits proof of payment for review
router.post('/project/:projectId/proof', requireCustomerOrAdmin, upload.single('receipt'), submitClientProof);

// Admin verify or reject transaction status
router.patch('/:id/status', requireAdmin, updateTransactionStatus);

// Admin delete transaction
router.delete('/:id', requireAdmin, deleteTransaction);

module.exports = router;

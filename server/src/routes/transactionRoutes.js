const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  recordTransaction,
  updateTransactionStatus,
  deleteTransaction,
} = require('../controllers/transactionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);

// Only Admin can record transactions and upload payment receipts
router.post('/project/:projectId/manual', requireAdmin, upload.single('receipt'), recordTransaction);

// Admin verify or reject transaction status
router.patch('/:id/status', requireAdmin, updateTransactionStatus);

// Admin delete transaction
router.delete('/:id', requireAdmin, deleteTransaction);

module.exports = router;

const { query } = require('../config/db');
const { uploadBuffer } = require('../config/cloudinary');

// Admin manually adds transaction (e.g., direct bank transfer, cash, offline settlement)
const recordTransaction = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      amount,
      currency = 'USD',
      payment_method = 'Bank Transfer',
      transaction_reference,
      payment_date,
      status = 'verified',
      notes,
    } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Valid transaction amount is required.' });
    }

    let receiptUrl = null;
    if (req.file) {
      const uploadRes = await uploadBuffer(
        req.file.buffer,
        req.file.originalname,
        'workroom_receipts',
        'auto'
      );
      receiptUrl = uploadRes.url;
    }

    const insertRes = await query(
      `INSERT INTO transactions (
        project_id, amount, currency, payment_method, transaction_reference,
        payment_date, status, receipt_url, notes, recorded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        projectId,
        parseFloat(amount),
        currency,
        payment_method,
        transaction_reference || null,
        payment_date || new Date().toISOString().split('T')[0],
        status,
        receiptUrl,
        notes || null,
        req.user ? req.user.id : null,
      ]
    );

    const newTxn = insertRes.rows[0];

    // Log update on project timeline
    await query(
      `INSERT INTO project_updates (project_id, title, content, status_snapshot, created_by)
       VALUES ($1, $2, $3, (SELECT development_status FROM projects WHERE id = $1), $4)`,
      [
        projectId,
        `Payment Recorded (${currency} ${parseFloat(amount).toLocaleString()})`,
        `Payment via ${payment_method}${transaction_reference ? ` (Ref: ${transaction_reference})` : ''} was recorded into project ledger. Status: ${status.toUpperCase()}.`,
        req.user ? req.user.id : null,
      ]
    );

    return res.status(201).json({
      message: 'Transaction recorded successfully.',
      transaction: newTxn,
    });
  } catch (error) {
    console.error('recordTransaction error:', error);
    return res.status(500).json({ error: error.message || 'Failed to record transaction.' });
  }
};

// Customer submits payment proof / reference for admin verification
const submitClientProof = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { amount, currency = 'USD', payment_method = 'Direct Bank Transfer', transaction_reference, notes } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Valid payment amount is required.' });
    }

    let receiptUrl = null;
    if (req.file) {
      const uploadRes = await uploadBuffer(
        req.file.buffer,
        req.file.originalname,
        'workroom_receipts',
        'auto'
      );
      receiptUrl = uploadRes.url;
    }

    const insertRes = await query(
      `INSERT INTO transactions (
        project_id, amount, currency, payment_method, transaction_reference,
        payment_date, status, receipt_url, notes, recorded_by
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'pending', $6, $7, $8)
      RETURNING *`,
      [
        projectId,
        parseFloat(amount),
        currency,
        payment_method,
        transaction_reference || 'Client Submission',
        receiptUrl,
        notes || 'Client submitted payment verification proof',
        req.user.id,
      ]
    );

    // Notify on timeline
    await query(
      `INSERT INTO project_updates (project_id, title, content, status_snapshot, created_by)
       VALUES ($1, $2, $3, (SELECT development_status FROM projects WHERE id = $1), $4)`,
      [
        projectId,
        'Payment Proof Submitted',
        `Client submitted payment of ${currency} ${parseFloat(amount).toLocaleString()} for admin verification.`,
        req.user.id,
      ]
    );

    return res.status(201).json({
      message: 'Payment proof submitted. Admin will verify and mark as verified.',
      transaction: insertRes.rows[0],
    });
  } catch (error) {
    console.error('submitClientProof error:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit payment proof.' });
  }
};

// Update transaction status (Admin: verify or reject)
const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateRes = await query(
      `UPDATE transactions
       SET status = $1, notes = COALESCE($2, notes)
       WHERE id = $3
       RETURNING *`,
      [status, notes, id]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    return res.json({
      message: `Transaction marked as ${status}.`,
      transaction: updateRes.rows[0],
    });
  } catch (error) {
    console.error('updateTransactionStatus error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update transaction status.' });
  }
};

// Delete transaction (Admin)
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteRes = await query('DELETE FROM transactions WHERE id = $1 RETURNING id', [id]);
    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    return res.json({ message: 'Transaction record removed.' });
  } catch (error) {
    console.error('deleteTransaction error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete transaction.' });
  }
};

module.exports = {
  recordTransaction,
  submitClientProof,
  updateTransactionStatus,
  deleteTransaction,
};

const path = require('path');
const { query } = require('../config/db');
const { cloudinary, uploadBuffer, isCloudinaryConfigured } = require('../config/cloudinary');

// Upload document (Invoice, Budget, Technical Doc, Contract, etc.)
const uploadDocument = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, category = 'other' } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Please select a file to upload.' });
    }

    const docTitle = title ? title.trim() : req.file.originalname;
    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();

    // Upload to Cloudinary (or fallback to local disk)
    const uploadRes = await uploadBuffer(
      req.file.buffer,
      req.file.originalname,
      'workroom_documents',
      'auto'
    );

    const insertRes = await query(
      `INSERT INTO project_documents (
        project_id, title, category, file_url, public_id, file_type, file_size, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        projectId,
        docTitle,
        category,
        uploadRes.url,
        uploadRes.publicId,
        ext || uploadRes.format || 'file',
        req.file.size,
        req.user ? req.user.id : null,
      ]
    );

    const newDoc = insertRes.rows[0];

    // Log update on project timeline
    await query(
      `INSERT INTO project_updates (project_id, title, content, status_snapshot, created_by)
       VALUES ($1, $2, $3, (SELECT development_status FROM projects WHERE id = $1), $4)`,
      [
        projectId,
        `Document Added: ${docTitle}`,
        `A new ${category.toUpperCase()} document was added to the workspace.`,
        req.user ? req.user.id : null,
      ]
    );

    return res.status(201).json({
      message: 'Document uploaded successfully.',
      document: newDoc,
    });
  } catch (error) {
    console.error('uploadDocument error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload document.' });
  }
};

// Delete document (Admin)
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const docRes = await query('SELECT * FROM project_documents WHERE id = $1', [id]);
    if (docRes.rowCount === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const doc = docRes.rows[0];

    // Remove from Cloudinary if configured and public_id exists
    if (isCloudinaryConfigured && doc.public_id && !doc.file_url.startsWith('/uploads/')) {
      try {
        await cloudinary.uploader.destroy(doc.public_id);
      } catch (err) {
        console.warn('Cloudinary delete warning:', err.message);
      }
    }

    await query('DELETE FROM project_documents WHERE id = $1', [id]);

    return res.json({ message: 'Document removed from workspace.' });
  } catch (error) {
    console.error('deleteDocument error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete document.' });
  }
};

module.exports = {
  uploadDocument,
  deleteDocument,
};

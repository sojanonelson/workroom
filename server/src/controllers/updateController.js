const { query } = require('../config/db');

// Create project update / milestone log (Admin)
const createUpdate = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, content, status_snapshot } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    // Get current project status if snapshot not provided
    let status = status_snapshot;
    if (!status) {
      const projRes = await query('SELECT development_status FROM projects WHERE id = $1', [projectId]);
      if (projRes.rowCount > 0) {
        status = projRes.rows[0].development_status;
      }
    }

    const insertRes = await query(
      `INSERT INTO project_updates (project_id, title, content, status_snapshot, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [projectId, title.trim(), content.trim(), status || 'In Progress', req.user ? req.user.id : null]
    );

    return res.status(201).json({
      message: 'Update posted successfully.',
      update: insertRes.rows[0],
    });
  } catch (error) {
    console.error('createUpdate error:', error);
    return res.status(500).json({ error: error.message || 'Failed to post update.' });
  }
};

// Delete update (Admin)
const deleteUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteRes = await query('DELETE FROM project_updates WHERE id = $1 RETURNING id', [id]);
    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: 'Update not found.' });
    }
    return res.json({ message: 'Update removed.' });
  } catch (error) {
    console.error('deleteUpdate error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete update.' });
  }
};

module.exports = {
  createUpdate,
  deleteUpdate,
};

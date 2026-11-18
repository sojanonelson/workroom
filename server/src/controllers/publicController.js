const { query } = require('../config/db');

// Lookup project by shareable invite token
const getProjectByInviteToken = async (req, res) => {
  try {
    const { token } = req.params;

    const result = await query(
      `SELECT
        id, name, category, client_email, client_phone, client_company,
        estimated_duration, start_date, development_status, build_link,
        invite_token, declaration_accepted, declaration_accepted_at,
        declaration_signee_name, declaration_terms, budget_total, currency,
        created_at
       FROM projects WHERE invite_token = $1`,
      [token]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Invalid or expired project invitation link.' });
    }

    const project = result.rows[0];
    return res.json({ project });
  } catch (error) {
    console.error('getProjectByInviteToken error:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve project details.' });
  }
};

// Accept declaration via invite link token
const acceptDeclarationByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { signee_name, terms_version } = req.body;

    if (!signee_name) {
      return res.status(400).json({ error: 'Signee full name is required to accept terms.' });
    }

    const defaultTerms =
      'Client accepts project scope, milestone timelines, communication terms, and technical specifications outlined in the Workroom workspace.';

    const updateRes = await query(
      `UPDATE projects SET
        declaration_accepted = TRUE,
        declaration_accepted_at = CURRENT_TIMESTAMP,
        declaration_signee_name = $1,
        declaration_terms = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE invite_token = $3
      RETURNING *`,
      [signee_name.trim(), terms_version || defaultTerms, token]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found with provided invite token.' });
    }

    const project = updateRes.rows[0];

    // Log update on project timeline
    await query(
      `INSERT INTO project_updates (project_id, title, content, status_snapshot)
       VALUES ($1, $2, $3, $4)`,
      [
        project.id,
        'Project Declaration Accepted',
        `Client accepted terms and conditions via declaration form signed by "${signee_name}". Project development will start ASAP.`,
        project.development_status,
      ]
    );

    return res.json({
      message: 'Project declaration successfully accepted. Development will start ASAP.',
      project,
    });
  } catch (error) {
    console.error('acceptDeclarationByToken error:', error);
    return res.status(500).json({ error: error.message || 'Failed to accept declaration.' });
  }
};

module.exports = {
  getProjectByInviteToken,
  acceptDeclarationByToken,
};

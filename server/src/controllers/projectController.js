const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { uploadBuffer } = require('../config/cloudinary');

// Create a new project (Admin)
const createProject = async (req, res) => {
  try {
    const {
      name,
      category,
      client_email,
      client_phone,
      client_company,
      estimated_duration,
      start_date,
      budget_total = 0,
      currency = 'USD',
      development_status = 'Planning',
      build_link,
      bank_name,
      bank_account_name,
      bank_account_number,
      bank_ifsc_swift,
      bank_upi_iban,
      bank_notes,
    } = req.body;

    if (!name || !category || !client_email) {
      return res.status(400).json({ error: 'Project name, category, and client email are required.' });
    }

    const cleanEmail = client_email.toLowerCase().trim();

    // Check if client user already exists
    const clientUserRes = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    const clientId = clientUserRes.rowCount > 0 ? clientUserRes.rows[0].id : null;

    // Handle payment QR code upload if provided via file
    let paymentQrUrl = req.body.payment_qr_url || null;
    if (req.file) {
      const uploadRes = await uploadBuffer(req.file.buffer, req.file.originalname, 'workroom_qrcodes', 'image');
      paymentQrUrl = uploadRes.url;
    }

    const inviteToken = uuidv4().replace(/-/g, '').substring(0, 16);

    const insertResult = await query(
      `INSERT INTO projects (
        name, category, client_email, client_phone, client_company,
        client_id, estimated_duration, start_date, development_status,
        build_link, invite_token, budget_total, currency, payment_qr_url,
        bank_name, bank_account_name, bank_account_number, bank_ifsc_swift,
        bank_upi_iban, bank_notes, created_by
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13, $14,
        $15, $16, $17, $18,
        $19, $20, $21
      ) RETURNING *`,
      [
        name.trim(),
        category.trim(),
        cleanEmail,
        client_phone || null,
        client_company || null,
        clientId,
        estimated_duration || null,
        start_date || null,
        development_status || 'Planning',
        build_link || null,
        inviteToken,
        parseFloat(budget_total) || 0,
        currency || 'USD',
        paymentQrUrl,
        bank_name || null,
        bank_account_name || null,
        bank_account_number || null,
        bank_ifsc_swift || null,
        bank_upi_iban || null,
        bank_notes || null,
        req.user ? req.user.id : null,
      ]
    );

    const newProject = insertResult.rows[0];

    // Create an initial project update in the timeline
    await query(
      `INSERT INTO project_updates (project_id, title, content, status_snapshot, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        newProject.id,
        'Workspace Created',
        `Project workspace created under ${category}. Client invitation link generated.`,
        newProject.development_status,
        req.user ? req.user.id : null,
      ]
    );

    return res.status(201).json({
      message: 'Project created successfully.',
      project: newProject,
    });
  } catch (error) {
    console.error('createProject error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create project.' });
  }
};

// Get all projects
// Admins see all projects; Customers see only their associated projects
const getProjects = async (req, res) => {
  try {
    const isCustomer = req.user.role === 'customer';
    let queryText = '';
    let queryParams = [];

    if (isCustomer) {
      queryText = `
        SELECT p.*,
          COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'verified'), 0) AS total_paid,
          COUNT(DISTINCT u.id) AS updates_count,
          COUNT(DISTINCT d.id) AS documents_count
        FROM projects p
        LEFT JOIN transactions t ON t.project_id = p.id
        LEFT JOIN project_updates u ON u.project_id = p.id
        LEFT JOIN project_documents d ON d.project_id = p.id
        WHERE p.client_id = $1 OR LOWER(p.client_email) = $2
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      queryParams = [req.user.id, req.user.email.toLowerCase().trim()];
    } else {
      queryText = `
        SELECT p.*,
          COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'verified'), 0) AS total_paid,
          COUNT(DISTINCT u.id) AS updates_count,
          COUNT(DISTINCT d.id) AS documents_count,
          COUNT(DISTINCT t.id) AS transactions_count
        FROM projects p
        LEFT JOIN transactions t ON t.project_id = p.id
        LEFT JOIN project_updates u ON u.project_id = p.id
        LEFT JOIN project_documents d ON d.project_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
    }

    const result = await query(queryText, queryParams);
    return res.json({ projects: result.rows });
  } catch (error) {
    console.error('getProjects error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch projects.' });
  }
};

// Get project workspace by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch project
    const projectRes = await query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectRes.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const project = projectRes.rows[0];

    // Access check: if customer, verify client_id or client_email
    if (req.user.role === 'customer') {
      const userEmail = req.user.email.toLowerCase().trim();
      const projEmail = (project.client_email || '').toLowerCase().trim();
      if (project.client_id !== req.user.id && projEmail !== userEmail) {
        return res.status(403).json({ error: 'Access denied to this project workspace.' });
      }
    }

    // Fetch timeline updates
    const updatesRes = await query(
      `SELECT u.*, usr.name as author_name, usr.role as author_role
       FROM project_updates u
       LEFT JOIN users usr ON usr.id = u.created_by
       WHERE u.project_id = $1
       ORDER BY u.created_at DESC`,
      [id]
    );

    // Fetch documents
    const documentsRes = await query(
      `SELECT d.*, usr.name as uploader_name
       FROM project_documents d
       LEFT JOIN users usr ON usr.id = d.uploaded_by
       WHERE d.project_id = $1
       ORDER BY d.created_at DESC`,
      [id]
    );

    // Fetch transactions
    const transactionsRes = await query(
      `SELECT t.*, usr.name as recorder_name
       FROM transactions t
       LEFT JOIN users usr ON usr.id = t.recorded_by
       WHERE t.project_id = $1
       ORDER BY t.payment_date DESC, t.created_at DESC`,
      [id]
    );

    // Calculate financials
    const totalPaid = transactionsRes.rows
      .filter((t) => t.status === 'verified')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const budgetTotal = parseFloat(project.budget_total || 0);
    const balanceDue = Math.max(0, budgetTotal - totalPaid);

    return res.json({
      project,
      updates: updatesRes.rows,
      documents: documentsRes.rows,
      transactions: transactionsRes.rows,
      financials: {
        budget_total: budgetTotal,
        total_paid: totalPaid,
        balance_due: balanceDue,
        currency: project.currency,
      },
    });
  } catch (error) {
    console.error('getProjectById error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch project workspace.' });
  }
};

// Manually update development status (Admin only)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const updateRes = await query(
      `UPDATE projects
       SET development_status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const updatedProject = updateRes.rows[0];

    // Automatically record an update log
    await query(
      `INSERT INTO project_updates (project_id, title, content, status_snapshot, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        id,
        `Status Changed: ${status}`,
        note || `Project development status updated to "${status}".`,
        status,
        req.user.id,
      ]
    );

    return res.json({
      message: 'Project status updated successfully.',
      project: updatedProject,
    });
  } catch (error) {
    console.error('updateStatus error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update project status.' });
  }
};

// Update development build link dynamically (Admin only)
const updateBuildLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { build_link, note } = req.body;

    const updateRes = await query(
      `UPDATE projects
       SET build_link = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [build_link || null, id]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (build_link) {
      await query(
        `INSERT INTO project_updates (project_id, title, content, status_snapshot, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          'Live Build Published / Updated',
          note || `New development build preview is available: ${build_link}`,
          updateRes.rows[0].development_status,
          req.user.id,
        ]
      );
    }

    return res.json({
      message: 'Build link updated successfully.',
      project: updateRes.rows[0],
    });
  } catch (error) {
    console.error('updateBuildLink error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update build link.' });
  }
};

// Update full project details & bank info (Admin only)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      client_email,
      client_phone,
      client_company,
      estimated_duration,
      start_date,
      budget_total,
      currency,
      bank_name,
      bank_account_name,
      bank_account_number,
      bank_ifsc_swift,
      bank_upi_iban,
      bank_notes,
      build_link,
      development_status,
    } = req.body;

    let paymentQrUrl = req.body.payment_qr_url;
    if (req.file) {
      const uploadRes = await uploadBuffer(req.file.buffer, req.file.originalname, 'workroom_qrcodes', 'image');
      paymentQrUrl = uploadRes.url;
    }

    const currentRes = await query('SELECT * FROM projects WHERE id = $1', [id]);
    if (currentRes.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    const current = currentRes.rows[0];

    const updatedRes = await query(
      `UPDATE projects SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        client_email = COALESCE($3, client_email),
        client_phone = COALESCE($4, client_phone),
        client_company = COALESCE($5, client_company),
        estimated_duration = COALESCE($6, estimated_duration),
        start_date = COALESCE($7, start_date),
        budget_total = COALESCE($8, budget_total),
        currency = COALESCE($9, currency),
        bank_name = COALESCE($10, bank_name),
        bank_account_name = COALESCE($11, bank_account_name),
        bank_account_number = COALESCE($12, bank_account_number),
        bank_ifsc_swift = COALESCE($13, bank_ifsc_swift),
        bank_upi_iban = COALESCE($14, bank_upi_iban),
        bank_notes = COALESCE($15, bank_notes),
        build_link = COALESCE($16, build_link),
        development_status = COALESCE($17, development_status),
        payment_qr_url = COALESCE($18, payment_qr_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19
      RETURNING *`,
      [
        name,
        category,
        client_email ? client_email.toLowerCase().trim() : null,
        client_phone,
        client_company,
        estimated_duration,
        start_date || null,
        budget_total !== undefined ? parseFloat(budget_total) : null,
        currency,
        bank_name,
        bank_account_name,
        bank_account_number,
        bank_ifsc_swift,
        bank_upi_iban,
        bank_notes,
        build_link,
        development_status,
        paymentQrUrl,
        id,
      ]
    );

    return res.json({
      message: 'Project updated successfully.',
      project: updatedRes.rows[0],
    });
  } catch (error) {
    console.error('updateProject error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update project.' });
  }
};

// Accept project declaration terms
const acceptDeclaration = async (req, res) => {
  try {
    const { id } = req.params;
    const { signee_name, terms_version } = req.body;

    if (!signee_name) {
      return res.status(400).json({ error: 'Signee name is required to accept the declaration.' });
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
      WHERE id = $3
      RETURNING *`,
      [signee_name.trim(), terms_version || defaultTerms, id]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const project = updateRes.rows[0];

    // Log update on project timeline
    await query(
      `INSERT INTO project_updates (project_id, title, content, status_snapshot)
       VALUES ($1, $2, $3, $4)`,
      [
        id,
        'Project Declaration Accepted',
        `Client accepted terms and conditions via declaration form signed by "${signee_name}". Project development will start ASAP.`,
        project.development_status,
      ]
    );

    return res.json({
      message: 'Project declaration accepted. Development will start ASAP.',
      project,
    });
  } catch (error) {
    console.error('acceptDeclaration error:', error);
    return res.status(500).json({ error: error.message || 'Failed to accept declaration.' });
  }
};

// Delete project (Admin only)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING id, name', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    return res.json({ message: `Project "${result.rows[0].name}" deleted.` });
  } catch (error) {
    console.error('deleteProject error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete project.' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateStatus,
  updateBuildLink,
  updateProject,
  acceptDeclaration,
  deleteProject,
};

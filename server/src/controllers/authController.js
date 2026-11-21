const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      company_name: user.company_name,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Register customer or admin
const register = async (req, res) => {
  try {
    const { name, email, password, company_name, phone, role = 'customer', invite_token } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    // Role protection: only allow 'admin' if explicit secret matches or if creating customer
    let assignedRole = 'customer';
    if (role === 'admin') {
      if (req.body.admin_secret && req.body.admin_secret === (process.env.ADMIN_SIGNUP_SECRET || 'workroom_admin_2026')) {
        assignedRole = 'admin';
      } else {
        return res.status(403).json({ error: 'Invalid admin registration secret.' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, company_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, company_name, phone, created_at`,
      [name.trim(), cleanEmail, passwordHash, assignedRole, company_name || null, phone || null]
    );

    const user = result.rows[0];

    // Auto-link any existing projects for this client email to this newly registered customer
    await query(
      `UPDATE projects SET client_id = $1 WHERE LOWER(client_email) = $2 AND client_id IS NULL`,
      [user.id, cleanEmail]
    );

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: error.message || 'Registration failed.' });
  }
};

// Login customer or admin
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Match by email, or allow default admin email aliases
    const result = await query(
      `SELECT id, name, email, password_hash, role, company_name, phone, avatar_url, must_reset_password, created_at
       FROM users
       WHERE email = $1
          OR (email IN ('sojanonelson54@gmail.com', 'workroom.admin@gmail.com', 'admin@workroom.io') AND $1 IN ('sojanonelson54@gmail.com', 'workroom.admin@gmail.com', 'admin@workroom.io'))
       LIMIT 1`,
      [cleanEmail]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Ensure projects with this email are linked to the user
    await query(
      `UPDATE projects SET client_id = $1 WHERE LOWER(client_email) = $2 AND client_id IS NULL`,
      [user.id, user.email]
    );

    const token = generateToken(user);
    delete user.password_hash;

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        ...user,
        must_reset_password: Boolean(user.must_reset_password),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Login failed.' });
  }
};

// Reset first time password
const resetFirstPassword = async (req, res) => {
  try {
    const { new_password } = req.body;

    if (!new_password || new_password.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const passwordHash = await bcrypt.hash(new_password.trim(), 10);
    const result = await query(
      `UPDATE users
       SET password_hash = $1, must_reset_password = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, role, company_name, phone, avatar_url, must_reset_password, created_at`,
      [passwordHash, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updatedUser = result.rows[0];
    const token = generateToken(updatedUser);
    delete updatedUser.password_hash;

    return res.json({
      message: 'Password reset successfully. Your new password is now active.',
      token,
      user: {
        ...updatedUser,
        must_reset_password: false,
      },
    });
  } catch (error) {
    console.error('resetFirstPassword error:', error);
    return res.status(500).json({ error: error.message || 'Failed to reset password.' });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, company_name, phone, must_reset_password, created_at
       FROM users
       ORDER BY (role = 'admin') DESC, created_at DESC`
    );
    return res.json({ users: result.rows });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch users.' });
  }
};

// Update user role (Admin only - promote to admin or demote to customer)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "admin" or "customer".' });
    }

    if (req.user.id === id && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot revoke your own admin status.' });
    }

    const result = await query(
      `UPDATE users
       SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, role, company_name, phone, must_reset_password, created_at`,
      [role, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({
      message: `User role successfully updated to ${role}.`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('updateUserRole error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update user role.' });
  }
};

// Update user name (Admin only)
const updateUserName = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty.' });
    }

    const result = await query(
      `UPDATE users
       SET name = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, role, company_name, phone, must_reset_password, created_at`,
      [name.trim(), id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({
      message: 'Name updated successfully.',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('updateUserName error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update user name.' });
  }
};

// Create new admin account or upgrade existing by email (Admin only)
const createAdminUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await query('SELECT id, role FROM users WHERE email = $1', [cleanEmail]);

    if (existing.rowCount > 0) {
      const result = await query(
        `UPDATE users
         SET role = 'admin', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING id, name, email, role, company_name, phone, must_reset_password, created_at`,
        [existing.rows[0].id]
      );
      return res.json({
        message: `Existing user ${cleanEmail} promoted to Admin.`,
        user: result.rows[0],
      });
    }

    const tempPassword = password && password.trim() ? password.trim() : 'Admin@123';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, company_name, must_reset_password)
       VALUES ($1, $2, $3, 'admin', 'Workroom Studio', TRUE)
       RETURNING id, name, email, role, company_name, phone, must_reset_password, created_at`,
      [name.trim(), cleanEmail, passwordHash]
    );

    return res.status(201).json({
      message: `Admin account created for ${cleanEmail} with temporary password: ${tempPassword}`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('createAdminUser error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create admin user.' });
  }
};

// Get current profile
const getMe = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, company_name, phone, avatar_url, must_reset_password, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({
      user: {
        ...result.rows[0],
        must_reset_password: Boolean(result.rows[0].must_reset_password),
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch user profile.' });
  }
};

module.exports = {
  register,
  login,
  resetFirstPassword,
  getAllUsers,
  updateUserRole,
  updateUserName,
  createAdminUser,
  getMe,
};

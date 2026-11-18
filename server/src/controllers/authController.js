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
    const { email, password, expected_role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const result = await query(
      `SELECT id, name, email, password_hash, role, company_name, phone, avatar_url, created_at
       FROM users WHERE email = $1`,
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

    // Role check if frontend specifies expected role (admin or customer)
    if (expected_role && user.role !== expected_role) {
      return res.status(403).json({
        error: `Access denied. This portal requires ${expected_role} access, but your account is registered as ${user.role}.`,
      });
    }

    // Ensure projects with this email are linked to the user
    await query(
      `UPDATE projects SET client_id = $1 WHERE LOWER(client_email) = $2 AND client_id IS NULL`,
      [user.id, cleanEmail]
    );

    const token = generateToken(user);
    delete user.password_hash;

    return res.json({
      message: 'Login successful.',
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Login failed.' });
  }
};

// Get current profile
const getMe = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, company_name, phone, avatar_url, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch user profile.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
};

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { query, isDbConnected } = require('../config/db');

const initDB = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 [Workroom] Initializing database schema on PostgreSQL...');
    await query(schemaSql);
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN DEFAULT FALSE;');
    console.log('✅ [Workroom] Database schema initialized successfully.');

    // Seed default admin if none exists
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'sojanonelson54@gmail.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.DEFAULT_ADMIN_NAME || 'Sojan Nelson';

    const existingAdmin = await query('SELECT id, email FROM users WHERE role = $1 LIMIT 1', ['admin']);
    if (existingAdmin.rowCount === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await query(
        `INSERT INTO users (name, email, password_hash, role, company_name, phone, must_reset_password)
         VALUES ($1, $2, $3, 'admin', 'Workroom Studio', '+1 (555) 019-2834', TRUE)`,
        [adminName, adminEmail.toLowerCase().trim(), passwordHash]
      );
      console.log(`✅ [Workroom] Default admin account seeded: ${adminEmail} (password: ${adminPassword})`);
    } else {
      console.log(`ℹ️  [Workroom] Admin account found (${existingAdmin.rows[0].email}). Skipping seed.`);
    }

    return true;
  } catch (error) {
    console.error('❌ [Workroom] Database initialization failed:', error.message);
    return false;
  }
};

module.exports = { initDB };

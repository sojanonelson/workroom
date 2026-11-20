const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { query, pool } = require('../config/db');

async function resetDatabase() {
  console.log('🚀 [Workroom] Starting database cleanup...\n');

  try {
    // 1. Delete dependent project data first (respecting foreign key relationships)
    console.log('⏳ Clearing transactions...');
    const txRes = await query('DELETE FROM transactions');
    console.log(`   Deleted ${txRes.rowCount} transactions.`);

    console.log('⏳ Clearing project documents...');
    const docRes = await query('DELETE FROM project_documents');
    console.log(`   Deleted ${docRes.rowCount} documents.`);

    console.log('⏳ Clearing project updates...');
    const updateRes = await query('DELETE FROM project_updates');
    console.log(`   Deleted ${updateRes.rowCount} updates.`);

    console.log('⏳ Clearing projects...');
    const projRes = await query('DELETE FROM projects');
    console.log(`   Deleted ${projRes.rowCount} projects.`);

    // 2. Clear all non-admin users
    console.log('⏳ Clearing non-admin users...');
    const userRes = await query("DELETE FROM users WHERE role != 'admin'");
    console.log(`   Deleted ${userRes.rowCount} non-admin users.`);

    // 3. Ensure admin account exists
    const adminEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@workroom.io').toLowerCase().trim();
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.DEFAULT_ADMIN_NAME || 'Workroom Lead Admin';

    const existingAdmin = await query("SELECT id, name, email FROM users WHERE role = 'admin' LIMIT 1");

    if (existingAdmin.rowCount === 0) {
      console.log('⏳ No admin found. Seeding default admin account...');
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const newAdmin = await query(
        `INSERT INTO users (name, email, password_hash, role, company_name, phone)
         VALUES ($1, $2, $3, 'admin', 'Workroom Studio', '+1 (555) 019-2834')
         RETURNING id, name, email`,
        [adminName, adminEmail, passwordHash]
      );
      console.log(`✅ Default admin created: ${newAdmin.rows[0].email} / ${adminPassword}`);
    } else {
      console.log(`✅ Admin account preserved: ${existingAdmin.rows[0].email} (${existingAdmin.rows[0].name})`);
    }

    // 4. Clean local uploads folder (optional helper)
    const uploadsDir = path.resolve(__dirname, '../../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let removedFiles = 0;
      for (const file of files) {
        if (file !== '.gitkeep') {
          fs.unlinkSync(path.join(uploadsDir, file));
          removedFiles++;
        }
      }
      if (removedFiles > 0) {
        console.log(`🧹 Cleaned ${removedFiles} uploaded file(s) from server/uploads/`);
      }
    }

    console.log('\n========================================');
    console.log('🎉 Database cleanup complete!');
    console.log('   All data cleared.');
    console.log(`   Preserved Admin Email: ${adminEmail}`);
    console.log(`   Default Password:      ${adminPassword}`);
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };

const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

let pool = null;
let isConnected = false;

if (connectionString) {
  // Render PostgreSQL requires SSL with rejectUnauthorized: false when connecting remotely
  const isCloudOrRender =
    connectionString.includes('render.com') ||
    connectionString.includes('sslmode=require') ||
    process.env.DB_SSL === 'true' ||
    process.env.NODE_ENV === 'production';

  pool = new Pool({
    connectionString,
    ssl: isCloudOrRender ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('connect', () => {
    isConnected = true;
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err.message);
    isConnected = false;
  });
} else {
  console.warn(
    '\n⚠️  [Workroom Warning] DATABASE_URL is not set in server/.env.\n' +
    'Please set your Render PostgreSQL database connection string in server/.env to enable database persistence.\n'
  );
}

const query = async (text, params) => {
  if (!pool) {
    throw new Error('Database pool not initialized. Please set DATABASE_URL in server/.env.');
  }
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_SQL === 'true') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

const getClient = async () => {
  if (!pool) {
    throw new Error('Database pool not initialized.');
  }
  return await pool.connect();
};

module.exports = {
  pool,
  query,
  getClient,
  isDbConnected: () => isConnected,
};

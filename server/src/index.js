const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const { initDB } = require('./db/init');
const { isCloudinaryConfigured } = require('./config/cloudinary');
const { isDbConnected, pool } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const updateRoutes = require('./routes/updateRoutes');
const documentRoutes = require('./routes/documentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Allowed CORS Origins
const allowedOrigins = [
  'https://workroom-status.vercel.app',
  'https://workroom-status.vercel.app/login',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5001',
];

if (process.env.CLIENT_URL) {
  const envOrigins = process.env.CLIENT_URL.split(',').map((o) => o.trim().replace(/\/$/, ''));
  allowedOrigins.push(...envOrigins);
}

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');
      const isAllowed =
        allowedOrigins.some((allowed) => {
          const cleanAllowed = allowed.replace(/\/$/, '');
          return cleanOrigin === cleanAllowed || cleanOrigin.startsWith(cleanAllowed);
        }) ||
        origin.includes('workroom-status.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1');

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
  })
);
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists and is served statically
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// System Health & Diagnostics endpoint
app.get('/api/health', (req, res) => {
  const isNeon = process.env.DATABASE_URL?.includes('neon.tech');
  res.json({
    status: 'online',
    appName: 'Workroom API',
    database: {
      connected: isDbConnected(),
      engine: isNeon ? 'PostgreSQL (Neon)' : 'PostgreSQL',
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    },
    cloudinary: {
      configured: isCloudinaryConfigured,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/public', publicRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

// Start Server and initialize DB
app.listen(PORT, async () => {
  console.log(`\n==============================================`);
  console.log(`🚀 Workroom Server running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📁 Local uploads dir: ${uploadsDir}`);
  console.log(`==============================================\n`);

  if (process.env.DATABASE_URL) {
    await initDB();
  } else {
    console.warn(
      '⚠️  [Notice] DATABASE_URL not set in server/.env.\n' +
      'To connect to your Render PostgreSQL database, add:\n' +
      'DATABASE_URL=postgres://username:password@dpg-xxx.oregon-postgres.render.com/dbname\n'
    );
  }
});

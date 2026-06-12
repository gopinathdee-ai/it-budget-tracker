// src/server.js
// Main entry point - automatically runs migrations if needed

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import knex from 'knex';
import knexConfig from '../knexfile.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database connection
export const db = knex(knexConfig[NODE_ENV]);

// ===== Middleware =====
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Parse URL-encoded

// ===== Database Health Check =====
async function checkDatabaseConnection() {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// ===== Auto-Run Migrations =====
async function runMigrations() {
  try {
    console.log('Running database migrations...');
    const migrations = await db.migrate.latest();
    console.log('✅ Migrations completed successfully');
    console.log(`   Migrations run: ${migrations[1].length}`);
    return true;
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    return false;
  }
}

// ===== Health Check Endpoint =====
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
  });
});

// ===== Info Endpoint =====
app.get('/api/info', (req, res) => {
  res.json({
    name: 'IT Budget App - Backend API',
    version: '1.0.0',
    environment: NODE_ENV,
    database: process.env.DATABASE_NAME,
  });
});

// ===== Routes =====
import gaCostsRoutes from './routes/gacosts.js';
// import authRoutes from './routes/auth.js';
// import projectsRoutes from './routes/projects.js';
// import dashboardRoutes from './routes/dashboard.js';

app.use('/api/gacosts', gaCostsRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/projects', projectsRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
  });
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'Internal server error'
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...(NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// ===== Startup Function =====
async function startServer() {
  try {
    console.log('🚀 Starting IT Budget App Backend');
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   Port: ${PORT}`);
    console.log('');

    // 1. Check database connection
    console.log('📡 Checking database connection...');
    try {
      const dbConnected = await checkDatabaseConnection();
      if (dbConnected) {
        // 2. Run migrations automatically
        console.log('🔄 Running database migrations...');
        await runMigrations();
      } else {
        console.warn('⚠️  Database connection failed, skipping migrations');
      }
    } catch (dbError) {
      console.warn('⚠️  Database error:', dbError.message);
      console.log('   Server will start without database connection');
    }

    // 3. Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('✅ Server started successfully!');
      console.log(`   API: http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Info: http://localhost:${PORT}/api/info`);
      console.log('');
      console.log('Ready to accept requests!');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// ===== Graceful Shutdown =====
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database...');
  await db.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database...');
  await db.destroy();
  process.exit(0);
});

// Start the server
startServer();

export default app;

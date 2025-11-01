import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL Connection Pool Configuration
 *
 * Connection pooling improves performance by reusing database connections
 * instead of creating a new connection for each query.
 *
 * Pool settings:
 * - max: Maximum number of clients in the pool (default: 20)
 * - idleTimeoutMillis: Close idle clients after this time (default: 30s)
 * - connectionTimeoutMillis: Return error if connection takes longer (default: 10s)
 */

// Railway provides DATABASE_URL in production
const connectionString = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

const poolConfig: PoolConfig = connectionString
  ? {
      // Use connection string (Railway)
      connectionString,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      // Use individual parameters (Local development)
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'bookit',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

// Create the connection pool
const pool = new Pool(poolConfig);

// Event handlers for monitoring
pool.on('connect', () => {
  console.log('🔌 Database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  // Don't exit in production, let the app try to recover
  if (!isProduction) {
    process.exit(-1);
  }
});

pool.on('remove', () => {
  console.log('🔌 Database client removed from pool');
});

/**
 * Test database connection
 */
export const testConnection = async (): Promise<void> => {
  try {
    console.log('🔄 Testing database connection...');
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), current_database(), current_user');
    
    console.log('✅ Database connected successfully!');
    console.log('   Time:', result.rows[0].now);
    console.log('   Database:', result.rows[0].current_database);
    console.log('   User:', result.rows[0].current_user);
    
    client.release();
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    console.error('📋 Connection details:', {
      usingConnectionString: !!connectionString,
      host: process.env.DB_HOST || 'from DATABASE_URL',
      port: process.env.DB_PORT || 'from DATABASE_URL',
      database: process.env.DB_NAME || 'from DATABASE_URL',
      user: process.env.DB_USER || 'from DATABASE_URL',
      hasPassword: !!process.env.DB_PASSWORD || !!connectionString,
      environment: process.env.NODE_ENV || 'development',
      ssl: isProduction ? 'enabled' : 'disabled'
    });
    throw error;
  }
};

/**
 * Execute a query with the connection pool
 */
export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 100ms) in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log('⚠️ Slow query detected:', {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rows: result.rowCount
      });
    }

    // Log all queries in production if duration > 500ms
    if (isProduction && duration > 500) {
      console.warn('🐌 Very slow query in production:', {
        duration: `${duration}ms`,
        rows: result.rowCount
      });
    }

    return result;
  } catch (error: any) {
    console.error('❌ Query error:', { 
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      error: error.message 
    });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 */
export const getClient = async () => {
  try {
    const client = await pool.connect();
    console.log('📦 Client acquired from pool');
    return client;
  } catch (error: any) {
    console.error('❌ Failed to get client from pool:', error.message);
    throw error;
  }
};

/**
 * Close the connection pool
 * Used for graceful shutdown
 */
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('🔌 Database pool closed gracefully');
  } catch (error: any) {
    console.error('❌ Error closing pool:', error.message);
    throw error;
  }
};

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing database pool...');
  await closePool();
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing database pool...');
  await closePool();
  process.exit(0);
});

export { pool };
export default pool;
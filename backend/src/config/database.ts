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
 * - max: Maximum number of clients in the pool (default: 10)
 * - idleTimeoutMillis: Close idle clients after this time (default: 30s)
 * - connectionTimeoutMillis: Return error if connection takes longer (default: 2s)
 */

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bookit',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Maximum number of connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Return error after 2s if connection fails
};

// Create the connection pool
const pool = new Pool(poolConfig);

// Event handlers for monitoring
pool.on('connect', () => {
  console.log('🔌 Database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Test database connection
 */
export const testConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
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
        text,
        duration: `${duration}ms`,
        rows: result.rowCount
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Query error:', { text, error });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 */
export const getClient = async () => {
  return await pool.connect();
};

/**
 * Close the connection pool
 */
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('🔌 Database pool closed');
};

export default pool;

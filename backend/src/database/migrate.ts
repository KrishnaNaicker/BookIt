import fs from 'fs';
import path from 'path';
import pool from '../config/database';

/**
 * Database Migration Script
 *
 * This script runs the init.sql file to create all database tables,
 * indexes, constraints, and triggers.
 */

async function migrate() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 Running init.sql...');

    // Execute the SQL
    await pool.query(sql);

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Created tables:');
    console.log('   - experiences');
    console.log('   - slots');
    console.log('   - bookings');
    console.log('   - promo_codes\n');

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📋 Verified tables in database:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
migrate();

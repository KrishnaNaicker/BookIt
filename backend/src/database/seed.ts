import fs from 'fs';
import path from 'path';
import pool from '../config/database';

/**
 * Database Seed Script
 *
 * This script populates the database with sample data for development
 * and testing purposes.
 */

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'seed.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 Running seed.sql...');

    // Execute the SQL
    await pool.query(sql);

    console.log('✅ Seeding completed successfully!\n');

    // Show statistics
    const experiencesCount = await pool.query('SELECT COUNT(*) FROM experiences');
    const slotsCount = await pool.query('SELECT COUNT(*) FROM slots');
    const promosCount = await pool.query('SELECT COUNT(*) FROM promo_codes');
    const bookingsCount = await pool.query('SELECT COUNT(*) FROM bookings');

    console.log('📊 Database Statistics:');
    console.log(`   - Experiences: ${experiencesCount.rows[0].count}`);
    console.log(`   - Slots: ${slotsCount.rows[0].count}`);
    console.log(`   - Promo Codes: ${promosCount.rows[0].count}`);
    console.log(`   - Sample Bookings: ${bookingsCount.rows[0].count}\n`);

    // Show sample experiences
    const experiences = await pool.query(`
      SELECT id, title, location, price, category
      FROM experiences
      ORDER BY id
      LIMIT 5
    `);

    console.log('🎯 Sample Experiences:');
    experiences.rows.forEach(exp => {
      console.log(`   ${exp.id}. ${exp.title} (${exp.location}) - $${exp.price}`);
    });

    console.log('\n💡 Promo Codes Available:');
    const promos = await pool.query(`
      SELECT code, discount_type, discount_value, valid_until
      FROM promo_codes
      WHERE is_active = true
      ORDER BY code
    `);

    promos.rows.forEach(promo => {
      const discount = promo.discount_type === 'percentage'
        ? `${promo.discount_value}%`
        : `$${promo.discount_value}`;
      console.log(`   - ${promo.code}: ${discount} off`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run seeding
seed();

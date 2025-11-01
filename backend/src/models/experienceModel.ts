import { query } from '../config/database';
import type { Experience, ExperienceWithSlots, ExperienceQueryParams } from '../types';

/**
 * Experience Model/Repository
 *
 * This class encapsulates all database operations related to experiences.
 * Using the repository pattern keeps database logic separate from controllers.
 */

export class ExperienceModel {
  /**
   * Get all experiences with optional filtering and pagination
   */
  static async findAll(params: ExperienceQueryParams = {}): Promise<Experience[]> {
    const {
      limit = 50,
      offset = 0,
      category,
      min_price,
      max_price,
      sort_by = 'rating',
      sort_order = 'desc'
    } = params;

    let sql = 'SELECT * FROM experiences WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    // Add category filter
    if (category) {
      sql += ` AND category = $${paramCount}`;
      values.push(category);
      paramCount++;
    }

    // Add price range filters
    if (min_price !== undefined) {
      sql += ` AND price >= $${paramCount}`;
      values.push(min_price);
      paramCount++;
    }

    if (max_price !== undefined) {
      sql += ` AND price <= $${paramCount}`;
      values.push(max_price);
      paramCount++;
    }

    // Add sorting
    const validSortColumns = ['price', 'rating', 'reviews_count', 'created_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'rating';
    const sortDirection = sort_order === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortColumn} ${sortDirection}`;

    // Add pagination
    sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  }

  /**
   * Get a single experience by ID
   */
  static async findById(id: number): Promise<Experience | null> {
    const sql = 'SELECT * FROM experiences WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get experience with available slots
   */
  static async findByIdWithSlots(id: number): Promise<ExperienceWithSlots | null> {
    // Get the experience
    const experience = await this.findById(id);
    if (!experience) {
      return null;
    }

    // Get available slots (future dates only)
    const slotsSql = `
      SELECT *
      FROM slots
      WHERE experience_id = $1
        AND date >= CURRENT_DATE
        AND booked_count < capacity
      ORDER BY date, start_time
    `;
    const slotsResult = await query(slotsSql, [id]);

    return {
      ...experience,
      available_slots: slotsResult.rows
    };
  }

  /**
   * Get all unique categories
   */
  static async getCategories(): Promise<string[]> {
    const sql = `
      SELECT DISTINCT category
      FROM experiences
      WHERE category IS NOT NULL
      ORDER BY category
    `;
    const result = await query(sql);
    return result.rows.map((row: any) => row.category);
  }

  /**
   * Search experiences by title or description
   */
  static async search(searchTerm: string): Promise<Experience[]> {
    const sql = `
      SELECT *
      FROM experiences
      WHERE title ILIKE $1 OR description ILIKE $1
      ORDER BY rating DESC
      LIMIT 20
    `;
    const result = await query(sql, [`%${searchTerm}%`]);
    return result.rows;
  }

  /**
   * Create a new experience (for admin functionality)
   */
  static async create(experience: Omit<Experience, 'id' | 'created_at' | 'updated_at'>): Promise<Experience> {
    const sql = `
      INSERT INTO experiences (
        title, description, location, price, image_url,
        duration, rating, reviews_count, category
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      experience.title,
      experience.description,
      experience.location,
      experience.price,
      experience.image_url,
      experience.duration,
      experience.rating,
      experience.reviews_count,
      experience.category
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }
}

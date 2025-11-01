import { query } from '../config/database';
import { Slot, SlotWithAvailability } from '../types';

/**
 * Slot Model/Repository
 *
 * Handles slot-related database operations
 */

export class SlotModel {
  /**
   * Find slot by ID
   */
  static async findById(id: number): Promise<Slot | null> {
    const sql = 'SELECT * FROM slots WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all slots for an experience with availability info
   */
  static async findByExperienceId(experienceId: number): Promise<SlotWithAvailability[]> {
    const sql = `
      SELECT
        *,
        (capacity - booked_count) as available_spots,
        CASE
          WHEN booked_count < capacity THEN true
          ELSE false
        END as is_available
      FROM slots
      WHERE experience_id = $1
        AND date >= CURRENT_DATE
      ORDER BY date, start_time
    `;
    const result = await query(sql, [experienceId]);
    return result.rows;
  }

  /**
   * Get slots for a specific date
   */
  static async findByDate(experienceId: number, date: Date): Promise<SlotWithAvailability[]> {
    const sql = `
      SELECT
        *,
        (capacity - booked_count) as available_spots,
        CASE
          WHEN booked_count < capacity THEN true
          ELSE false
        END as is_available
      FROM slots
      WHERE experience_id = $1
        AND date = $2
        AND date >= CURRENT_DATE
      ORDER BY start_time
    `;
    const result = await query(sql, [experienceId, date]);
    return result.rows;
  }

  /**
   * Check if a slot is available for booking
   */
  static async checkAvailability(slotId: number, participants: number): Promise<boolean> {
    const sql = `
      SELECT (capacity - booked_count) as available_spots
      FROM slots
      WHERE id = $1
    `;
    const result = await query(sql, [slotId]);

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows[0].available_spots >= participants;
  }

  /**
   * Get available dates for an experience (dates that have at least one available slot)
   */
  static async getAvailableDates(experienceId: number): Promise<Date[]> {
    const sql = `
      SELECT DISTINCT date
      FROM slots
      WHERE experience_id = $1
        AND date >= CURRENT_DATE
        AND booked_count < capacity
      ORDER BY date
    `;
    const result = await query(sql, [experienceId]);
    return result.rows.map((row: any) => row.date);
  }

  /**
   * Create a new slot (admin function)
   */
  static async create(slotData: Omit<Slot, 'id' | 'created_at' | 'updated_at' | 'booked_count'>): Promise<Slot> {
    const sql = `
      INSERT INTO slots (
        experience_id, date, start_time, end_time, capacity
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      slotData.experience_id,
      slotData.date,
      slotData.start_time,
      slotData.end_time,
      slotData.capacity
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Update slot capacity (admin function)
   */
  static async updateCapacity(slotId: number, newCapacity: number): Promise<Slot | null> {
    // Ensure new capacity is not less than current bookings
    const checkSql = 'SELECT booked_count FROM slots WHERE id = $1';
    const checkResult = await query(checkSql, [slotId]);

    if (checkResult.rows.length === 0) {
      throw new Error('Slot not found');
    }

    if (newCapacity < checkResult.rows[0].booked_count) {
      throw new Error('Cannot set capacity lower than current bookings');
    }

    const updateSql = `
      UPDATE slots
      SET capacity = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(updateSql, [newCapacity, slotId]);
    return result.rows[0] || null;
  }
}

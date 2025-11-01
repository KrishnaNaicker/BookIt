import { getClient, query } from '../config/database';
import { Booking, CreateBookingRequest, BookingResponse } from '../types';
import { PoolClient } from 'pg';

/**
 * Booking Model/Repository
 *
 * Handles all booking-related database operations including
 * transaction management for atomic booking creation.
 */

export class BookingModel {
  /**
   * Create a new booking with transaction support
   * This ensures atomicity: either all operations succeed or all fail
   */
  static async create(bookingData: CreateBookingRequest, discountAmount: number = 0): Promise<BookingResponse> {
    const client: PoolClient = await getClient();

    try {
      // Start transaction
      await client.query('BEGIN');

      // 1. Check slot availability (with row lock to prevent race conditions)
      const slotCheckSql = `
        SELECT s.*, e.price
        FROM slots s
        JOIN experiences e ON e.id = s.experience_id
        WHERE s.id = $1 AND s.experience_id = $2
        FOR UPDATE
      `;
      const slotResult = await client.query(slotCheckSql, [
        bookingData.slot_id,
        bookingData.experience_id
      ]);

      if (slotResult.rows.length === 0) {
        throw new Error('Slot not found or does not belong to this experience');
      }

      const slot = slotResult.rows[0];

      // Check if slot has enough capacity
      const availableSpots = slot.capacity - slot.booked_count;
      if (availableSpots < bookingData.participants) {
        throw new Error(
          `Not enough spots available. Only ${availableSpots} spot(s) remaining.`
        );
      }

      // 2. Calculate total price
      const basePrice = slot.price * bookingData.participants;
      const totalPrice = basePrice - discountAmount;

      // 3. Create the booking
      const createBookingSql = `
        INSERT INTO bookings (
          experience_id, slot_id, user_name, user_email, user_phone,
          participants, total_price, promo_code, discount_amount, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'confirmed')
        RETURNING *
      `;
      const bookingValues = [
        bookingData.experience_id,
        bookingData.slot_id,
        bookingData.user_name,
        bookingData.user_email,
        bookingData.user_phone,
        bookingData.participants,
        totalPrice,
        bookingData.promo_code || null,
        discountAmount
      ];
      const bookingResult = await client.query(createBookingSql, bookingValues);
      const booking = bookingResult.rows[0];

      // 4. Update slot booked_count
      const updateSlotSql = `
        UPDATE slots
        SET booked_count = booked_count + $1
        WHERE id = $2
      `;
      await client.query(updateSlotSql, [bookingData.participants, bookingData.slot_id]);

      // 5. If promo code was used, increment usage count
      if (bookingData.promo_code) {
        const updatePromoSql = `
          UPDATE promo_codes
          SET used_count = used_count + 1
          WHERE code = $1
        `;
        await client.query(updatePromoSql, [bookingData.promo_code]);
      }

      // Commit transaction
      await client.query('COMMIT');

      // 6. Fetch complete booking details
      return await this.findById(booking.id);

    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release client back to pool
      client.release();
    }
  }

  /**
   * Get booking by ID with experience and slot details
   */
  static async findById(id: number): Promise<BookingResponse> {
    const sql = `
      SELECT
        b.*,
        e.title as experience_title,
        e.location as experience_location,
        s.date as slot_date,
        s.start_time as slot_start_time,
        s.end_time as slot_end_time
      FROM bookings b
      JOIN experiences e ON e.id = b.experience_id
      JOIN slots s ON s.id = b.slot_id
      WHERE b.id = $1
    `;
    const result = await query(sql, [id]);
    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }
    return result.rows[0];
  }

  /**
   * Get all bookings for a user by email
   */
  static async findByUserEmail(email: string): Promise<BookingResponse[]> {
    const sql = `
      SELECT
        b.*,
        e.title as experience_title,
        e.location as experience_location,
        s.date as slot_date,
        s.start_time as slot_start_time,
        s.end_time as slot_end_time
      FROM bookings b
      JOIN experiences e ON e.id = b.experience_id
      JOIN slots s ON s.id = b.slot_id
      WHERE b.user_email = $1
      ORDER BY b.created_at DESC
    `;
    const result = await query(sql, [email]);
    return result.rows;
  }

  /**
   * Cancel a booking
   */
  static async cancel(id: number): Promise<Booking> {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Get booking details
      const bookingSql = 'SELECT * FROM bookings WHERE id = $1 FOR UPDATE';
      const bookingResult = await client.query(bookingSql, [id]);

      if (bookingResult.rows.length === 0) {
        throw new Error('Booking not found');
      }

      const booking = bookingResult.rows[0];

      if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }

      // Update booking status
      const updateBookingSql = `
        UPDATE bookings
        SET status = 'cancelled'
        WHERE id = $1
        RETURNING *
      `;
      const result = await client.query(updateBookingSql, [id]);

      // Decrease slot booked_count
      const updateSlotSql = `
        UPDATE slots
        SET booked_count = booked_count - $1
        WHERE id = $2
      `;
      await client.query(updateSlotSql, [booking.participants, booking.slot_id]);

      // Decrease promo code usage if applicable
      if (booking.promo_code) {
        const updatePromoSql = `
          UPDATE promo_codes
          SET used_count = used_count - 1
          WHERE code = $1
        `;
        await client.query(updatePromoSql, [booking.promo_code]);
      }

      await client.query('COMMIT');
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

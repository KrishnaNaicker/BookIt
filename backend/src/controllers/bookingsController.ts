import { Request, Response } from 'express';
import { BookingModel } from '../models/bookingModel';
import { PromoCodeModel } from '../models/promoCodeModel';
import { SlotModel } from '../models/slotModel';
import { CreateBookingRequest } from '../types';

/**
 * Bookings Controller
 *
 * Handles all booking-related operations including creation,
 * retrieval, and cancellation.
 */

export class BookingsController {
  /**
   * Create a new booking
   *
   * POST /api/bookings
   *
   * Body:
   * - experience_id: number
   * - slot_id: number
   * - user_name: string
   * - user_email: string
   * - user_phone: string
   * - participants: number
   * - promo_code: string (optional)
   */
  static async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingData: CreateBookingRequest = {
        experience_id: parseInt(req.body.experience_id),
        slot_id: parseInt(req.body.slot_id),
        user_name: req.body.user_name?.trim(),
        user_email: req.body.user_email?.trim().toLowerCase(),
        user_phone: req.body.user_phone?.trim(),
        participants: parseInt(req.body.participants),
        promo_code: req.body.promo_code?.trim().toUpperCase()
      };

      // Validation
      const errors: string[] = [];

      if (!bookingData.experience_id || isNaN(bookingData.experience_id)) {
        errors.push('Valid experience_id is required');
      }

      if (!bookingData.slot_id || isNaN(bookingData.slot_id)) {
        errors.push('Valid slot_id is required');
      }

      if (!bookingData.user_name || bookingData.user_name.length < 2) {
        errors.push('Name must be at least 2 characters');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!bookingData.user_email || !emailRegex.test(bookingData.user_email)) {
        errors.push('Valid email is required');
      }

      // Phone validation (basic)
      if (!bookingData.user_phone || bookingData.user_phone.length < 10) {
        errors.push('Valid phone number is required (min 10 digits)');
      }

      if (!bookingData.participants || bookingData.participants < 1) {
        errors.push('At least 1 participant is required');
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
        return;
      }

      // Check slot availability
      const isAvailable = await SlotModel.checkAvailability(
        bookingData.slot_id,
        bookingData.participants
      );

      if (!isAvailable) {
        res.status(400).json({
          success: false,
          error: 'Slot not available',
          message: 'Not enough spots available for the selected slot'
        });
        return;
      }

      // Validate promo code if provided
      let discountAmount = 0;
      if (bookingData.promo_code) {
        // Get slot to calculate base price
        const slot = await SlotModel.findById(bookingData.slot_id);
        if (!slot) {
          res.status(404).json({
            success: false,
            error: 'Slot not found'
          });
          return;
        }

        // Fetch experience price
        const { query } = await import('../config/database');
        const priceResult = await query(
          'SELECT price FROM experiences WHERE id = $1',
          [bookingData.experience_id]
        );

        if (priceResult.rows.length === 0) {
          res.status(404).json({
            success: false,
            error: 'Experience not found'
          });
          return;
        }

        const basePrice = parseFloat(priceResult.rows[0].price) * bookingData.participants;

        const promoValidation = await PromoCodeModel.validate(
          bookingData.promo_code,
          basePrice
        );

        if (!promoValidation.valid) {
          res.status(400).json({
            success: false,
            error: 'Invalid promo code',
            message: promoValidation.message
          });
          return;
        }

        discountAmount = promoValidation.discount_amount;
      }

      // Create the booking (with transaction)
      const booking = await BookingModel.create(bookingData, discountAmount);

      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully'
      });

    } catch (error) {
      console.error('Error creating booking:', error);

      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Not enough spots')) {
          res.status(400).json({
            success: false,
            error: 'Booking failed',
            message: error.message
          });
          return;
        }

        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: 'Resource not found',
            message: error.message
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create booking',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get booking by ID
   *
   * GET /api/bookings/:id
   */
  static async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking ID'
        });
        return;
      }

      const booking = await BookingModel.findById(id);

      res.status(200).json({
        success: true,
        data: booking
      });

    } catch (error) {
      if (error instanceof Error && error.message === 'Booking not found') {
        res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
        return;
      }

      console.error('Error fetching booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get bookings by user email
   *
   * GET /api/bookings/user/:email
   */
  static async getBookingsByEmail(req: Request, res: Response): Promise<void> {
    try {
      const email = req.params.email.trim().toLowerCase();

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
        return;
      }

      const bookings = await BookingModel.findByUserEmail(email);

      res.status(200).json({
        success: true,
        data: bookings,
        count: bookings.length
      });

    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Cancel a booking
   *
   * DELETE /api/bookings/:id
   */
  static async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking ID'
        });
        return;
      }

      const booking = await BookingModel.cancel(id);

      res.status(200).json({
        success: true,
        data: booking,
        message: 'Booking cancelled successfully'
      });

    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Booking not found') {
          res.status(404).json({
            success: false,
            error: 'Booking not found'
          });
          return;
        }

        if (error.message === 'Booking is already cancelled') {
          res.status(400).json({
            success: false,
            error: 'Booking already cancelled',
            message: error.message
          });
          return;
        }
      }

      console.error('Error cancelling booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel booking',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

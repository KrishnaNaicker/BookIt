import { Router } from 'express';
import { BookingsController } from '../controllers/bookingsController';

/**
 * Bookings Routes
 *
 * Handles all booking-related endpoints
 */

const router = Router();

/**
 * @route   GET /api/bookings/user/:email
 * @desc    Get all bookings for a user by email
 * @param   email - User's email address
 * @access  Public (in production, should be authenticated)
 */
router.get('/user/:email', BookingsController.getBookingsByEmail);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @param   id - Booking ID
 * @access  Public (in production, should be authenticated)
 */
router.get('/:id', BookingsController.getBookingById);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @body    { experience_id, slot_id, user_name, user_email, user_phone, participants, promo_code }
 * @access  Public
 */
router.post('/', BookingsController.createBooking);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel a booking
 * @param   id - Booking ID
 * @access  Public (in production, should be authenticated)
 */
router.delete('/:id', BookingsController.cancelBooking);

export default router;

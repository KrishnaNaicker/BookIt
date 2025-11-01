import { Router } from 'express';
import { PromoController } from '../controllers/promoController';

/**
 * Promo Codes Routes
 *
 * Handles promo code validation and retrieval
 */

const router = Router();

/**
 * @route   POST /api/promo/validate
 * @desc    Validate a promo code and calculate discount
 * @body    { code, amount }
 * @access  Public
 */
router.post('/validate', PromoController.validatePromo);

/**
 * @route   GET /api/promo/active
 * @desc    Get all active promo codes
 * @access  Public
 */
router.get('/active', PromoController.getActivePromos);

export default router;

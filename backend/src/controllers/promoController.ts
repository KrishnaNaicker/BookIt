import { Request, Response } from 'express';
import { PromoCodeModel } from '../models/promoCodeModel';

/**
 * Promo Codes Controller
 *
 * Handles promo code validation and retrieval
 */

export class PromoController {
  /**
   * Validate a promo code
   *
   * POST /api/promo/validate
   *
   * Body:
   * - code: string (promo code)
   * - amount: number (total amount before discount)
   */
  static async validatePromo(req: Request, res: Response): Promise<void> {
    try {
      const { code, amount } = req.body;

      // Validation
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Promo code is required'
        });
        return;
      }

      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        res.status(400).json({
          success: false,
          error: 'Valid amount is required'
        });
        return;
      }

      const promoCode = code.trim().toUpperCase();
      const totalAmount = parseFloat(amount);

      // Validate the promo code
      const validation = await PromoCodeModel.validate(promoCode, totalAmount);

      if (validation.valid) {
        res.status(200).json({
          success: true,
          data: {
            valid: true,
            code: promoCode,
            discount_amount: validation.discount_amount,
            discount_type: validation.discount_type,
            discount_value: validation.discount_value,
            final_amount: totalAmount - validation.discount_amount
          },
          message: validation.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid promo code',
          message: validation.message,
          data: {
            valid: false,
            code: promoCode
          }
        });
      }

    } catch (error) {
      console.error('Error validating promo code:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate promo code',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all active promo codes
   *
   * GET /api/promo/active
   *
   * Note: In production, you might want to restrict this endpoint
   * or only show codes to authenticated admin users
   */
  static async getActivePromos(req: Request, res: Response): Promise<void> {
    try {
      const promoCodes = await PromoCodeModel.findActive();

      // Return limited information (hide sensitive details)
      const publicPromoCodes = promoCodes.map(promo => ({
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        min_amount: promo.min_amount,
        valid_until: promo.valid_until
      }));

      res.status(200).json({
        success: true,
        data: publicPromoCodes,
        count: publicPromoCodes.length
      });

    } catch (error) {
      console.error('Error fetching promo codes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch promo codes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

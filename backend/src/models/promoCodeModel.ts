import { query } from '../config/database';
import { PromoCode, PromoValidationResult } from '../types';

/**
 * PromoCode Model/Repository
 *
 * Handles promo code validation and discount calculations
 */

export class PromoCodeModel {
  /**
   * Find a promo code by code string
   */
  static async findByCode(code: string): Promise<PromoCode | null> {
    const sql = 'SELECT * FROM promo_codes WHERE code = $1';
    const result = await query(sql, [code]);
    return result.rows[0] || null;
  }

  /**
   * Validate a promo code and calculate discount
   */
  static async validate(code: string, amount: number): Promise<PromoValidationResult> {
    const promo = await this.findByCode(code);

    // Check if promo code exists
    if (!promo) {
      return {
        valid: false,
        discount_amount: 0,
        message: 'Invalid promo code'
      };
    }

    // Check if promo code is active
    if (!promo.is_active) {
      return {
        valid: false,
        discount_amount: 0,
        message: 'This promo code is no longer active'
      };
    }

    // Check if promo code has expired
    if (promo.valid_until) {
      const now = new Date();
      const validUntil = new Date(promo.valid_until);
      if (now > validUntil) {
        return {
          valid: false,
          discount_amount: 0,
          message: 'This promo code has expired'
        };
      }
    }

    // Check if promo code has reached max uses
    if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
      return {
        valid: false,
        discount_amount: 0,
        message: 'This promo code has reached its usage limit'
      };
    }

    // Check minimum amount requirement
    if (amount < promo.min_amount) {
      return {
        valid: false,
        discount_amount: 0,
        message: `This promo code requires a minimum purchase of $${promo.min_amount.toFixed(2)}`
      };
    }

    // Calculate discount
    let discountAmount: number;
    if (promo.discount_type === 'percentage') {
      discountAmount = (amount * promo.discount_value) / 100;
    } else {
      // Fixed discount
      discountAmount = promo.discount_value;
    }

    // Ensure discount doesn't exceed the total amount
    discountAmount = Math.min(discountAmount, amount);

    return {
      valid: true,
      discount_amount: discountAmount,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      message: `Promo code applied! You saved $${discountAmount.toFixed(2)}`
    };
  }

  /**
   * Get all active promo codes
   */
  static async findActive(): Promise<PromoCode[]> {
    const sql = `
      SELECT *
      FROM promo_codes
      WHERE is_active = true
        AND (valid_until IS NULL OR valid_until > NOW())
        AND (max_uses IS NULL OR used_count < max_uses)
      ORDER BY discount_value DESC
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Create a new promo code (admin function)
   */
  static async create(promoData: Omit<PromoCode, 'id' | 'created_at' | 'used_count'>): Promise<PromoCode> {
    const sql = `
      INSERT INTO promo_codes (
        code, discount_type, discount_value, min_amount,
        max_uses, valid_until, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      promoData.code.toUpperCase(), // Store codes in uppercase
      promoData.discount_type,
      promoData.discount_value,
      promoData.min_amount,
      promoData.max_uses,
      promoData.valid_until,
      promoData.is_active
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Deactivate a promo code
   */
  static async deactivate(code: string): Promise<PromoCode | null> {
    const sql = `
      UPDATE promo_codes
      SET is_active = false
      WHERE code = $1
      RETURNING *
    `;
    const result = await query(sql, [code]);
    return result.rows[0] || null;
  }
}

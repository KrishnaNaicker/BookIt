/**
 * TypeScript Type Definitions for BookIt Database Models
 *
 * These types ensure type safety throughout the application and serve
 * as documentation for the data structures.
 */

// ============================================
// ENUM Types
// ============================================

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export type DiscountType = 'percentage' | 'fixed';

// ============================================
// Database Models
// ============================================

export interface Experience {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  image_url: string | null;
  duration: number; // in minutes
  rating: number | null;
  reviews_count: number;
  category: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Slot {
  id: number;
  experience_id: number;
  date: Date;
  start_time: string; // TIME format: "HH:MM:SS"
  end_time: string; // TIME format: "HH:MM:SS"
  capacity: number;
  booked_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: number;
  experience_id: number;
  slot_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  participants: number;
  total_price: number;
  promo_code: string | null;
  discount_amount: number;
  status: BookingStatus;
  created_at: Date;
  updated_at: Date;
}

export interface PromoCode {
  id: number;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_amount: number;
  max_uses: number | null;
  used_count: number;
  valid_until: Date | null;
  is_active: boolean;
  created_at: Date;
}

// ============================================
// Request/Response DTOs (Data Transfer Objects)
// ============================================

// Experience with available slots (for details page)
export interface ExperienceWithSlots extends Experience {
  available_slots: Slot[];
}

// Slot with availability info
export interface SlotWithAvailability extends Slot {
  available_spots: number;
  is_available: boolean;
}

// Booking creation request
export interface CreateBookingRequest {
  experience_id: number;
  slot_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  participants: number;
  promo_code?: string;
}

// Booking response (with experience details)
export interface BookingResponse extends Booking {
  experience_title: string;
  experience_location: string;
  slot_date: Date;
  slot_start_time: string;
  slot_end_time: string;
}

// Promo validation request
export interface ValidatePromoRequest {
  code: string;
  experience_id: number;
  amount: number;
}

// Promo validation response
export interface PromoValidationResult {
  valid: boolean;
  discount_amount: number;
  discount_type?: DiscountType;
  discount_value?: number;
  message: string;
}

// ============================================
// Query Parameters
// ============================================

export interface ExperienceQueryParams {
  limit?: number;
  offset?: number;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price' | 'rating' | 'reviews_count';
  sort_order?: 'asc' | 'desc';
}

// ============================================
// Database Error Types
// ============================================

export interface DatabaseError extends Error {
  code?: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

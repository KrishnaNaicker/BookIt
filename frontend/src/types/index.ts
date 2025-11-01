// Experience Types
export interface Experience {
  id: number;
  title: string;
  description: string;
  location: string;
  price: string; // Changed to string to match backend
  image_url: string;
  duration: string; // Changed to string
  rating: number;
  reviews_count: number;
  category?: string;
  created_at?: string;
}

export interface Slot {
  id: number;
  experience_id: number;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  available?: boolean;
}

export interface ExperienceWithSlots extends Experience {
  slots?: Slot[];
  available_slots?: Slot[]; // Added this property
}

// Booking Types
export interface Booking {
  id: number;
  experience_id: number;
  slot_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  participants: number;
  total_price: string; // Changed to string
  promo_code?: string;
  discount_amount?: string; // Changed to string
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  experience?: Experience;
  slot?: Slot;
  // Added properties for Confirmation page
  experience_title?: string;
  experience_location?: string;
  slot_date?: string;
  slot_start_time?: string;
  slot_end_time?: string;
}

export interface CreateBookingRequest {
  experience_id: number;
  slot_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  participants: number;
  promo_code?: string;
}

// Promo Code Types
export interface PromoCode {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount?: number;
  max_uses?: number;
  used_count: number;
  valid_until?: string;
  active: boolean;
}

export interface PromoValidation {
  valid: boolean;
  code?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  discount_amount?: number;
  message?: string;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
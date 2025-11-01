-- BookIt Database Schema
-- This file initializes all tables for the booking platform

-- Drop existing tables if they exist (for development only)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS slots CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;

-- Create ENUM type for booking status
DROP TYPE IF EXISTS booking_status CASCADE;
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Create ENUM type for discount type
DROP TYPE IF EXISTS discount_type CASCADE;
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

-- ============================================
-- EXPERIENCES TABLE
-- ============================================
-- Stores information about travel experiences
CREATE TABLE experiences (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url VARCHAR(500),
    duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
    rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on category for filtering
CREATE INDEX idx_experiences_category ON experiences(category);

-- Index on rating for sorting
CREATE INDEX idx_experiences_rating ON experiences(rating DESC);

-- ============================================
-- SLOTS TABLE
-- ============================================
-- Stores available time slots for each experience
CREATE TABLE slots (
    id SERIAL PRIMARY KEY,
    experience_id INTEGER NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    booked_count INTEGER DEFAULT 0 CHECK (booked_count >= 0 AND booked_count <= capacity),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraint to ensure end_time is after start_time
    CONSTRAINT valid_time_range CHECK (end_time > start_time),

    -- Unique constraint to prevent duplicate slots
    CONSTRAINT unique_slot UNIQUE (experience_id, date, start_time)
);

-- Index on experience_id for joins
CREATE INDEX idx_slots_experience_id ON slots(experience_id);

-- Index on date for filtering available slots
CREATE INDEX idx_slots_date ON slots(date);

-- Composite index for queries filtering by experience and date
CREATE INDEX idx_slots_experience_date ON slots(experience_id, date);

-- ============================================
-- PROMO CODES TABLE
-- ============================================
-- Stores promotional discount codes
CREATE TABLE promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type discount_type NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value >= 0),
    min_amount DECIMAL(10, 2) DEFAULT 0 CHECK (min_amount >= 0),
    max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
    used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraint to ensure used_count doesn't exceed max_uses
    CONSTRAINT valid_usage CHECK (max_uses IS NULL OR used_count <= max_uses)
);

-- Index on code for lookups
CREATE INDEX idx_promo_codes_code ON promo_codes(code);

-- Index on is_active for filtering
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
-- Stores customer bookings
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    experience_id INTEGER NOT NULL REFERENCES experiences(id) ON DELETE RESTRICT,
    slot_id INTEGER NOT NULL REFERENCES slots(id) ON DELETE RESTRICT,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(50) NOT NULL,
    participants INTEGER NOT NULL CHECK (participants > 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    promo_code VARCHAR(50),
    discount_amount DECIMAL(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    status booking_status DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on slot_id for aggregating bookings per slot
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);

-- Index on user_email for looking up user bookings
CREATE INDEX idx_bookings_user_email ON bookings(user_email);

-- Index on created_at for sorting recent bookings
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- Index on status for filtering
CREATE INDEX idx_bookings_status ON bookings(status);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for experiences table
CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for slots table
CREATE TRIGGER update_slots_updated_at
    BEFORE UPDATE ON slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for bookings table
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE experiences IS 'Stores travel experiences available for booking';
COMMENT ON TABLE slots IS 'Available time slots for each experience';
COMMENT ON TABLE bookings IS 'Customer bookings for experience slots';
COMMENT ON TABLE promo_codes IS 'Promotional discount codes';

COMMENT ON COLUMN experiences.duration IS 'Duration in minutes';
COMMENT ON COLUMN experiences.price IS 'Base price per person in USD';
COMMENT ON COLUMN slots.capacity IS 'Maximum number of participants for this slot';
COMMENT ON COLUMN slots.booked_count IS 'Current number of bookings for this slot';
COMMENT ON COLUMN promo_codes.discount_type IS 'Type: percentage (e.g., 10 for 10%) or fixed (e.g., 50 for $50 off)';
COMMENT ON COLUMN promo_codes.discount_value IS 'Discount amount (percentage or fixed dollar amount)';
COMMENT ON COLUMN bookings.participants IS 'Number of people for this booking';

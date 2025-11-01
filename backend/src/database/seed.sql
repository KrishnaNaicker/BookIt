-- BookIt Database Seed Data
-- This file populates the database with sample data for development

-- ============================================
-- EXPERIENCES
-- ============================================

INSERT INTO experiences (title, description, location, price, image_url, duration, rating, reviews_count, category) VALUES
(
    'Sunset Kayaking Adventure',
    'Experience the magic of a breathtaking sunset while kayaking through calm waters. This guided tour takes you through scenic routes perfect for both beginners and experienced kayakers. Enjoy the golden hour as you paddle through peaceful channels, spot local wildlife, and capture stunning photos. All equipment provided including life jackets, paddles, and waterproof bags for your belongings.',
    'Lake Tahoe, California',
    89.99,
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
    120,
    4.8,
    324,
    'Water Sports'
),
(
    'Mountain Hiking & Wine Tasting',
    'Combine the thrill of mountain hiking with the pleasure of wine tasting on this unique full-day experience. Start your morning with a guided 3-hour hike through scenic mountain trails, followed by a gourmet lunch at a mountainside winery. Sample 5 premium local wines while enjoying panoramic valley views. Transportation, hiking gear, lunch, and wine tasting included.',
    'Napa Valley, California',
    159.00,
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    360,
    4.9,
    567,
    'Adventure & Food'
),
(
    'Hot Air Balloon Sunrise Flight',
    'Soar above the desert landscape in a spectacular sunrise hot air balloon flight. Watch the sunrise paint the sky in brilliant colors as you float peacefully over stunning rock formations and canyons. Includes a champagne toast upon landing and a light breakfast. Perfect for special occasions, proposals, or anyone seeking a once-in-a-lifetime experience.',
    'Sedona, Arizona',
    299.00,
    'https://images.unsplash.com/photo-1519217894933-c1414a18d53b',
    180,
    5.0,
    892,
    'Aerial Adventures'
),
(
    'Urban Food Tour: Street Eats',
    'Discover the culinary heart of the city on this 3-hour guided food tour. Visit 6-8 local eateries, from hidden gems to neighborhood favorites. Sample authentic dishes including tacos, dim sum, artisanal pizza, craft donuts, and more. Learn about the cultural history behind each neighborhood while enjoying generous tastings. Vegetarian and dietary restrictions accommodated.',
    'New York City, New York',
    79.00,
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
    180,
    4.7,
    1203,
    'Food & Culture'
),
(
    'Scuba Diving Certification Course',
    'Begin your underwater adventure with this comprehensive beginner scuba diving course. Learn from certified instructors in a safe, controlled environment. Course includes classroom instruction, pool training, and 2 open water dives. All equipment provided. Upon completion, receive your PADI Open Water Diver certification. Small group sizes ensure personalized attention.',
    'Key West, Florida',
    449.00,
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
    480,
    4.9,
    445,
    'Water Sports'
),
(
    'Photography Workshop: Golden Hour',
    'Master the art of golden hour photography with professional photographer guidance. Learn composition, lighting techniques, and camera settings to capture stunning landscape and portrait photos. Visit 3 scenic locations during the magic hour. Includes hands-on instruction, location fees, and photo editing tips. All skill levels welcome. Bring your own DSLR, mirrorless, or advanced smartphone.',
    'Portland, Oregon',
    95.00,
    'https://images.unsplash.com/photo-1452587925148-ce544e77e70d',
    150,
    4.6,
    234,
    'Photography & Art'
),
(
    'Whale Watching Expedition',
    'Embark on an unforgettable whale watching adventure aboard our comfortable vessel. Spot humpback whales, orcas, dolphins, and other marine life with expert naturalist guides. Learn about marine ecosystems and conservation efforts. Heated cabin, outdoor viewing deck, and complimentary hot beverages included. Whale sighting guaranteed or your money back.',
    'Seattle, Washington',
    129.00,
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
    240,
    4.8,
    678,
    'Wildlife & Nature'
),
(
    'Rock Climbing Basics Course',
    'Learn fundamental rock climbing techniques in this half-day beginner course. Professional instructors teach safety, equipment use, basic knots, and climbing techniques. Practice on various routes suited to your skill level. All climbing gear, harnesses, and shoes provided. Indoor climbing gym option available for bad weather. Maximum 6 participants per instructor.',
    'Boulder, Colorado',
    119.00,
    'https://images.unsplash.com/photo-1522163182402-834f871fd851',
    240,
    4.7,
    389,
    'Adventure & Sports'
),
(
    'Sunset Sailing & Seafood Dinner',
    'Enjoy a romantic evening aboard our luxury sailboat. Cruise along the coastline during golden hour while enjoying a gourmet seafood dinner prepared by our onboard chef. Includes unlimited wine, beer, and non-alcoholic beverages. Watch dolphins play in our wake as the sun sets over the ocean. Perfect for couples, anniversaries, or small groups.',
    'San Diego, California',
    189.00,
    'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a',
    180,
    4.9,
    512,
    'Sailing & Dining'
),
(
    'Desert Jeep Safari & Stargazing',
    'Experience the desert like never before on this evening Jeep safari followed by professional stargazing. Navigate rugged terrain in a 4x4 vehicle, visit ancient rock art sites, and learn about desert ecology. After sunset, observe celestial wonders through professional telescopes with an astronomer guide. Includes snacks, beverages, and blankets for stargazing comfort.',
    'Moab, Utah',
    139.00,
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
    210,
    4.8,
    456,
    'Adventure & Nature'
),
(
    'Craft Brewery & Distillery Tour',
    'Sample the best of local craft beverages on this guided tour of 4 breweries and distilleries. Learn about the brewing and distilling process from master craftsmen. Enjoy tastings of 12+ beers, spirits, and ciders. Includes transportation, all tastings, a pretzel snack, and a souvenir tasting glass. Must be 21+ with valid ID.',
    'Denver, Colorado',
    85.00,
    'https://images.unsplash.com/photo-1532634922-8fe0b757fb13',
    240,
    4.6,
    723,
    'Food & Beverage'
),
(
    'Surfing Lessons: Catch Your First Wave',
    'Learn to surf with experienced instructors on beginner-friendly waves. This 2-hour lesson covers ocean safety, paddling techniques, pop-up basics, and wave selection. All equipment provided including wetsuit, surfboard, and rash guard. Small group instruction ensures personalized feedback. Most students stand up on their first day!',
    'Malibu, California',
    79.00,
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f',
    120,
    4.7,
    891,
    'Water Sports'
);

-- ============================================
-- SLOTS
-- ============================================
-- Create slots for the next 14 days for each experience

-- Sunset Kayaking (Experience 1) - Two slots per day at 5:30 PM and 6:00 PM
INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    1,
    CURRENT_DATE + (n || ' days')::interval,
    '17:30:00'::time,
    '19:30:00'::time,
    8,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 5)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    1,
    CURRENT_DATE + (n || ' days')::interval,
    '18:00:00'::time,
    '20:00:00'::time,
    8,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 4)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

-- Mountain Hiking & Wine Tasting (Experience 2) - One slot per day at 9:00 AM (weekends only)
INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    2,
    CURRENT_DATE + (n || ' days')::interval,
    '09:00:00'::time,
    '15:00:00'::time,
    12,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 6)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n
WHERE EXTRACT(DOW FROM CURRENT_DATE + (n || ' days')::interval) IN (0, 6);

-- Hot Air Balloon (Experience 3) - One slot per day at 5:30 AM
INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    3,
    CURRENT_DATE + (n || ' days')::interval,
    '05:30:00'::time,
    '08:30:00'::time,
    6,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 4)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

-- Urban Food Tour (Experience 4) - Two slots per day at 11:00 AM and 2:00 PM
INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    4,
    CURRENT_DATE + (n || ' days')::interval,
    '11:00:00'::time,
    '14:00:00'::time,
    15,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 8)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    4,
    CURRENT_DATE + (n || ' days')::interval,
    '14:00:00'::time,
    '17:00:00'::time,
    15,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 7)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

-- Scuba Diving (Experience 5) - One slot per day at 8:00 AM (weekends only)
INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    5,
    CURRENT_DATE + (n || ' days')::interval,
    '08:00:00'::time,
    '16:00:00'::time,
    6,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 3)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n
WHERE EXTRACT(DOW FROM CURRENT_DATE + (n || ' days')::interval) IN (0, 6);

-- Photography Workshop (Experience 6) - One slot per day at 5:00 PM
INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    6,
    CURRENT_DATE + (n || ' days')::interval,
    '17:00:00'::time,
    '19:30:00'::time,
    10,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 5)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

-- Whale Watching (Experience 7) - Two slots per day at 9:00 AM and 1:00 PM
INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    7,
    CURRENT_DATE + (n || ' days')::interval,
    '09:00:00'::time,
    '13:00:00'::time,
    30,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 15)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    7,
    CURRENT_DATE + (n || ' days')::interval,
    '13:00:00'::time,
    '17:00:00'::time,
    30,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 12)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

-- Rock Climbing (Experience 8) - One slot per day at 10:00 AM
INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    8,
    CURRENT_DATE + (n || ' days')::interval,
    '10:00:00'::time,
    '14:00:00'::time,
    6,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 4)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

-- Sunset Sailing (Experience 9) - One slot per day at 6:00 PM
INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    9,
    CURRENT_DATE + (n || ' days')::interval,
    '18:00:00'::time,
    '21:00:00'::time,
    12,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 6)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

-- Desert Jeep Safari (Experience 10) - One slot per day at 5:00 PM
INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    10,
    CURRENT_DATE + (n || ' days')::interval,
    '17:00:00'::time,
    '20:30:00'::time,
    8,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 4)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

-- Brewery Tour (Experience 11) - Two slots per day at 2:00 PM and 5:00 PM
INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    11,
    CURRENT_DATE + (n || ' days')::interval,
    '14:00:00'::time,
    '18:00:00'::time,
    20,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 10)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    11,
    CURRENT_DATE + (n || ' days')::interval,
    '17:00:00'::time,
    '21:00:00'::time,
    20,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 9)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

-- Surfing Lessons (Experience 12) - Three slots per day at 9:00 AM, 12:00 PM, and 3:00 PM
INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    12,
    CURRENT_DATE + (n || ' days')::interval,
    '09:00:00'::time,
    '11:00:00'::time,
    8,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 5)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    12,
    CURRENT_DATE + (n || ' days')::interval,
    '12:00:00'::time,
    '14:00:00'::time,
    8,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 4)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

INSERT INTO slots (experience_id, date, start_time, end_time, capacity, booked_count)
SELECT
    12,
    CURRENT_DATE + (n || ' days')::interval,
    '15:00:00'::time,
    '17:00:00'::time,
    8,
    CASE
        WHEN n < 3 THEN FLOOR(RANDOM() * 3)::INTEGER
        ELSE 0
    END
FROM generate_series(0, 13) n;

-- ============================================
-- PROMO CODES
-- ============================================

INSERT INTO promo_codes (code, discount_type, discount_value, min_amount, max_uses, used_count, valid_until, is_active) VALUES
('WELCOME20', 'percentage', 20.00, 50.00, 100, 23, CURRENT_DATE + INTERVAL '30 days', true),
('SUMMER50', 'fixed', 50.00, 150.00, 200, 87, CURRENT_DATE + INTERVAL '60 days', true),
('ADVENTURE15', 'percentage', 15.00, 75.00, NULL, 145, CURRENT_DATE + INTERVAL '45 days', true),
('FIRSTTIME', 'percentage', 25.00, 100.00, 500, 234, CURRENT_DATE + INTERVAL '90 days', true),
('EARLYBIRD', 'fixed', 30.00, 120.00, 150, 89, CURRENT_DATE + INTERVAL '15 days', true),
('WEEKEND10', 'percentage', 10.00, 0.00, NULL, 567, CURRENT_DATE + INTERVAL '120 days', true),
('EXPIRED', 'percentage', 30.00, 50.00, 100, 45, CURRENT_DATE - INTERVAL '5 days', false);

-- ============================================
-- SAMPLE BOOKINGS
-- ============================================

-- Add some sample bookings for testing
INSERT INTO bookings (experience_id, slot_id, user_name, user_email, user_phone, participants, total_price, promo_code, discount_amount, status) VALUES
(1, 1, 'John Smith', 'john.smith@email.com', '+1-555-0101', 2, 143.98, 'WELCOME20', 36.00, 'confirmed'),
(4, 7, 'Sarah Johnson', 'sarah.j@email.com', '+1-555-0102', 4, 252.80, 'ADVENTURE15', 44.20, 'confirmed'),
(7, 15, 'Michael Chen', 'mchen@email.com', '+1-555-0103', 2, 258.00, NULL, 0.00, 'confirmed'),
(3, 3, 'Emily Davis', 'emily.d@email.com', '+1-555-0104', 2, 548.00, 'SUMMER50', 50.00, 'confirmed'),
(12, 31, 'David Wilson', 'dwilson@email.com', '+1-555-0105', 1, 79.00, NULL, 0.00, 'confirmed');

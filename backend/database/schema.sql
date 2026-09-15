-- BookMyBanquets Database Schema
-- Run this file to initialize the database

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS vendor_bookings CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS booking_services CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS hall_images CASCADE;
DROP TABLE IF EXISTS hall_amenities CASCADE;
DROP TABLE IF EXISTS halls CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'manager', 'admin')),
  avatar VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_token VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_password_expire TIMESTAMP,
  city VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Halls Table
CREATE TABLE halls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Pakistan',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity_min INTEGER DEFAULT 50,
  capacity_max INTEGER NOT NULL,
  price_per_day DECIMAL(12, 2) NOT NULL,
  price_per_hour DECIMAL(10, 2),
  hall_type VARCHAR(50) CHECK (hall_type IN ('wedding', 'corporate', 'party', 'conference', 'all')),
  parking_capacity INTEGER DEFAULT 0,
  is_ac BOOLEAN DEFAULT true,
  has_kitchen BOOLEAN DEFAULT false,
  has_stage BOOLEAN DEFAULT false,
  has_projector BOOLEAN DEFAULT false,
  has_sound_system BOOLEAN DEFAULT false,
  has_wifi BOOLEAN DEFAULT false,
  has_decoration BOOLEAN DEFAULT false,
  catering_available BOOLEAN DEFAULT false,
  outdoor_space BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  cancellation_policy TEXT,
  terms_conditions TEXT,
  cover_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hall Images Table
CREATE TABLE hall_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  caption VARCHAR(200),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Hall Amenities Table
CREATE TABLE hall_amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
  amenity_name VARCHAR(100) NOT NULL,
  amenity_icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  guest_count INTEGER NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  advance_payment DECIMAL(12, 2) DEFAULT 0,
  remaining_payment DECIMAL(12, 2),
  payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  booking_status VARCHAR(30) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rejected')),
  special_requests TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  manager_notes TEXT,
  ai_recommendation TEXT,
  coupon_code VARCHAR(50),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Booking Services Table (additional services added to booking)
CREATE TABLE booking_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_name VARCHAR(100) NOT NULL,
  service_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
  service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
  value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
  comment TEXT,
  manager_reply TEXT,
  manager_replied_at TIMESTAMP,
  is_verified BOOLEAN DEFAULT true,
  images TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendors Table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL,
  vendor_type VARCHAR(50) NOT NULL CHECK (vendor_type IN ('catering', 'decoration', 'photography', 'music', 'transport', 'cake', 'flowers', 'other')),
  description TEXT,
  price_range VARCHAR(50),
  price_per_event DECIMAL(10, 2),
  city VARCHAR(100),
  portfolio_url VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(150),
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  cover_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendor Bookings Table
CREATE TABLE vendor_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages Table (Real-time Chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  hall_id UUID REFERENCES halls(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  file_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'booking', 'review', 'message', 'payment')),
  is_read BOOLEAN DEFAULT false,
  reference_id UUID,
  reference_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_halls_city ON halls(city);
CREATE INDEX idx_halls_hall_type ON halls(hall_type);
CREATE INDEX idx_halls_is_active ON halls(is_active, is_approved);
CREATE INDEX idx_halls_price ON halls(price_per_day);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_hall ON bookings(hall_id);
CREATE INDEX idx_bookings_date ON bookings(event_date);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_reviews_hall ON reviews(hall_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_halls_updated_at BEFORE UPDATE ON halls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update hall average rating
CREATE OR REPLACE FUNCTION update_hall_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE halls SET
    avg_rating = (SELECT COALESCE(AVG(rating::DECIMAL), 0) FROM reviews WHERE hall_id = NEW.hall_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE hall_id = NEW.hall_id)
  WHERE id = NEW.hall_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_hall_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_hall_rating();

COMMENT ON TABLE users IS 'Stores all user accounts: customers, managers, admins';
COMMENT ON TABLE halls IS 'Banquet halls listed on the platform';
COMMENT ON TABLE bookings IS 'All booking requests and confirmed bookings';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings for halls';
COMMENT ON TABLE vendors IS 'Third-party service vendors in the marketplace';
COMMENT ON TABLE messages IS 'Real-time chat messages between users';
COMMENT ON TABLE notifications IS 'System notifications for all users';

-- Oldflick Database Schema for Neon
-- PostgreSQL 14+ compatible
-- Created: 2025-12-27
--
-- INSTRUCTIONS:
-- 1. Go to https://console.neon.tech
-- 2. Open your project "Oldflick.com"
-- 3. Click "SQL Editor" tab
-- 4. Copy all SQL below (from CREATE TABLE to last CREATE INDEX)
-- 5. Paste into the editor
-- 6. Click "Execute"
-- 7. Done! Your schema is created

-- ===== USERS TABLE =====
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  subscription_status VARCHAR(50) DEFAULT 'free',
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  free_trial_used BOOLEAN DEFAULT FALSE,
  watch_history JSONB,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== CONTENT TABLE =====
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50),
  genre VARCHAR(100),
  release_year INTEGER,
  rating DECIMAL(3, 1),
  runtime_minutes INTEGER,
  poster_url VARCHAR(500),
  director VARCHAR(255),
  actors TEXT,
  plot_summary TEXT,
  video_url VARCHAR(500),
  available BOOLEAN DEFAULT TRUE,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== USER LISTS TABLE =====
CREATE TABLE IF NOT EXISTS user_lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_id)
);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_content_genre ON content(genre);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);
CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_content_id ON user_lists(content_id);

-- ===== SCHEMA CREATION COMPLETE =====
-- Your Neon database is now ready!
--
-- Next steps:
-- 1. Update your .env with DATABASE_URL (already done)
-- 2. Start your backend: npm run dev:server
-- 3. Add content to the database (manually or via API)
-- 4. Test your application

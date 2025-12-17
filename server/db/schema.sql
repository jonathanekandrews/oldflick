-- Oldflick Database Schema
-- PostgreSQL tables for users, content, and user interactions

-- Users table
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

-- Content table
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50), -- 'film' or 'tv'
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

-- User Lists table (for "My List" feature)
CREATE TABLE IF NOT EXISTS user_lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_content_genre ON content(genre);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);
CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_content_id ON user_lists(content_id);

-- Sample data - Classic films and TV shows
INSERT INTO content (title, description, content_type, genre, release_year, rating, runtime_minutes, director, plot_summary, poster_url)
VALUES
  ('Metropolis', 'A visionary German film exploring themes of class struggle in a futuristic city.', 'film', 'Science Fiction', 1927, 8.3, 145, 'Fritz Lang', 'In a futuristic metropolis, a rebellion threatens to destroy a carefully balanced society. A young idealist and a mad scientist uncover sinister secrets about their world.', 'https://images.unsplash.com/photo-1489599849228-13a80a36cd48?w=300&h=450&fit=crop'),
  ('Bonanza', 'An American Western television series following the Cartwright family on their ranch.', 'tv', 'Western', 1959, 8.0, 50, 'David Dortort', 'The Cartwright family—ranchers in Nevada—face various challenges including cattle rustlers, Native Americans, and personal dramas as they navigate life in the American West.', 'https://images.unsplash.com/photo-1606402437281-801fddda1a66?w=300&h=450&fit=crop'),
  ('The Adventures of Robin Hood', 'A classic TV series following the legendary outlaw Robin Hood.', 'tv', 'Adventure', 1955, 7.8, 25, 'Sidney Cole', 'Robin Hood and his band of Merry Men combat corruption and injustice in medieval England, stealing from the rich to give to the poor.', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop'),
  ('Dragnet', 'A police procedural TV series following detectives working for the LAPD.', 'tv', 'Crime Drama', 1951, 8.0, 30, 'Jack Webb', 'Detective Joe Friday and his partner tackle various crimes across Los Angeles, often working against the clock to solve serious cases.', 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300&h=450&fit=crop'),
  ('Flash Gordon', 'A space opera TV series based on the classic comic strip.', 'tv', 'Science Fiction', 1954, 7.5, 25, 'Unknown', 'Flash Gordon, a quarterback from Earth, travels to the planet Mongo to fight the evil Ming the Merciless and his minions.', 'https://images.unsplash.com/photo-1536440936938-0b84d1dcc26d?w=300&h=450&fit=crop'),
  ('The Andy Griffith Show', 'An American sitcom about a sheriff in a small North Carolina town.', 'tv', 'Comedy', 1960, 8.8, 30, 'Sheldon Leonard', 'Sheriff Andy Taylor keeps peace in the small town of Mayberry, often dealing with quirky townspeople and relying on wisdom and humor to solve problems.', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop'),
  ('The Roy Rogers Show', 'A Western TV series featuring the singing cowboy Roy Rogers.', 'tv', 'Western', 1951, 7.9, 30, 'Various', 'Roy Rogers, known as the King of the Cowboys, along with his wife Dale Evans, fights crime in the American West with his trusty horse Trigger.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=450&fit=crop');

-- Count the inserted records
SELECT COUNT(*) as content_count FROM content;

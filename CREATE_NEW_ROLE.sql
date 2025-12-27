-- Create a fresh database role for Oldflick application
-- Run this in Neon's SQL Editor and note the new password

-- Option 1: Create a brand new role (recommended)
CREATE ROLE oldflick_app WITH LOGIN CREATEDB;

-- Set a new password (you'll see it in the response)
ALTER ROLE oldflick_app WITH PASSWORD 'oldflick_secure_password_123';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE neondb TO oldflick_app;
GRANT ALL PRIVILEGES ON SCHEMA public TO oldflick_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO oldflick_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO oldflick_app;

-- Verify the role was created
SELECT rolname, rolcreatedb, rolcanlogin FROM pg_roles WHERE rolname = 'oldflick_app';

-- Then update your .env with:
-- DATABASE_URL=postgresql://oldflick_app:oldflick_secure_password_123@ep-still-bread-abslny2n.eu-west-2.aws.neon.tech/neondb

-- Migration: Add connections table and dm_privacy column
-- NOTE: Review and run in your DB migration tool (drizzle, knex, or raw psql)

BEGIN;

-- Add dm_privacy column to users (default 'everyone')
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS dm_privacy TEXT DEFAULT 'everyone';

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connected_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index to speed up lookups between two users
CREATE INDEX IF NOT EXISTS idx_connections_user_pair ON connections (user_id, connected_user_id);

COMMIT;

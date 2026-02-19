-- ============================================================
-- Migration: Subscription System with Stripe
-- Run this in Supabase > SQL Editor
-- ============================================================

-- 1. Add unified 'tier' column to profiles
ALTER TABLE profiles
  ADD COLUMN tier text DEFAULT 'rookie'
  CHECK (tier IN ('rookie', 'pro', 'elite', 'free4ever'));

-- 2. Migrate existing 'role' data into new 'tier'
UPDATE profiles SET tier =
  CASE
    WHEN role = 'Free4Ever' THEN 'free4ever'
    WHEN role = 'Elite'     THEN 'elite'
    WHEN role = 'Athlete'   THEN 'pro'
    ELSE 'rookie'
  END;

-- 3. Add Stripe fields to profiles
ALTER TABLE profiles
  ADD COLUMN stripe_customer_id      text,
  ADD COLUMN stripe_subscription_id  text,
  ADD COLUMN subscription_status     text,
  ADD COLUMN posts_count             integer DEFAULT 0 NOT NULL,
  ADD COLUMN reactions_count         integer DEFAULT 0 NOT NULL,
  ADD COLUMN posts_count_reset       timestamp with time zone;

-- 4. Drop old redundant columns
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_tier;

-- 5. Add is_active to routines (for downgrade soft-disable)
ALTER TABLE routines
  ADD COLUMN is_active boolean DEFAULT true NOT NULL;

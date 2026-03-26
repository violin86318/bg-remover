-- Migration: Add billing fields to users table
-- Run: npx wrangler d1 execute image-background-remover --file=./migrations/0001_add_billing.sql

ALTER TABLE users ADD COLUMN credits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN subscription_type TEXT;
ALTER TABLE users ADD COLUMN subscription_expires_at INTEGER;
ALTER TABLE users ADD COLUMN is_subscription_active INTEGER NOT NULL DEFAULT 0;

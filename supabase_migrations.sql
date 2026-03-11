-- Advanced Architecture: Database Indexing
-- Execute this script in your Supabase SQL Editor to speed up query performance

-- 1. Index for Portfolio Table
-- We frequently query this table, order by created_at, and filter by user_id
CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON portfolio(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio(user_id);

-- 2. Index for Activities Table
-- We frequently query this table, order by date, and filter by user_id
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

-- 3. Index for Services Table
-- We fetch this table and order it by created_at
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at ASC);

-- 4. Index for App Releases Table (AppDownloads & ManageApps)
-- We frequently query this sorting by is_pinned and created_at
CREATE INDEX IF NOT EXISTS idx_app_releases_pinned ON app_releases(is_pinned DESC);
CREATE INDEX IF NOT EXISTS idx_app_releases_created_at ON app_releases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_releases_user_id ON app_releases(user_id);

-- 5. Index for Orders Table (ManageOrders)
-- We frequently fetch and sort this by created_at
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Info:
-- Why do we need this? 
-- When you have thousands of portfolio items or activity logs, 
-- PostgreSQL will not need to do a "Full Table Scan" to sort them by date.
-- Instead, it will instantly look up the B-Tree index, making queries 10x faster.

-- ----------------------------------------------------
-- Phase 8: AI Chat Handoff (Multi-Agent Live Chat)
-- ----------------------------------------------------

-- Table to store active conversation sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id TEXT NOT NULL, -- UUID or Session Hash
    visitor_name TEXT DEFAULT 'Guest',
    status TEXT DEFAULT 'ai_active', -- 'ai_active', 'human_requested', 'human_active', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table to store individual messages inside a session
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'ai', 'admin'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for Faster Chat Loading
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);

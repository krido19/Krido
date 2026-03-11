-- Create contacts table for contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the contact form)
CREATE POLICY "Allow anonymous inserts" ON contacts
    FOR INSERT
    WITH CHECK (true);

-- Only authenticated users can read/update (for admin)
CREATE POLICY "Authenticated users can read" ON contacts
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON contacts
    FOR UPDATE
    USING (auth.role() = 'authenticated');

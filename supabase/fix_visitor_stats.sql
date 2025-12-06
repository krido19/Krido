-- Enable RLS on site_stats
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the stats (so the dashboard and app can see it, though app only needs RPC)
CREATE POLICY "Allow public read access" ON site_stats FOR SELECT USING (true);

-- Update the RPC to be SECURITY DEFINER so it runs with owner privileges
-- This allows anonymous users to increment the count without needing direct UPDATE access to the table
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS void AS $$
BEGIN
    UPDATE site_stats
    SET visitor_count = visitor_count + 1,
        updated_at = timezone('utc'::text, now())
    WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

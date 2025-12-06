-- Create a table to store site statistics
CREATE TABLE IF NOT EXISTS site_stats (
    id SERIAL PRIMARY KEY,
    visitor_count BIGINT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert the initial row if it doesn't exist
INSERT INTO site_stats (id, visitor_count)
SELECT 1, 0
WHERE NOT EXISTS (SELECT 1 FROM site_stats WHERE id = 1);

-- Create a function to atomically increment the visitor count
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS void AS $$
BEGIN
    UPDATE site_stats
    SET visitor_count = visitor_count + 1,
        updated_at = timezone('utc'::text, now())
    WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

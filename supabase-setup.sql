-- Create the swaps table if it doesn't exist
CREATE TABLE IF NOT EXISTS swaps (
  swap_id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  file1_url TEXT,
  file1_name TEXT,
  file1_size BIGINT,
  file2_url TEXT,
  file2_name TEXT,
  file2_size BIGINT
);

-- Enable Row Level Security
ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for public API access)
-- Note: This is permissive for development. In production, you'd want more restrictive policies.
CREATE POLICY "Allow all operations on swaps" ON swaps
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alternative: More restrictive policy that only allows operations on non-expired swaps
-- CREATE POLICY "Allow operations on active swaps" ON swaps
--   FOR ALL
--   USING (expires_at > NOW())
--   WITH CHECK (expires_at > NOW());

-- Grant access to the authenticated role and anon role
GRANT ALL ON swaps TO anon;
GRANT ALL ON swaps TO authenticated;
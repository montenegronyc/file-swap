-- Secure Supabase RLS Setup for File Swap Application
-- This provides better security than allowing unlimited anonymous access

-- Enable RLS on the swaps table
ALTER TABLE public.swaps ENABLE ROW LEVEL SECURITY;

-- 1. Allow INSERT only for rows that expire within 24 hours (prevents long-term storage abuse)
CREATE POLICY "Limited time swap creation"
ON public.swaps
FOR INSERT
TO anon
WITH CHECK (
  expires_at <= (now() + interval '24 hours') AND
  expires_at > now()
);

-- 2. Allow SELECT only for non-expired swaps (prevents reading old data)
CREATE POLICY "Read active swaps only"
ON public.swaps
FOR SELECT
TO anon
USING (expires_at > now());

-- 3. Allow UPDATE only for the specific swap being modified and only file fields
CREATE POLICY "Update files only"
ON public.swaps
FOR UPDATE
TO anon
USING (expires_at > now())
WITH CHECK (
  expires_at > now() AND
  -- Ensure critical fields aren't changed
  swap_id = OLD.swap_id AND
  created_at = OLD.created_at AND
  expires_at = OLD.expires_at
);

-- 4. Auto-cleanup expired swaps (run this as a scheduled function)
CREATE OR REPLACE FUNCTION cleanup_expired_swaps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.swaps WHERE expires_at < now() - interval '1 day';
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_swaps_swap_id ON public.swaps(swap_id);
CREATE INDEX IF NOT EXISTS idx_swaps_expires_at ON public.swaps(expires_at);
EOF < /dev/null

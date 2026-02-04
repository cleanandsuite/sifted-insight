-- Drop overly permissive policies
DROP POLICY IF EXISTS "Users can insert bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Bookmarks are readable by owner" ON bookmarks;

-- Create proper policies for bookmarks (using session_id for anonymous users)
-- For now, bookmarks will be stored locally, so we only need a basic policy
CREATE POLICY "Anyone can read bookmarks" ON bookmarks
FOR SELECT USING (true);

-- Note: For anonymous bookmark storage, we'll use localStorage on the frontend
-- This table is for future authenticated users
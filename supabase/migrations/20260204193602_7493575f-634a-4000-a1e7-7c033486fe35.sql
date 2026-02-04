-- Fix bookmarks table: Drop permissive policy and create owner-restricted policies
DROP POLICY IF EXISTS "Anyone can read bookmarks" ON bookmarks;

-- Users can only read their own bookmarks
CREATE POLICY "Users can read own bookmarks" ON bookmarks
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks" ON bookmarks
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON bookmarks
FOR DELETE USING (auth.uid() = user_id);
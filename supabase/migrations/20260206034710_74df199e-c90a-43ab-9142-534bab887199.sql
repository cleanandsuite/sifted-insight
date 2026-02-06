-- Allow admins to insert and update summaries
CREATE POLICY "Admins can insert summaries" ON summaries
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update summaries" ON summaries
FOR UPDATE USING (is_admin(auth.uid()));
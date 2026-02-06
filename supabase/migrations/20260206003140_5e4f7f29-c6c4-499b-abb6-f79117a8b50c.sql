-- Add RLS policies for admins to manage articles
CREATE POLICY "Admins can view all articles"
ON public.articles
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update articles"
ON public.articles
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete articles"
ON public.articles
FOR DELETE
USING (is_admin(auth.uid()));
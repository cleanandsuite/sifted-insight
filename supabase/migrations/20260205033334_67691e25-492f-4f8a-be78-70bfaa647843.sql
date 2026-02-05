-- Allow admins to insert sources
CREATE POLICY "Admins can insert sources"
ON public.sources FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to update sources
CREATE POLICY "Admins can update sources"
ON public.sources FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to delete sources
CREATE POLICY "Admins can delete sources"
ON public.sources FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Fix: Allow system/admin to insert notifications
-- We need a security definer function to insert notifications
CREATE OR REPLACE FUNCTION public.create_notification(_user_id UUID, _type TEXT, _message TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, message)
  VALUES (_user_id, _type, _message);
END;
$$;

-- Allow authenticated users to insert notifications (for admin mass notify and system)
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Drop restrictive policies and recreate as permissive
-- The existing policies were created as RESTRICTIVE (default), need to fix

-- Drop and recreate profiles policies as PERMISSIVE
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by anonymous for stats" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles viewable by anonymous for stats"
  ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Fix blood_requests policies
DROP POLICY IF EXISTS "Blood requests viewable by authenticated users" ON public.blood_requests;
DROP POLICY IF EXISTS "Blood requests viewable by anonymous for stats" ON public.blood_requests;
DROP POLICY IF EXISTS "Users can create blood requests" ON public.blood_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON public.blood_requests;

CREATE POLICY "Blood requests viewable by authenticated users"
  ON public.blood_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Blood requests viewable by anonymous for stats"
  ON public.blood_requests FOR SELECT TO anon USING (true);
CREATE POLICY "Users can create blood requests"
  ON public.blood_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "Users can update their own requests"
  ON public.blood_requests FOR UPDATE TO authenticated USING (auth.uid() = posted_by);

-- Fix donations policies
DROP POLICY IF EXISTS "Donations viewable by authenticated users" ON public.donations;
DROP POLICY IF EXISTS "Donations viewable by anonymous for stats" ON public.donations;
DROP POLICY IF EXISTS "Users can insert their own donations" ON public.donations;
DROP POLICY IF EXISTS "Users can update their own donations" ON public.donations;

CREATE POLICY "Donations viewable by authenticated users"
  ON public.donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Donations viewable by anonymous for stats"
  ON public.donations FOR SELECT TO anon USING (true);
CREATE POLICY "Users can insert their own donations"
  ON public.donations FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Users can update their own donations"
  ON public.donations FOR UPDATE TO authenticated USING (auth.uid() = donor_id);

-- Fix notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Fix responders policies
DROP POLICY IF EXISTS "Responders viewable by authenticated users" ON public.responders;
DROP POLICY IF EXISTS "Users can respond to requests" ON public.responders;

CREATE POLICY "Responders viewable by authenticated users"
  ON public.responders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can respond to requests"
  ON public.responders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Fix user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Fix events policies
DROP POLICY IF EXISTS "Events viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;

CREATE POLICY "Events viewable by everyone"
  ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can insert events"
  ON public.events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));


-- Create enum for urgency levels
CREATE TYPE public.urgency_level AS ENUM ('normal', 'urgent', 'critical');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  reg_id TEXT,
  department TEXT NOT NULL,
  section TEXT,
  semester TEXT,
  blood_group TEXT NOT NULL,
  phone TEXT,
  is_alumni BOOLEAN NOT NULL DEFAULT false,
  graduation_year TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  last_donated TIMESTAMP WITH TIME ZONE,
  donation_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  profile_photo TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Blood requests table
CREATE TABLE public.blood_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  posted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL,
  hospital TEXT NOT NULL,
  location TEXT,
  units_needed INTEGER NOT NULL DEFAULT 1,
  urgency urgency_level NOT NULL DEFAULT 'normal',
  notes TEXT,
  contact TEXT,
  responder_count INTEGER NOT NULL DEFAULT 0,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '72 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blood requests viewable by authenticated users"
  ON public.blood_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create blood requests"
  ON public.blood_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Users can update their own requests"
  ON public.blood_requests FOR UPDATE TO authenticated USING (auth.uid() = posted_by);

-- Allow anonymous SELECT for landing page stats
CREATE POLICY "Blood requests viewable by anonymous for stats"
  ON public.blood_requests FOR SELECT TO anon USING (true);

-- Donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hospital TEXT,
  recipient_dept TEXT,
  units INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donations viewable by authenticated users"
  ON public.donations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own donations"
  ON public.donations FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Users can update their own donations"
  ON public.donations FOR UPDATE TO authenticated USING (auth.uid() = donor_id);

-- Allow anonymous SELECT for stats
CREATE POLICY "Donations viewable by anonymous for stats"
  ON public.donations FOR SELECT TO anon USING (true);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events viewable by everyone"
  ON public.events FOR SELECT USING (true);

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Responders table
CREATE TABLE public.responders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (request_id, user_id)
);

ALTER TABLE public.responders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Responders viewable by authenticated users"
  ON public.responders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can respond to requests"
  ON public.responders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow anonymous to read profiles for landing page stats
CREATE POLICY "Profiles viewable by anonymous for stats"
  ON public.profiles FOR SELECT TO anon USING (true);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, blood_group, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'blood_group', 'O+'),
    COALESCE(NEW.raw_user_meta_data->>'department', '')
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create indexes
CREATE INDEX idx_profiles_blood_group ON public.profiles(blood_group);
CREATE INDEX idx_profiles_department ON public.profiles(department);
CREATE INDEX idx_profiles_is_available ON public.profiles(is_available);
CREATE INDEX idx_blood_requests_urgency ON public.blood_requests(urgency);
CREATE INDEX idx_blood_requests_expires_at ON public.blood_requests(expires_at);
CREATE INDEX idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Storage bucket for profile photos and certificates
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false);

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own certificates"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own certificates"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

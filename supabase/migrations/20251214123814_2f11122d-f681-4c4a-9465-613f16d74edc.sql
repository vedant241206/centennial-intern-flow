-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create users table (persons/departments)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own users" ON public.users
FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create users" ON public.users
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own users" ON public.users
FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own users" ON public.users
FOR DELETE USING (auth.uid() = owner_id);

-- Create interns table
CREATE TABLE public.interns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sr_no INTEGER NOT NULL,
  intern_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  internship_status TEXT NOT NULL DEFAULT 'Applied',
  date_applied DATE,
  interviewer TEXT,
  internship_type TEXT NOT NULL DEFAULT 'Remote',
  joining_date DATE,
  duration TEXT,
  accepted_offer_letter BOOLEAN DEFAULT false,
  notes TEXT,
  full_time_conversion BOOLEAN DEFAULT false,
  resume_url TEXT,
  offer_letter_url TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on interns
ALTER TABLE public.interns ENABLE ROW LEVEL SECURITY;

-- Interns policies
CREATE POLICY "Users can view their own interns" ON public.interns
FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create interns" ON public.interns
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own interns" ON public.interns
FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own interns" ON public.interns
FOR DELETE USING (auth.uid() = owner_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interns_updated_at
  BEFORE UPDATE ON public.interns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
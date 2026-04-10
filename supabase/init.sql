-- RecipeBoard Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table (auto-created by trigger on auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create boards table
CREATE TABLE public.boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create board_members table
CREATE TABLE public.board_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(board_id, user_id)
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL,
  instructions TEXT NOT NULL,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  image_url TEXT,
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create invites table
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_board_members_board_id ON public.board_members(board_id);
CREATE INDEX idx_board_members_user_id ON public.board_members(user_id);
CREATE INDEX idx_recipes_board_id ON public.recipes(board_id);
CREATE INDEX idx_recipes_created_by ON public.recipes(created_by);
CREATE INDEX idx_invites_board_id ON public.invites(board_id);
CREATE INDEX idx_invites_token ON public.invites(token);
CREATE INDEX idx_invites_email ON public.invites(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for boards
CREATE POLICY "Members can view boards" ON public.boards
  FOR SELECT USING (
    id IN (SELECT board_id FROM public.board_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create boards" ON public.boards
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update boards" ON public.boards
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.board_members 
      WHERE board_id = public.boards.id AND role = 'owner'
    )
  );

CREATE POLICY "Owners can delete boards" ON public.boards
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.board_members 
      WHERE board_id = public.boards.id AND role = 'owner'
    )
  );

-- RLS Policies for board_members
CREATE POLICY "Members can view board members" ON public.board_members
  FOR SELECT USING (
    board_id IN (SELECT board_id FROM public.board_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can add members" ON public.board_members
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT board_id FROM public.board_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can update members" ON public.board_members
  FOR UPDATE USING (
    board_id IN (
      SELECT board_id FROM public.board_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can remove members" ON public.board_members
  FOR DELETE USING (
    board_id IN (
      SELECT board_id FROM public.board_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- RLS Policies for recipes
CREATE POLICY "Members can view recipes" ON public.recipes
  FOR SELECT USING (
    board_id IN (SELECT board_id FROM public.board_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Editors can create recipes" ON public.recipes
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT board_id FROM public.board_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update recipes" ON public.recipes
  FOR UPDATE USING (
    board_id IN (
      SELECT board_id FROM public.board_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can delete recipes" ON public.recipes
  FOR DELETE USING (
    board_id IN (
      SELECT board_id FROM public.board_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- RLS Policies for invites
CREATE POLICY "Owners can view invites" ON public.invites
  FOR SELECT USING (
    board_id IN (
      SELECT board_id FROM public.board_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can create invites" ON public.invites
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT board_id FROM public.board_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can delete invites" ON public.invites
  FOR DELETE USING (
    board_id IN (
      SELECT board_id FROM public.board_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Trigger function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Create a default board for new users
  INSERT INTO public.boards (name, created_by)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Board'),
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for recipe images (members can view)
CREATE POLICY "Anyone can view recipe images" ON storage.objects
  FOR SELECT USING (bucket_id = 'recipe-images');

-- Storage policy for recipe images (editors can upload)
CREATE POLICY "Editors can upload recipe images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'recipe-images' 
    AND (
      (storage.foldername(name))[1] IN (
        SELECT user_id::text FROM auth.users WHERE auth.uid() = user_id
      )
    )
  );

-- Storage policy for recipe images (editors can delete)
CREATE POLICY "Editors can delete recipe images" ON storage.objects
  FOR DELETE USING (bucket_id = 'recipe-images');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant permissions to authenticated users
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT ON public.boards TO authenticated;
GRANT SELECT, INSERT ON public.board_members TO authenticated;
GRANT SELECT, INSERT ON public.recipes TO authenticated;
GRANT SELECT ON public.invites TO authenticated;

-- Grant storage permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
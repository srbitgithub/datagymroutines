-- ==========================================
-- 1. LIMPIEZA TOTAL (Reset completo)
-- ==========================================
-- Usamos CASCADE para borrar también las políticas que dependen de estas tablas
DROP TABLE IF EXISTS public.social_reactions CASCADE;
DROP TABLE IF EXISTS public.social_post_shares CASCADE;
DROP TABLE IF EXISTS public.social_posts CASCADE;
DROP TABLE IF EXISTS public.social_members CASCADE;
DROP TABLE IF EXISTS public.social_groups CASCADE;

-- ==========================================
-- 2. EXTENSIÓN DE PERFILES
-- ==========================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
ADD COLUMN IF NOT EXISTS is_social_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_searchable BOOLEAN DEFAULT true;

-- ==========================================
-- 3. CREACIÓN DE TABLAS
-- ==========================================

-- Grupos
CREATE TABLE public.social_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Miembros (Tabla corregida sin recursión en RLS)
CREATE TABLE public.social_members (
    group_id UUID REFERENCES public.social_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

-- Social Posts (Resultado de entrenamientos compartidos)
CREATE TABLE public.social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Relación de Posts con Grupos
CREATE TABLE public.social_post_shares (
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES public.social_groups(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (post_id, group_id)
);

-- Reacciones (Emojis)
CREATE TABLE public.social_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id, emoji)
);

-- ==========================================
-- 4. SEGURIDAD (RLS)
-- ==========================================
ALTER TABLE public.social_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reactions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE GRUPOS
CREATE POLICY "Select_Groups" ON public.social_groups FOR SELECT 
USING (
    creator_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.social_members WHERE group_id = public.social_groups.id AND user_id = auth.uid())
);

CREATE POLICY "Insert_Groups" ON public.social_groups FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Update_Groups" ON public.social_groups FOR UPDATE USING (creator_id = auth.uid());

-- POLÍTICAS DE MIEMBROS (FIX: Sin recursión)
CREATE POLICY "Select_Members" ON public.social_members FOR SELECT 
USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.social_groups WHERE id = public.social_members.group_id)
);

CREATE POLICY "Insert_Members" ON public.social_members FOR INSERT 
WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.social_groups WHERE id = group_id AND creator_id = auth.uid())
);

CREATE POLICY "Delete_Members" ON public.social_members FOR DELETE 
USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.social_groups WHERE id = group_id AND creator_id = auth.uid())
);

-- POLÍTICAS DE POSTS
CREATE POLICY "Select_Posts" ON public.social_posts FOR SELECT 
USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.social_post_shares sps WHERE sps.post_id = public.social_posts.id)
);

CREATE POLICY "Insert_Posts" ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS DE SHARES
CREATE POLICY "Select_Shares" ON public.social_post_shares FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.social_groups WHERE id = group_id));

CREATE POLICY "Insert_Shares" ON public.social_post_shares FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.social_posts WHERE id = post_id AND user_id = auth.uid()));

-- POLÍTICAS DE REACCIONES
CREATE POLICY "Select_Reactions" ON public.social_reactions FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.social_posts WHERE id = post_id));

CREATE POLICY "Insert_Reactions" ON public.social_reactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete_Reactions" ON public.social_reactions FOR DELETE 
USING (auth.uid() = user_id);

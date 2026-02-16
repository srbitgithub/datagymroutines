-- SQL Schema for DataGymRoutines Social Features

-- 1. Extend profiles with social settings and subscription tier
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
ADD COLUMN IF NOT EXISTS is_social_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_searchable BOOLEAN DEFAULT true;

-- 2. Social Groups
CREATE TABLE public.social_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Group Members
CREATE TABLE public.social_members (
    group_id UUID REFERENCES public.social_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

-- 4. Social Posts (Representing shared workout sessions)
CREATE TABLE public.social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Post Shares (Which groups a post was shared to)
CREATE TABLE public.social_post_shares (
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES public.social_groups(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (post_id, group_id)
);

-- 6. Social Reactions (Only emojis)
CREATE TABLE public.social_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emoji_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id, emoji_code) -- Optional: prevent multiple same emoji reactions from same user
);

-- Enable RLS
ALTER TABLE public.social_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Groups: Viewable by members
CREATE POLICY "Groups are viewable by their members." ON public.social_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.social_members 
            WHERE group_id = public.social_groups.id AND user_id = auth.uid()
        ) OR creator_id = auth.uid()
    );

-- Groups: Only owner can update (add/remove members logic will be in server actions)
CREATE POLICY "Owners can update their groups." ON public.social_groups
    FOR UPDATE USING (creator_id = auth.uid());

-- Members: Viewable by other members of the same group
CREATE POLICY "Members can see each other." ON public.social_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.social_members sm 
            WHERE sm.group_id = public.social_members.group_id AND sm.user_id = auth.uid()
        )
    );

-- Posts: Viewable if shared in a group the user belongs to
CREATE POLICY "Posts are viewable by group members." ON public.social_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.social_post_shares sps
            JOIN public.social_members sm ON sm.group_id = sps.group_id
            WHERE sps.post_id = public.social_posts.id AND sm.user_id = auth.uid()
        ) OR user_id = auth.uid()
    );

-- Reactions: Viewable if post is viewable
CREATE POLICY "Reactions are viewable by whoever can see the post." ON public.social_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.social_posts p
            WHERE p.id = public.social_reactions.post_id
        )
    );

-- Insertion Policies
CREATE POLICY "Users can create posts." ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can react to posts." ON public.social_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

'use client';

import { useState, useEffect } from "react";
import { getGroupFeedAction, toggleReactionAction } from "@/app/_actions/social";
import { SocialPost } from "@/modules/social/domain/SocialPost";
import { EmojiReaction } from "@/modules/social/domain/SocialReaction";
import { Loader2, Zap, MessageSquare, History, Trophy } from "lucide-react";

interface GroupActivityFeedProps {
    groupId: string;
    currentUserId?: string;
}

const EMOJIS: EmojiReaction[] = ['🔥', '💪', '👏', '🚀', '💎'];

export function GroupActivityFeed({ groupId, currentUserId }: GroupActivityFeedProps) {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFeed = async () => {
        const feed = await getGroupFeedAction(groupId);
        setPosts(feed);
        setLoading(false);
    };

    useEffect(() => {
        loadFeed();
        // Poll every 30 seconds for new posts
        const interval = setInterval(loadFeed, 30000);
        return () => clearInterval(interval);
    }, [groupId]);

    const handleToggleReaction = async (postId: string, emoji: EmojiReaction) => {
        // Optimistic update
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                const reactions = { ...post.reactions };
                const userReactions = [...(post.userReactions || [])];

                if (userReactions.includes(emoji)) {
                    reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1);
                    const idx = userReactions.indexOf(emoji);
                    userReactions.splice(idx, 1);
                } else {
                    reactions[emoji] = (reactions[emoji] || 0) + 1;
                    userReactions.push(emoji);
                }
                return { ...post, reactions, userReactions };
            }
            return post;
        }));

        const result = await toggleReactionAction(postId, emoji, groupId);
        if (!result.success) {
            // Revert on error
            loadFeed();
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary mb-4" />
                <p className="text-sm font-medium">Cargando actividad...</p>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-16 px-4 border-2 border-dashed rounded-2xl bg-muted/5">
                <Zap className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold">Sin actividad todavía</h3>
                <p className="max-w-[200px] mx-auto text-xs text-muted-foreground mt-2">
                    ¡Anima al grupo compartiendo tu próximo entrenamiento!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <div key={post.id} className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full border bg-background overflow-hidden">
                                {post.user?.avatarUrl ? (
                                    <img src={post.user.avatarUrl} alt={post.user.username} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">
                                        {post.user?.username?.[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold leading-none">{post.user?.username}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    {post.createdAt.toLocaleDateString()} a las {post.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trophy className="h-4 w-4 text-amber-500" />
                        </div>
                    </header>

                    <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                        <p className="text-sm font-medium italic text-brand-primary">
                            "{post.message}"
                        </p>
                    </div>

                    {post.userId !== currentUserId && (
                        <footer className="flex flex-wrap items-center gap-2 pt-2 border-t mt-1">
                            <div className="flex flex-wrap gap-1.5">
                                {EMOJIS.map(emoji => {
                                    const count = post.reactions?.[emoji] || 0;
                                    const hasReacted = post.userReactions?.includes(emoji);
                                    return (
                                        <button
                                            key={emoji}
                                            onClick={() => handleToggleReaction(post.id, emoji)}
                                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all ${hasReacted
                                                ? 'bg-brand-primary text-white shadow-sm ring-2 ring-brand-primary/20 scale-105'
                                                : count > 0
                                                    ? 'bg-muted hover:bg-muted/80'
                                                    : 'bg-transparent hover:bg-muted opacity-40 hover:opacity-100'
                                                }`}
                                        >
                                            <span>{emoji}</span>
                                            {count > 0 && <span className="text-[10px]">{count}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </footer>
                    )}
                </div>
            ))}
        </div>
    );
}

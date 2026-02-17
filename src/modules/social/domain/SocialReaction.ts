export type EmojiReaction = '🔥' | '💪' | '👏' | '🚀' | '💎';

export interface SocialReaction {
    postId: string;
    userId: string;
    emoji: EmojiReaction;
}

export interface SocialReactionRepository {
    addReaction(postId: string, userId: string, emoji: EmojiReaction): Promise<void>;
    removeReaction(postId: string, userId: string, emoji: EmojiReaction): Promise<void>;
    getReactionsByPost(postId: string): Promise<Record<string, number>>;
    getUserReactions(postId: string, userId: string): Promise<EmojiReaction[]>;
    getReactorsWithProfiles(postId: string, emoji: EmojiReaction): Promise<{ username: string }[]>;
}

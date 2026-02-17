import { SocialReactionRepository, EmojiReaction } from "../../domain/SocialReaction";
import { SupabaseRepository } from "@/core/infrastructure/SupabaseRepository";

export class SupabaseSocialReactionRepository extends SupabaseRepository implements SocialReactionRepository {
    async addReaction(postId: string, userId: string, emoji: EmojiReaction): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("social_reactions")
            .insert({ post_id: postId, user_id: userId, emoji });

        if (error && error.code !== '23505') { // Ignore unique violation
            throw new Error(error.message);
        }
    }

    async removeReaction(postId: string, userId: string, emoji: EmojiReaction): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("social_reactions")
            .delete()
            .match({ post_id: postId, user_id: userId, emoji });

        if (error) throw new Error(error.message);
    }

    async getReactionsByPost(postId: string): Promise<Record<string, number>> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("social_reactions")
            .select("emoji");

        if (error || !data) return {};

        const counts: Record<string, number> = {};
        data.forEach(r => {
            counts[r.emoji] = (counts[r.emoji] || 0) + 1;
        });
        return counts;
    }

    async getUserReactions(postId: string, userId: string): Promise<EmojiReaction[]> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("social_reactions")
            .select("emoji")
            .match({ post_id: postId, user_id: userId });

        if (error || !data) return [];
        return data.map(r => r.emoji as EmojiReaction);
    }

    async getReactorsWithProfiles(postId: string, emoji: EmojiReaction): Promise<{ username: string }[]> {
        const client = await this.getClient();
        // Use RPC or separate query if relationship is not clear, but let's try standard join first
        const { data, error } = await client
            .from("social_reactions")
            .select(`
                profiles!social_reactions_user_id_fkey (
                    username
                )
            `)
            .match({ post_id: postId, emoji });

        if (error || !data) return [];

        return data
            .map((r: any) => ({ username: r.profiles?.username || "Usuario" }))
            .filter(u => u.username !== "Usuario");
    }
}

import { SocialPost, SocialPostRepository } from "../../domain/SocialPost";
import { SocialMapper } from "../mappers/SocialMapper";
import { SupabaseRepository } from "@/core/infrastructure/SupabaseRepository";

export class SupabaseSocialPostRepository extends SupabaseRepository implements SocialPostRepository {
    async getById(id: string): Promise<SocialPost | null> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("social_posts")
            .select("*, profile:profiles(*)")
            .eq("id", id)
            .single();

        if (error || !data) return null;

        return SocialMapper.toPostDomain(data);
    }

    async create(post: Omit<SocialPost, 'id' | 'createdAt'>, groupIds: string[]): Promise<SocialPost> {
        const client = await this.getClient();

        // 1. Create the post
        const { data: postData, error: postError } = await client
            .from("social_posts")
            .insert(SocialMapper.toPostPersistence(post))
            .select()
            .single();

        if (postError) throw new Error(postError.message);

        // 2. Share to each group
        if (groupIds.length > 0) {
            const shares = groupIds.map(groupId => ({
                post_id: postData.id,
                group_id: groupId
            }));

            const { error: shareError } = await client
                .from("social_post_shares")
                .insert(shares);

            if (shareError) throw new Error(shareError.message);
        }

        return SocialMapper.toPostDomain(postData);
    }

    async getFeedByGroup(groupId: string): Promise<SocialPost[]> {
        const client = await this.getClient();
        // Get user session to filter their reactions
        const { data: { session } } = await client.auth.getSession();
        const userId = session?.user.id;

        const { data, error } = await client
            .from("social_posts")
            .select(`
                *,
                profile:profiles(*),
                social_post_shares!inner(group_id),
                reactions:social_reactions(emoji, user_id)
            `)
            .eq("social_post_shares.group_id", groupId)
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map(post => {
            const domainPost = SocialMapper.toPostDomain(post);

            // Calculate reaction counts
            const counts: Record<string, number> = {};
            const userReactions: string[] = [];

            post.reactions?.forEach((r: any) => {
                counts[r.emoji] = (counts[r.emoji] || 0) + 1;
                if (userId && r.user_id === userId) {
                    userReactions.push(r.emoji);
                }
            });

            return {
                ...domainPost,
                reactions: counts,
                userReactions
            };
        });
    }
}

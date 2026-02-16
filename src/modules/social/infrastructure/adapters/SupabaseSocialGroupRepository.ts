import { SocialGroup, SocialGroupRepository } from "../../domain/SocialGroup";
import { SocialMapper } from "../mappers/SocialMapper";
import { SupabaseRepository } from "@/core/infrastructure/SupabaseRepository";
import { Profile } from "../../../profiles/domain/Profile";
import { ProfileMapper } from "../../../profiles/infrastructure/mappers/ProfileMapper";

export class SupabaseSocialGroupRepository extends SupabaseRepository implements SocialGroupRepository {
    async getById(id: string): Promise<SocialGroup | null> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("social_groups")
            .select("*, members:social_members(profile:profiles(*))")
            .eq("id", id)
            .single();

        if (error || !data) return null;

        return SocialMapper.toGroupDomain(data, data.members);
    }

    async getByUser(userId: string): Promise<SocialGroup[]> {
        console.log(`[SocialRepo] Fetching groups for user: ${userId}`);
        const client = await this.getClient();

        const { data, error } = await client
            .from("social_members")
            .select(`
                group_id,
                group:social_groups (
                    *,
                    members:social_members (
                        profile:profiles (*)
                    )
                )
            `)
            .eq("user_id", userId);

        if (error) {
            console.error("[SocialRepo] Error fetching memberships:", error);
            return [];
        }

        console.log(`[SocialRepo] Memberships found: ${data?.length || 0}`);

        if (!data) return [];

        const groups = data.map((m: any) => {
            if (!m.group) console.warn("[SocialRepo] Membership found but group data is null for group_id:", m.group_id);
            return m.group ? SocialMapper.toGroupDomain(m.group, m.group.members) : null;
        }).filter(Boolean) as SocialGroup[];

        console.log(`[SocialRepo] Returning ${groups.length} groups`);
        return groups;
    }

    async create(group: Omit<SocialGroup, 'id' | 'createdAt'>): Promise<SocialGroup> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("social_groups")
            .insert(SocialMapper.toGroupPersistence(group))
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Auto-add creator as member
        await this.addMember(data.id, group.creatorId);

        return SocialMapper.toGroupDomain(data);
    }

    async update(id: string, group: Partial<SocialGroup>): Promise<void> {
        const client = await this.getClient();
        const persistence = SocialMapper.toGroupPersistence(group as any);
        const { error } = await client
            .from("social_groups")
            .update(persistence)
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async delete(id: string): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("social_groups")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async addMember(groupId: string, userId: string): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("social_members")
            .insert({ group_id: groupId, user_id: userId });

        if (error && error.code !== '23505') { // Ignore unique violation (already a member)
            throw new Error(error.message);
        }
    }

    async removeMember(groupId: string, userId: string): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("social_members")
            .delete()
            .match({ group_id: groupId, user_id: userId });

        if (error) throw new Error(error.message);
    }

    async isMember(groupId: string, userId: string): Promise<boolean> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("social_members")
            .select("user_id")
            .match({ group_id: groupId, user_id: userId })
            .single();

        return !error && !!data;
    }

    async getGroupMemberCount(userId: string): Promise<number> {
        const client = await this.getClient();
        const { count, error } = await client
            .from("social_groups")
            .select("*", { count: 'exact', head: true })
            .eq("creator_id", userId);

        return count || 0;
    }

    async searchUsers(query: string): Promise<Profile[]> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("profiles")
            .select("*")
            .eq("is_searchable", true)
            .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
            .limit(10);

        if (error || !data) return [];

        return data.map(ProfileMapper.toDomain);
    }
}

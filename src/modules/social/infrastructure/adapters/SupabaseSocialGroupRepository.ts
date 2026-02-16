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
        const client = await this.getClient();
        // PostgREST doesn't support subqueries in 'or'. 
        // We use !inner to filter the main resource by the embedded resource.
        const { data, error } = await client
            .from("social_groups")
            .select(`
                *,
                members:social_members!inner(profile:profiles(*))
            `)
            .eq("social_members.user_id", userId);

        if (error || !data) return [];

        // Now we also need to get ALL members for these groups, 
        // because !inner with eq filtered the 'members' array to only the current user.
        // So we do a second fetch or we change the approach.
        // Actually, the best way is to fetch the group IDs first or use a join that doesn't filter the embed.

        const groupIds = data.map(g => g.id);
        if (groupIds.length === 0) return [];

        const { data: fullData, error: fullError } = await client
            .from("social_groups")
            .select("*, members:social_members(profile:profiles(*))")
            .in("id", groupIds);

        if (fullError || !fullData) return [];

        return fullData.map(group => SocialMapper.toGroupDomain(group, group.members));
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

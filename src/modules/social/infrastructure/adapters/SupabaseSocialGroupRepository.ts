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

        // 1. Obtener los IDs de los grupos
        const { data: memberships, error: memError } = await client
            .from("social_members")
            .select("group_id")
            .eq("user_id", userId);

        if (memError || !memberships || memberships.length === 0) return [];

        const groupIds = memberships.map(m => m.group_id);

        // 2. Obtener los grupos y TODOS sus miembros (no solo el actual)
        const { data: groups, error: groupError } = await client
            .from("social_groups")
            .select(`
                *,
                members:social_members(
                    user_id
                )
            `)
            .in("id", groupIds);

        if (groupError || !groups) return [];

        // 3. Obtener los perfiles de todos los miembros encontrados para evitar errores de relación
        const allMemberIds = Array.from(new Set(groups.flatMap(g => g.members.map((m: any) => m.user_id))));
        const { data: profiles, error: profError } = await client
            .from("profiles")
            .select("*")
            .in("id", allMemberIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // 4. Unir manualmente
        return groups.map(group => {
            const enrichedMembers = group.members.map((m: any) => ({
                user_id: m.user_id,
                profile: profileMap.get(m.user_id)
            }));
            return SocialMapper.toGroupDomain(group, enrichedMembers);
        });
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

    async getGroupMembers(groupId: string): Promise<string[]> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("social_members")
            .select("user_id")
            .eq("group_id", groupId);

        if (error || !data) return [];
        return data.map(m => m.user_id);
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

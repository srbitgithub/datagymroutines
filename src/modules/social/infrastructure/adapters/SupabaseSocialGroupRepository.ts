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

        // 1. Buscamos primero los IDs de los grupos donde estamos
        const { data: memberships, error: memError } = await client
            .from("social_members")
            .select("group_id")
            .eq("user_id", userId);

        if (memError || !memberships || memberships.length === 0) return [];

        const groupIds = memberships.map(m => m.group_id);

        // 2. Traemos la info de esos grupos. 
        // Nota: No unimos con profiles aquí para evitar el error PGRST200 
        // hasta que el SQL del Paso 1 esté aplicado.
        const { data: groups, error: groupError } = await client
            .from("social_groups")
            .select(`
                *,
                members:social_members (
                    user_id
                )
            `)
            .in("id", groupIds);

        if (groupError || !groups) return [];

        // Para cada grupo, intentamos traer los perfiles de los miembros en una consulta aparte si es necesario,
        // o simplificamos el dominio.
        return groups.map(group => SocialMapper.toGroupDomain(group, group.members));
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

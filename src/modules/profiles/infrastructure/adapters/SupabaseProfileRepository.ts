import { Profile, ProfileRepository } from "../../domain/Profile";
import { ProfileMapper } from "../mappers/ProfileMapper";
import { SupabaseRepository } from "@/core/infrastructure/SupabaseRepository";

export class SupabaseProfileRepository extends SupabaseRepository implements ProfileRepository {
    async getById(id: string): Promise<Profile | null> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) return null;

        return ProfileMapper.toDomain(data);
    }

    async save(profile: Profile): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("profiles")
            .insert(ProfileMapper.toPersistence(profile));

        if (error) throw new Error(error.message);
    }

    async update(id: string, profile: Partial<Profile>): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("profiles")
            .update(profile)
            .eq("id", id);

        if (error) throw new Error(error.message);
    }
}

import { Profile, ProfileRepository } from "../../domain/Profile";
import { supabase } from "@/modules/auth/infrastructure/adapters/SupabaseClient";
import { ProfileMapper } from "../mappers/ProfileMapper";

export class SupabaseProfileRepository implements ProfileRepository {
    async getById(id: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) return null;

        return ProfileMapper.toDomain(data);
    }

    async save(profile: Profile): Promise<void> {
        const { error } = await supabase
            .from("profiles")
            .insert(ProfileMapper.toPersistence(profile));

        if (error) throw new Error(error.message);
    }

    async update(id: string, profile: Partial<Profile>): Promise<void> {
        const { error } = await supabase
            .from("profiles")
            .update(profile)
            .eq("id", id);

        if (error) throw new Error(error.message);
    }
}

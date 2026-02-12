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
            .update(ProfileMapper.toPartialPersistence(profile))
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async uploadAvatar(userId: string, imageData: Blob): Promise<string> {
        const client = await this.getClient();
        const fileName = `${userId}/avatar-${Date.now()}.webp`;

        // 1. Upload to Storage
        const { error: uploadError } = await client.storage
            .from('avatars')
            .upload(fileName, imageData, {
                contentType: 'image/webp',
                upsert: true
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            throw new Error(`Error al subir imagen: ${uploadError.message}`);
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = client.storage
            .from('avatars')
            .getPublicUrl(fileName);

        // 3. Update Profile record
        await this.update(userId, { avatarUrl: publicUrl });

        return publicUrl;
    }
}

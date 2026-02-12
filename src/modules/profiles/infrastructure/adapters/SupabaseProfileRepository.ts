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

        // 1. Get current profile to check if there's an old avatar
        const currentProfile = await this.getById(userId);
        const oldAvatarUrl = currentProfile?.avatarUrl;

        const fileName = `${userId}/avatar-${Date.now()}.webp`;

        // 2. Upload new image to Storage
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

        // 3. Get Public URL of the new image
        const { data: { publicUrl } } = client.storage
            .from('avatars')
            .getPublicUrl(fileName);

        // 4. Update Profile record
        await this.update(userId, { avatarUrl: publicUrl });

        // 5. Clean up old avatar from Storage if it existed and is different
        if (oldAvatarUrl && oldAvatarUrl.includes('/avatars/')) {
            try {
                // Extract relative path from URL (e.g., "userId/avatar-123.webp")
                const urlParts = oldAvatarUrl.split('/avatars/');
                const oldPath = urlParts[urlParts.length - 1];

                // Only delete if it's in the same bucket structure
                if (oldPath) {
                    await client.storage
                        .from('avatars')
                        .remove([oldPath]);
                }
            } catch (cleanupError) {
                // We don't throw here to avoid failing the whole process if cleanup fails
                console.error("Cleanup error (non-fatal):", cleanupError);
            }
        }

        return publicUrl;
    }
}

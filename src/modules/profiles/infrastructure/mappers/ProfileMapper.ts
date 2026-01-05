import { Profile } from "../../domain/Profile";

export class ProfileMapper {
    static toDomain(raw: any): Profile {
        return {
            id: raw.id,
            username: raw.username,
            fullName: raw.full_name,
            avatarUrl: raw.avatar_url,
            weightUnit: raw.weight_unit as 'kg' | 'lbs',
            updatedAt: new Date(raw.updated_at),
        };
    }

    static toPersistence(profile: Profile): any {
        return {
            id: profile.id,
            username: profile.username,
            full_name: profile.fullName,
            avatar_url: profile.avatarUrl,
            weight_unit: profile.weightUnit,
            updated_at: profile.updatedAt.toISOString(),
        };
    }
}

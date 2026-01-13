import { Profile } from "../../domain/Profile";

export class ProfileMapper {
    static toDomain(raw: any): Profile {
        return {
            id: raw.id,
            username: raw.username,
            fullName: raw.full_name,
            avatarUrl: raw.avatar_url,
            weightUnit: raw.weight_unit as 'kg' | 'lbs',
            monthlyGoal: raw.monthly_goal,
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
            monthly_goal: profile.monthlyGoal,
            updated_at: profile.updatedAt.toISOString(),
        };
    }
}

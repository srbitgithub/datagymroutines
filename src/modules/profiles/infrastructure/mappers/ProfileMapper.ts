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
            role: raw.role as 'Rookie' | 'Athlete' | 'Elite',
            gender: raw.gender as 'male' | 'female' | 'other',
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
            role: profile.role,
            gender: profile.gender,
            updated_at: profile.updatedAt.toISOString(),
        };
    }

    static toPartialPersistence(profile: Partial<Profile>): any {
        const persistence: any = {};
        if (profile.username !== undefined) persistence.username = profile.username;
        if (profile.fullName !== undefined) persistence.full_name = profile.fullName;
        if (profile.avatarUrl !== undefined) persistence.avatar_url = profile.avatarUrl;
        if (profile.weightUnit !== undefined) persistence.weight_unit = profile.weightUnit;
        if (profile.monthlyGoal !== undefined) persistence.monthly_goal = profile.monthlyGoal;
        if (profile.role !== undefined) persistence.role = profile.role;
        if (profile.gender !== undefined) persistence.gender = profile.gender;
        if (profile.updatedAt !== undefined) persistence.updated_at = profile.updatedAt.toISOString();
        return persistence;
    }
}

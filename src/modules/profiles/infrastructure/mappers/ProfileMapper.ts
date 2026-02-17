import { Profile } from "../../domain/Profile";

export class ProfileMapper {
    static toDomain(raw: any): Profile {
        if (!raw) return {} as any; // Retorno seguro
        return {
            id: raw.id,
            username: raw.username,
            fullName: raw.full_name,
            avatarUrl: raw.avatar_url,
            weightUnit: raw.weight_unit as 'kg' | 'lbs',
            monthlyGoal: raw.monthly_goal,
            role: raw.role as 'Rookie' | 'Athlete' | 'Elite' | 'Free4Ever',
            subscriptionTier: (raw.subscription_tier as 'free' | 'premium' | 'pro') || 'free',
            isSocialActive: raw.is_social_active ?? false,
            isSearchable: raw.is_searchable ?? true,
            isNotificationsActive: raw.is_notifications_active ?? true,
            gender: raw.gender as 'male' | 'female' | 'other',
            updatedAt: raw.updated_at ? new Date(raw.updated_at) : new Date(),
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
            subscription_tier: profile.subscriptionTier,
            is_social_active: profile.isSocialActive,
            is_searchable: profile.isSearchable,
            is_notifications_active: profile.isNotificationsActive,
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
        if (profile.subscriptionTier !== undefined) persistence.subscription_tier = profile.subscriptionTier;
        if (profile.isSocialActive !== undefined) persistence.is_social_active = profile.isSocialActive;
        if (profile.isSearchable !== undefined) persistence.is_searchable = profile.isSearchable;
        if (profile.isNotificationsActive !== undefined) persistence.is_notifications_active = profile.isNotificationsActive;
        if (profile.gender !== undefined) persistence.gender = profile.gender;
        if (profile.updatedAt !== undefined) persistence.updated_at = profile.updatedAt.toISOString();
        return persistence;
    }
}

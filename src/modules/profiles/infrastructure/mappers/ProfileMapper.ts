import { Profile } from "../../domain/Profile";
import { SubscriptionTier } from "@/config/subscriptions";

export class ProfileMapper {
    static toDomain(raw: any): Profile {
        if (!raw) return {} as any;
        return {
            id: raw.id,
            username: raw.username,
            fullName: raw.full_name,
            avatarUrl: raw.avatar_url,
            weightUnit: raw.weight_unit as 'kg' | 'lbs',
            monthlyGoal: raw.monthly_goal,
            gender: raw.gender as 'male' | 'female' | 'other',
            tier: (raw.tier as SubscriptionTier) || 'rookie',
            stripeCustomerId: raw.stripe_customer_id,
            stripeSubscriptionId: raw.stripe_subscription_id,
            subscriptionStatus: raw.subscription_status,
            postsCount: raw.posts_count ?? 0,
            reactionsCount: raw.reactions_count ?? 0,
            postsCountReset: raw.posts_count_reset ? new Date(raw.posts_count_reset) : undefined,
            isSocialActive: raw.is_social_active ?? false,
            isSearchable: raw.is_searchable ?? true,
            isNotificationsActive: raw.is_notifications_active ?? true,
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
            gender: profile.gender,
            tier: profile.tier,
            stripe_customer_id: profile.stripeCustomerId,
            stripe_subscription_id: profile.stripeSubscriptionId,
            subscription_status: profile.subscriptionStatus,
            posts_count: profile.postsCount,
            reactions_count: profile.reactionsCount,
            posts_count_reset: profile.postsCountReset?.toISOString(),
            is_social_active: profile.isSocialActive,
            is_searchable: profile.isSearchable,
            is_notifications_active: profile.isNotificationsActive,
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
        if (profile.gender !== undefined) persistence.gender = profile.gender;
        if (profile.tier !== undefined) persistence.tier = profile.tier;
        if (profile.stripeCustomerId !== undefined) persistence.stripe_customer_id = profile.stripeCustomerId;
        if (profile.stripeSubscriptionId !== undefined) persistence.stripe_subscription_id = profile.stripeSubscriptionId;
        if (profile.subscriptionStatus !== undefined) persistence.subscription_status = profile.subscriptionStatus;
        if (profile.postsCount !== undefined) persistence.posts_count = profile.postsCount;
        if (profile.reactionsCount !== undefined) persistence.reactions_count = profile.reactionsCount;
        if (profile.postsCountReset !== undefined) persistence.posts_count_reset = profile.postsCountReset?.toISOString();
        if (profile.isSocialActive !== undefined) persistence.is_social_active = profile.isSocialActive;
        if (profile.isSearchable !== undefined) persistence.is_searchable = profile.isSearchable;
        if (profile.isNotificationsActive !== undefined) persistence.is_notifications_active = profile.isNotificationsActive;
        if (profile.updatedAt !== undefined) persistence.updated_at = profile.updatedAt.toISOString();
        return persistence;
    }
}

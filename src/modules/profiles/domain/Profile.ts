import { SubscriptionTier } from '@/config/subscriptions';

export interface Profile {
    id: string; // Linked to User ID
    username: string;
    fullName?: string;
    avatarUrl?: string;
    weightUnit: 'kg' | 'lbs';
    monthlyGoal?: number;
    gender: 'male' | 'female' | 'other';
    tier: SubscriptionTier;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
    postsCount: number;
    reactionsCount: number;
    postsCountReset?: Date;
    isSocialActive: boolean;
    isSearchable: boolean;
    isNotificationsActive: boolean;
    updatedAt: Date;
}

export interface ProfileRepository {
    getById(id: string): Promise<Profile | null>;
    save(profile: Profile): Promise<void>;
    update(id: string, profile: Partial<Profile>): Promise<void>;
    uploadAvatar(userId: string, imageData: Blob): Promise<string>;
}

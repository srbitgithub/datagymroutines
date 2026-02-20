export type SubscriptionTier = 'rookie' | 'pro' | 'elite' | 'free4ever';

export interface TierLimits {
    maxActiveRoutines: number;    // -1 = unlimited
    postsPerWeek: number;         // -1 = unlimited
    reactionsPerWeek: number;     // -1 = unlimited
    maxGroupsPerMonth: number;    // 0 = read only, -1 = unlimited
    historyDays: number;          // -1 = unlimited
    canCreateRoutines: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, TierLimits> = {
    rookie: {
        maxActiveRoutines: 1,
        postsPerWeek: 2,
        reactionsPerWeek: 20,
        maxGroupsPerMonth: 0,
        historyDays: 7,
        canCreateRoutines: false,
    },
    pro: {
        maxActiveRoutines: 5,
        postsPerWeek: 5,
        reactionsPerWeek: 40,
        maxGroupsPerMonth: 1,
        historyDays: 30,
        canCreateRoutines: true,
    },
    elite: {
        maxActiveRoutines: 15,
        postsPerWeek: -1,
        reactionsPerWeek: -1,
        maxGroupsPerMonth: -1,
        historyDays: -1,
        canCreateRoutines: true,
    },
    free4ever: {
        maxActiveRoutines: -1,
        postsPerWeek: -1,
        reactionsPerWeek: -1,
        maxGroupsPerMonth: -1,
        historyDays: -1,
        canCreateRoutines: true,
    },
};

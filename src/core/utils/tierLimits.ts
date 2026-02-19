import { Profile } from '@/modules/profiles/domain/Profile';
import { SubscriptionTier, SUBSCRIPTION_LIMITS } from '@/config/subscriptions';

export interface LimitCheckResult {
    allowed: boolean;
    reason?: string;
}

const MS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;

function isWeeklyPeriodExpired(resetDate: Date | undefined): boolean {
    if (!resetDate) return true;
    return Date.now() - resetDate.getTime() > MS_IN_WEEK;
}

export function canCreateRoutine(profile: Profile, currentCount: number): LimitCheckResult {
    const limits = SUBSCRIPTION_LIMITS[profile.tier];

    if (!limits.canCreateRoutines) {
        return { allowed: false, reason: 'Tu plan Rookie solo permite editar rutinas. ¡Mejora a Pro para crear más!' };
    }

    if (limits.maxActiveRoutines !== -1 && currentCount >= limits.maxActiveRoutines) {
        return { allowed: false, reason: `Has alcanzado el límite de ${limits.maxActiveRoutines} rutinas para tu plan.` };
    }

    return { allowed: true };
}

export function canDeleteRoutine(profile: Profile): LimitCheckResult {
    const limits = SUBSCRIPTION_LIMITS[profile.tier];

    if (!limits.canCreateRoutines) {
        return { allowed: false, reason: 'Tu plan Rookie no permite eliminar rutinas.' };
    }

    return { allowed: true };
}

export function canSharePost(profile: Profile): LimitCheckResult {
    const limits = SUBSCRIPTION_LIMITS[profile.tier];

    if (limits.postsPerWeek === -1) return { allowed: true };

    if (isWeeklyPeriodExpired(profile.postsCountReset)) return { allowed: true };

    if (profile.postsCount >= limits.postsPerWeek) {
        return { allowed: false, reason: `Has alcanzado el límite de ${limits.postsPerWeek} publicaciones semanales de tu plan.` };
    }

    return { allowed: true };
}

export function canAddReaction(profile: Profile): LimitCheckResult {
    const limits = SUBSCRIPTION_LIMITS[profile.tier];

    if (limits.reactionsPerWeek === -1) return { allowed: true };

    if (isWeeklyPeriodExpired(profile.postsCountReset)) return { allowed: true };

    if (profile.reactionsCount >= limits.reactionsPerWeek) {
        return { allowed: false, reason: `Has alcanzado el límite de ${limits.reactionsPerWeek} reacciones semanales de tu plan.` };
    }

    return { allowed: true };
}

export function getHistoryStartDate(tier: SubscriptionTier): Date | null {
    const limits = SUBSCRIPTION_LIMITS[tier];
    if (limits.historyDays === -1) return null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - limits.historyDays);
    return startDate;
}

export function buildWeeklyCounterUpdate(
    profile: Profile,
    field: 'posts' | 'reactions'
): { posts_count?: number; reactions_count?: number; posts_count_reset?: string } {
    const expired = isWeeklyPeriodExpired(profile.postsCountReset);
    const now = new Date().toISOString();

    if (field === 'posts') {
        return {
            posts_count: expired ? 1 : profile.postsCount + 1,
            reactions_count: expired ? 0 : profile.reactionsCount,
            posts_count_reset: expired ? now : undefined,
        };
    } else {
        return {
            reactions_count: expired ? 1 : profile.reactionsCount + 1,
            posts_count: expired ? 0 : profile.postsCount,
            posts_count_reset: expired ? now : undefined,
        };
    }
}

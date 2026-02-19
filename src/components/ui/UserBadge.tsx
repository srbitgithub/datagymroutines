import { SubscriptionTier } from '@/config/subscriptions';

interface UserBadgeProps {
    tier: SubscriptionTier;
    size?: 'sm' | 'md';
}

export function UserBadge({ tier, size = 'sm' }: UserBadgeProps) {
    const textSize = size === 'sm' ? 'text-[9px]' : 'text-[11px]';
    const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';

    if (tier === 'elite') {
        return (
            <span className={`inline-flex items-center ${padding} ${textSize} font-bold bg-brand-primary text-white rounded-full uppercase tracking-widest animate-pulse`}>
                Elite
            </span>
        );
    }

    if (tier === 'pro') {
        return (
            <span className={`inline-flex items-center ${padding} ${textSize} font-bold bg-blue-500 text-white rounded-full uppercase tracking-widest`}>
                Pro
            </span>
        );
    }

    if (tier === 'free4ever') {
        return (
            <span className={`inline-flex items-center ${padding} ${textSize} font-bold bg-amber-500 text-white rounded-full uppercase tracking-widest shadow-[0_0_8px_rgba(245,158,11,0.4)]`}>
                ∞
            </span>
        );
    }

    return null; // Rookie has no badge
}

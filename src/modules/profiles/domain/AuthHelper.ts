import { Profile } from "./Profile";

/**
 * Helper to determine if a user profile has unlimted access/privileges.
 * This includes the 'free4ever' tier and potentially 'elite' in the future.
 */
export const hasUnlimitedAccess = (profile: Profile | null | undefined): boolean => {
    if (!profile) return false;

    // Free4Ever always has unlimited access
    if (profile.tier === 'free4ever') return true;

    // Potentially Elite users also have unlimited access if the business logic dictates so
    // For now, let's keep it strictly to Free4Ever as per user request
    return false;
};

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Profile } from '@/modules/profiles/domain/Profile';
import { getProfileAction } from '@/app/_actions/auth';

interface ProfileContextType {
    profile: Profile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshProfile = useCallback(async () => {
        try {
            const updatedProfile = await getProfileAction();
            setProfile(updatedProfile);
        } catch (error) {
            console.error('Error refreshing profile:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    return (
        <ProfileContext.Provider value={{ profile, loading, refreshProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}

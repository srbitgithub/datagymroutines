export interface Profile {
    id: string; // Linked to User ID
    username: string;
    fullName?: string;
    avatarUrl?: string;
    weightUnit: 'kg' | 'lbs';
    monthlyGoal?: number;
    role: 'Rookie' | 'Athlete' | 'Elite';
    updatedAt: Date;
}

export interface ProfileRepository {
    getById(id: string): Promise<Profile | null>;
    save(profile: Profile): Promise<void>;
    update(id: string, profile: Partial<Profile>): Promise<void>;
}

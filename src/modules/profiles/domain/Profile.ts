export interface Profile {
    id: string; // Linked to User ID
    username: string;
    fullName?: string;
    avatarUrl?: string;
    weightUnit: 'kg' | 'lbs';
    monthlyGoal?: number;
    gender: 'male' | 'female' | 'other';
    role: 'Rookie' | 'Athlete' | 'Elite' | 'Free4Ever';
    updatedAt: Date;
}

export interface ProfileRepository {
    getById(id: string): Promise<Profile | null>;
    save(profile: Profile): Promise<void>;
    update(id: string, profile: Partial<Profile>): Promise<void>;
    uploadAvatar(userId: string, imageData: Blob): Promise<string>;
}

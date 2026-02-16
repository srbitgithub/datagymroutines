import { Profile } from "../../profiles/domain/Profile";

export interface SocialPost {
    id: string;
    userId: string;
    sessionId: string;
    message: string;
    createdAt: Date;
    user?: Profile;
    groups?: string[]; // IDs of groups it's shared to
    reactions?: Record<string, number>;
    userReactions?: string[];
}

export interface SocialPostRepository {
    getById(id: string): Promise<SocialPost | null>;
    create(post: Omit<SocialPost, 'id' | 'createdAt'>, groupIds: string[]): Promise<SocialPost>;
    getFeedByGroup(groupId: string): Promise<SocialPost[]>;
}

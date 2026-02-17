import { Profile } from "../../profiles/domain/Profile";

export interface SocialGroup {
    id: string;
    name: string;
    creatorId: string;
    adminId: string | null;
    createdAt: Date;
    members?: Profile[];
}

export interface SocialGroupRepository {
    getById(id: string): Promise<SocialGroup | null>;
    getByUser(userId: string): Promise<SocialGroup[]>;
    create(group: Omit<SocialGroup, 'id' | 'createdAt'>): Promise<SocialGroup>;
    update(id: string, group: Partial<SocialGroup>): Promise<void>;
    delete(id: string): Promise<void>;
    addMember(groupId: string, userId: string): Promise<void>;
    removeMember(groupId: string, userId: string): Promise<void>;
    isMember(groupId: string, userId: string): Promise<boolean>;
    getGroupMembers(groupId: string): Promise<string[]>;
    getGroupMemberCount(userId: string): Promise<number>;
    searchUsers(query: string): Promise<Profile[]>;
}

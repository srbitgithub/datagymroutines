import { SocialGroup } from "../../domain/SocialGroup";
import { Notification } from "../../domain/Notification";
import { ProfileMapper } from "../../../profiles/infrastructure/mappers/ProfileMapper";

export class SocialMapper {
    static toGroupDomain(raw: any, members?: any[]): SocialGroup {
        if (!raw) return {} as any;
        return {
            id: raw.id,
            name: raw.name,
            creatorId: raw.creator_id,
            adminId: raw.admin_id,
            createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
            members: members ? members.map(m => m.profile ? ProfileMapper.toDomain(m.profile) : { id: m.user_id } as any).filter(Boolean) : []
        };
    }

    static toGroupPersistence(group: Omit<SocialGroup, 'id' | 'createdAt'>): any {
        return {
            name: group.name,
            creator_id: group.creatorId,
            admin_id: group.adminId
        };
    }

    static toPostDomain(raw: any): any {
        return {
            id: raw.id,
            userId: raw.user_id,
            sessionId: raw.session_id,
            message: raw.message,
            createdAt: new Date(raw.created_at),
            user: raw.profile ? ProfileMapper.toDomain(raw.profile) : undefined
        };
    }

    static toPostPersistence(post: any): any {
        return {
            user_id: post.userId,
            session_id: post.sessionId,
            message: post.message
        };
    }

    static toNotificationDomain(raw: any): Notification {
        return {
            id: raw.id,
            userId: raw.user_id,
            actorId: raw.actor_id,
            type: raw.type,
            data: raw.data || {},
            isRead: raw.is_read,
            createdAt: new Date(raw.created_at),
            actor: raw.actor ? {
                username: raw.actor.username,
                avatarUrl: raw.actor.avatar_url
            } : undefined
        };
    }

    static toNotificationPersistence(notification: Partial<Notification>): any {
        const persistence: any = {};
        if (notification.userId !== undefined) persistence.user_id = notification.userId;
        if (notification.actorId !== undefined) persistence.actor_id = notification.actorId;
        if (notification.type !== undefined) persistence.type = notification.type;
        if (notification.data !== undefined) persistence.data = notification.data;
        if (notification.isRead !== undefined) persistence.is_read = notification.isRead;
        return persistence;
    }
}

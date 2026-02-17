export interface Notification {
    id: string;
    userId: string;
    actorId?: string;
    type: 'workout_completion' | 'reaction' | 'group_invitation';
    data: {
        sessionId?: string;
        groupId?: string;
        username?: string;
        emoji?: string;
        [key: string]: any;
    };
    isRead: boolean;
    createdAt: Date;
    actor?: {
        username: string;
        avatarUrl?: string;
    };
}

export interface NotificationRepository {
    getByUser(userId: string): Promise<Notification[]>;
    create(notification: Partial<Notification>): Promise<void>;
    markAsRead(id: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
}

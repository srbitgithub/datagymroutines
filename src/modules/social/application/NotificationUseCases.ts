import { Notification, NotificationRepository } from "../domain/Notification";

export class GetUserNotificationsUseCase {
    constructor(private notificationRepo: NotificationRepository) { }

    async execute(userId: string): Promise<Notification[]> {
        return this.notificationRepo.getByUser(userId);
    }
}

export class MarkNotificationAsReadUseCase {
    constructor(private notificationRepo: NotificationRepository) { }

    async execute(id: string): Promise<void> {
        return this.notificationRepo.markAsRead(id);
    }
}

export class MarkAllNotificationsAsReadUseCase {
    constructor(private notificationRepo: NotificationRepository) { }

    async execute(userId: string): Promise<void> {
        return this.notificationRepo.markAllAsRead(userId);
    }
}

export class GetUnreadNotificationsCountUseCase {
    constructor(private notificationRepo: NotificationRepository) { }

    async execute(userId: string): Promise<number> {
        return this.notificationRepo.getUnreadCount(userId);
    }
}

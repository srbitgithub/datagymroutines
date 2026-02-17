import { Notification, NotificationRepository } from "../../domain/Notification";
import { SocialMapper } from "../mappers/SocialMapper";
import { SupabaseRepository } from "@/core/infrastructure/SupabaseRepository";

export class SupabaseNotificationRepository extends SupabaseRepository implements NotificationRepository {
    async getByUser(userId: string): Promise<Notification[]> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("notifications")
            .select("*, actor:profiles!notifications_actor_id_fkey(username, avatar_url)")
            .eq("user_id", userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error || !data) return [];

        return data.map(n => SocialMapper.toNotificationDomain(n));
    }

    async create(notification: Partial<Notification>): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("notifications")
            .insert(SocialMapper.toNotificationPersistence(notification));

        if (error) throw new Error(error.message);
    }

    async markAsRead(id: string): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async markAllAsRead(userId: string): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", userId)
            .eq("is_read", false);

        if (error) throw new Error(error.message);
    }

    async getUnreadCount(userId: string): Promise<number> {
        const client = await this.getClient();
        const { count, error } = await client
            .from("notifications")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId)
            .eq("is_read", false);

        if (error) return 0;
        return count || 0;
    }
}

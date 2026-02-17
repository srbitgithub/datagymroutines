import { Notification, NotificationRepository } from "../../domain/Notification";
import { SocialMapper } from "../mappers/SocialMapper";
import { SupabaseRepository } from "@/core/infrastructure/SupabaseRepository";

export class SupabaseNotificationRepository extends SupabaseRepository implements NotificationRepository {
    async getByUser(userId: string): Promise<Notification[]> {
        const client = await this.getClient();

        // 1. Get notifications
        const { data, error } = await client
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error("Error fetching notifications:", error);
            return [];
        }
        if (!data || data.length === 0) return [];

        // 2. Get actor profiles separately to avoid FK join issues
        const actorIds = [...new Set(data.map(n => n.actor_id).filter(Boolean))];
        let actorMap = new Map<string, any>();

        if (actorIds.length > 0) {
            const { data: profiles } = await client
                .from("profiles")
                .select("id, username, avatar_url")
                .in("id", actorIds);

            if (profiles) {
                actorMap = new Map(profiles.map(p => [p.id, p]));
            }
        }

        return data.map(n => SocialMapper.toNotificationDomain({
            ...n,
            actor: n.actor_id ? actorMap.get(n.actor_id) || null : null
        }));
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

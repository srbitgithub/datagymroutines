import { SocialPost, SocialPostRepository } from "../domain/SocialPost";
import { ProfileRepository } from "../../profiles/domain/Profile";
import { SocialGroupRepository } from "../domain/SocialGroup";
import { NotificationRepository } from "../domain/Notification";

export class ShareWorkoutUseCase {
    constructor(
        private postRepo: SocialPostRepository,
        private profileRepo: ProfileRepository,
        private groupRepo: SocialGroupRepository,
        private notificationRepo: NotificationRepository
    ) { }

    async execute(userId: string, sessionId: string, groupIds: string[], timeStr?: string): Promise<SocialPost> {
        if (groupIds.length === 0) throw new Error("Debes seleccionar al menos un grupo.");

        const profile = await this.profileRepo.getById(userId);
        if (!profile) throw new Error("Perfil no encontrado");

        const finalTimeStr = timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Automatic message: @usuario ha terminado con éxito su entrenamiento de hoy a las HH:MM
        const message = `@${profile.username} ha terminado con éxito su entrenamiento de hoy a las ${finalTimeStr}`;

        const post = await this.postRepo.create({
            userId,
            sessionId,
            message
        }, groupIds);

        // 3. Create notifications for group members
        try {
            const memberToGroupMap = new Map<string, string>();
            for (const groupId of groupIds) {
                const members = await this.groupRepo.getGroupMembers(groupId);
                members.forEach(id => {
                    if (id !== userId && !memberToGroupMap.has(id)) {
                        memberToGroupMap.set(id, groupId);
                    }
                });
            }

            for (const [recipientId, targetGroupId] of memberToGroupMap.entries()) {
                const recipientProfile = await this.profileRepo.getById(recipientId);
                if (recipientProfile?.isNotificationsActive) {
                    await this.notificationRepo.create({
                        userId: recipientId,
                        actorId: userId,
                        type: 'workout_completion',
                        data: {
                            sessionId,
                            groupId: targetGroupId,
                            username: profile.username
                        }
                    });
                }
            }
        } catch (notifyError) {
            // Don't fail the whole share if notification fails
            console.error("Failed to send workout notifications:", notifyError);
        }

        return post;
    }
}

export class GetGroupFeedUseCase {
    constructor(private postRepo: SocialPostRepository) { }

    async execute(groupId: string): Promise<SocialPost[]> {
        return this.postRepo.getFeedByGroup(groupId);
    }
}

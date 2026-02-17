import { SocialReactionRepository, EmojiReaction } from "../domain/SocialReaction";
import { NotificationRepository } from "../domain/Notification";
import { SocialPostRepository } from "../domain/SocialPost";
import { ProfileRepository } from "../../profiles/domain/Profile";

export class ToggleReactionUseCase {
    constructor(
        private reactionRepo: SocialReactionRepository,
        private postRepo: SocialPostRepository,
        private profileRepo: ProfileRepository,
        private notificationRepo: NotificationRepository
    ) { }

    async execute(postId: string, userId: string, emoji: EmojiReaction, groupId?: string): Promise<void> {
        const post = await this.postRepo.getById(postId);
        if (!post || post.userId === userId) {
            // Cannot react to your own post or non-existent post
            return;
        }

        const reactions = await this.reactionRepo.getUserReactions(postId, userId);

        if (reactions.includes(emoji)) {
            await this.reactionRepo.removeReaction(postId, userId, emoji);

            // Retract notification if it exists and is unread
            try {
                const post = await this.postRepo.getById(postId);
                if (post && post.userId !== userId) {
                    await this.notificationRepo.removeReactionNotification(
                        post.userId,
                        userId,
                        postId,
                        emoji
                    );
                }
            } catch (notifyError) {
                console.error("Failed to retract reaction notification:", notifyError);
            }
        } else {
            // User can have multiple types of reactions, but usually we just add/remove
            await this.reactionRepo.addReaction(postId, userId, emoji);

            // Trigger notification to post owner
            try {
                const post = await this.postRepo.getById(postId);
                if (post && post.userId !== userId) {
                    const recipientProfile = await this.profileRepo.getById(post.userId);
                    if (recipientProfile?.isNotificationsActive) {
                        const actorProfile = await this.profileRepo.getById(userId);
                        await this.notificationRepo.create({
                            userId: post.userId,
                            actorId: userId,
                            type: 'reaction',
                            data: {
                                postId,
                                emoji,
                                groupId,
                                username: actorProfile?.username || "Alguien"
                            }
                        });
                    }
                }
            } catch (notifyError) {
                console.error("Failed to send reaction notification:", notifyError);
            }
        }
    }
}

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

    async execute(postId: string, userId: string, emoji: EmojiReaction): Promise<void> {
        const reactions = await this.reactionRepo.getUserReactions(postId, userId);

        if (reactions.includes(emoji)) {
            await this.reactionRepo.removeReaction(postId, userId, emoji);
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

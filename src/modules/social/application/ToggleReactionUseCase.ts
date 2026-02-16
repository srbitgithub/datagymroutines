import { SocialReactionRepository, EmojiReaction } from "../domain/SocialReaction";

export class ToggleReactionUseCase {
    constructor(private reactionRepo: SocialReactionRepository) { }

    async execute(postId: string, userId: string, emoji: EmojiReaction): Promise<void> {
        const reactions = await this.reactionRepo.getUserReactions(postId, userId);

        if (reactions.includes(emoji)) {
            await this.reactionRepo.removeReaction(postId, userId, emoji);
        } else {
            // User can have multiple types of reactions, but usually we just add/remove
            await this.reactionRepo.addReaction(postId, userId, emoji);
        }
    }
}

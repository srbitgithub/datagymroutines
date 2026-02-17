import { SocialReactionRepository, EmojiReaction } from "../domain/SocialReaction";

export class GetReactorsUseCase {
    constructor(private reactionRepo: SocialReactionRepository) { }

    async execute(postId: string, emoji: EmojiReaction): Promise<{ username: string }[]> {
        return this.reactionRepo.getReactorsWithProfiles(postId, emoji);
    }
}

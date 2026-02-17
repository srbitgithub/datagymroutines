import { SocialPost, SocialPostRepository } from "../domain/SocialPost";
import { ProfileRepository } from "../../profiles/domain/Profile";

export class ShareWorkoutUseCase {
    constructor(
        private postRepo: SocialPostRepository,
        private profileRepo: ProfileRepository
    ) { }

    async execute(userId: string, sessionId: string, groupIds: string[], timeStr?: string): Promise<SocialPost> {
        if (groupIds.length === 0) throw new Error("Debes seleccionar al menos un grupo.");

        const profile = await this.profileRepo.getById(userId);
        if (!profile) throw new Error("Perfil no encontrado");

        const finalTimeStr = timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Automatic message: @usuario ha terminado con éxito su entrenamiento de hoy a las HH:MM
        const message = `@${profile.username} ha terminado con éxito su entrenamiento de hoy a las ${finalTimeStr}`;

        return this.postRepo.create({
            userId,
            sessionId,
            message
        }, groupIds);
    }
}

export class GetGroupFeedUseCase {
    constructor(private postRepo: SocialPostRepository) { }

    async execute(groupId: string): Promise<SocialPost[]> {
        return this.postRepo.getFeedByGroup(groupId);
    }
}

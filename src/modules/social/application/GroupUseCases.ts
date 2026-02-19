import { SocialGroup, SocialGroupRepository } from "../domain/SocialGroup";
import { ProfileRepository } from "../../profiles/domain/Profile";

export class CreateGroupUseCase {
    constructor(
        private groupRepo: SocialGroupRepository,
        private profileRepo: ProfileRepository
    ) { }

    async execute(userId: string, name: string): Promise<SocialGroup> {
        const profile = await this.profileRepo.getById(userId);
        if (!profile) throw new Error("Perfil no encontrado");

        // Check subscription limits per SUBSCRIPTION_LIMITS config
        const currentCount = await this.groupRepo.getGroupMemberCount(userId);
        const tier = profile.tier || 'rookie';

        if (tier === 'rookie') {
            throw new Error("Las cuentas gratuitas no pueden crear grupos. ¡Pásate a Pro!");
        }

        if (tier === 'pro' && currentCount >= 1) {
            throw new Error("Has alcanzado el límite de 1 grupo para tu cuenta Pro.");
        }

        return this.groupRepo.create({
            name,
            creatorId: userId,
            adminId: userId
        });
    }
}

export class AddMemberUseCase {
    constructor(private groupRepo: SocialGroupRepository) { }

    async execute(groupId: string, creatorId: string, memberId: string): Promise<void> {
        const group = await this.groupRepo.getById(groupId);
        if (!group) throw new Error("Grupo no encontrado");

        if (group.creatorId !== creatorId) {
            throw new Error("Solo el creador del grupo puede añadir miembros.");
        }

        await this.groupRepo.addMember(groupId, memberId);
    }
}

export class GetUserGroupsUseCase {
    constructor(private groupRepo: SocialGroupRepository) { }

    async execute(userId: string): Promise<SocialGroup[]> {
        return this.groupRepo.getByUser(userId);
    }
}

export class ExitGroupUseCase {
    constructor(private groupRepo: SocialGroupRepository) { }

    async execute(groupId: string, userId: string, nextAdminId?: string): Promise<void> {
        const group = await this.groupRepo.getById(groupId);
        if (!group) throw new Error("Grupo no encontrado");

        // If user is creator, they must designate a new admin (if there are other members)
        if (group.creatorId === userId) {
            if (!nextAdminId && (group.members?.length || 0) > 1) {
                throw new Error("Debes indicar quién se queda como administrador antes de abandonar el grupo.");
            }

            if (nextAdminId) {
                await this.groupRepo.update(groupId, { creatorId: nextAdminId, adminId: nextAdminId });
            }
        }

        await this.groupRepo.removeMember(groupId, userId);
    }
}

export class SearchUsersUseCase {
    constructor(private groupRepo: SocialGroupRepository) { }

    async execute(query: string): Promise<any[]> {
        if (!query || query.length < 2) return [];
        return this.groupRepo.searchUsers(query);
    }
}

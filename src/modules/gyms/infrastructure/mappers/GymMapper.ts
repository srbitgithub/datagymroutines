import { Gym } from "../../domain/Gym";

export class GymMapper {
    static toDomain(raw: any): Gym {
        return {
            id: raw.id,
            userId: raw.user_id,
            name: raw.name,
            description: raw.description,
            isDefault: raw.is_default,
            createdAt: new Date(raw.created_at),
        };
    }

    static toPersistence(gym: Gym): any {
        return {
            id: gym.id,
            user_id: gym.userId,
            name: gym.name,
            description: gym.description,
            is_default: gym.isDefault,
            created_at: gym.createdAt.toISOString(),
        };
    }

    static toPartialPersistence(gym: Partial<Gym>): any {
        const persistence: any = {};
        if (gym.name !== undefined) persistence.name = gym.name;
        if (gym.description !== undefined) persistence.description = gym.description;
        if (gym.isDefault !== undefined) persistence.is_default = gym.isDefault;
        if (gym.userId !== undefined) persistence.user_id = gym.userId;
        return persistence;
    }
}

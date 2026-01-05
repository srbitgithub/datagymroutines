import { Gym, GymRepository } from "../domain/Gym";

export class GetGymsUseCase {
    constructor(private gymRepository: GymRepository) { }

    async execute(userId: string): Promise<Gym[]> {
        return this.gymRepository.getAllByUserId(userId);
    }
}

export class CreateGymUseCase {
    constructor(private gymRepository: GymRepository) { }

    async execute(gym: Gym): Promise<void> {
        return this.gymRepository.save(gym);
    }
}

export class UpdateGymUseCase {
    constructor(private gymRepository: GymRepository) { }

    async execute(id: string, gymData: Partial<Gym>): Promise<void> {
        return this.gymRepository.update(id, gymData);
    }
}

export class DeleteGymUseCase {
    constructor(private gymRepository: GymRepository) { }

    async execute(id: string): Promise<void> {
        return this.gymRepository.delete(id);
    }
}

import { Routine, RoutineRepository } from "../domain/Routine";

export class GetRoutinesUseCase {
    constructor(private routineRepository: RoutineRepository) { }

    async execute(userId: string): Promise<Routine[]> {
        return this.routineRepository.getAllByUserId(userId);
    }
}

export class CreateRoutineUseCase {
    constructor(private routineRepository: RoutineRepository) { }

    async execute(routine: Routine): Promise<void> {
        return this.routineRepository.save(routine);
    }
}

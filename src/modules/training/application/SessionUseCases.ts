import { TrainingSession, SessionRepository, ExerciseSet } from "../domain/Session";

export class StartSessionUseCase {
    constructor(private sessionRepository: SessionRepository) { }

    async execute(session: TrainingSession): Promise<void> {
        return this.sessionRepository.save(session);
    }
}

export class AddSetUseCase {
    constructor(private sessionRepository: SessionRepository) { }

    async execute(set: ExerciseSet): Promise<void> {
        return this.sessionRepository.addSet(set);
    }
}

export class EndSessionUseCase {
    constructor(private sessionRepository: SessionRepository) { }

    async execute(id: string, endTime: Date, notes?: string): Promise<void> {
        return this.sessionRepository.update(id, { endTime, notes });
    }
}

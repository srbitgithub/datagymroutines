import { Exercise, ExerciseRepository } from "../domain/Exercise";

export class GetExercisesUseCase {
    constructor(private exerciseRepository: ExerciseRepository) { }

    async execute(userId: string): Promise<Exercise[]> {
        return this.exerciseRepository.getAll(userId);
    }
}

export class CreateExerciseUseCase {
    constructor(private exerciseRepository: ExerciseRepository) { }

    async execute(exercise: Exercise): Promise<void> {
        return this.exerciseRepository.save(exercise);
    }
}

export class DeleteExerciseUseCase {
    constructor(private exerciseRepository: ExerciseRepository) { }

    async execute(id: string): Promise<void> {
        return this.exerciseRepository.delete(id);
    }
}

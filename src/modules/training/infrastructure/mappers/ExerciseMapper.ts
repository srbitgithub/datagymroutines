import { Exercise } from "../../domain/Exercise";

export class ExerciseMapper {
    static toDomain(raw: any): Exercise {
        return {
            id: raw.id,
            userId: raw.user_id,
            name: raw.name,
            muscleGroup: raw.muscle_group,
            description: raw.description,
            createdAt: new Date(raw.created_at),
        };
    }

    static toPersistence(exercise: Exercise): any {
        return {
            id: exercise.id,
            user_id: exercise.userId,
            name: exercise.name,
            muscle_group: exercise.muscleGroup,
            description: exercise.description,
            created_at: exercise.createdAt.toISOString(),
        };
    }
}

import { Exercise } from "../../domain/Exercise";

export class ExerciseMapper {
    static toDomain(raw: any): Exercise {
        return {
            id: raw.id,
            userId: raw.user_id,
            name: raw.name,
            muscleGroup: raw.muscle_group,
            description: raw.description,
            loggingType: raw.logging_type || 'strength',
            createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
        };
    }

    static toPersistence(exercise: Exercise): any {
        return {
            id: exercise.id,
            user_id: exercise.userId,
            name: exercise.name,
            muscle_group: exercise.muscleGroup,
            description: exercise.description,
            logging_type: exercise.loggingType || 'strength',
            created_at: exercise.createdAt?.toISOString(),
        };
    }

    static toPartialPersistence(exercise: Partial<Exercise>): any {
        const persistence: any = {};
        if (exercise.id) persistence.id = exercise.id;
        if (exercise.userId) persistence.user_id = exercise.userId;
        if (exercise.name) persistence.name = exercise.name;
        if (exercise.muscleGroup) persistence.muscle_group = exercise.muscleGroup;
        if (exercise.description !== undefined) persistence.description = exercise.description;
        if (exercise.loggingType) persistence.logging_type = exercise.loggingType;
        if (exercise.createdAt) {
            persistence.created_at = exercise.createdAt instanceof Date
                ? exercise.createdAt.toISOString()
                : new Date(exercise.createdAt).toISOString();
        }
        return persistence;
    }
}

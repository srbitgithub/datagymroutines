import { Routine, RoutineExercise } from "../../domain/Routine";
import { ExerciseMapper } from "./ExerciseMapper";

export class RoutineMapper {
    static toDomain(raw: any): Routine {
        return {
            id: raw.id,
            userId: raw.user_id,
            name: raw.name || "Sin nombre",
            description: raw.description,
            exercises: (raw.routine_exercises || []).map((re: any) => this.toExerciseDomain(re)),
            createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
        };
    }

    private static toExerciseDomain(raw: any): RoutineExercise {
        // PostgREST might return the joined object as 'exercises' or 'exercise' 
        // and sometimes as an array if the relationship is ambiguous
        const exerciseRaw = raw.exercises || raw.exercise;
        const normalizedExercise = Array.isArray(exerciseRaw) ? exerciseRaw[0] : exerciseRaw;

        return {
            id: raw.id,
            exerciseId: raw.exercise_id,
            orderIndex: raw.order_index || 0,
            notes: raw.notes,
            exercise: normalizedExercise ? ExerciseMapper.toDomain(normalizedExercise) : undefined,
        };
    }

    static toPersistence(routine: Routine): any {
        return {
            id: routine.id,
            user_id: routine.userId,
            name: routine.name,
            description: routine.description,
            created_at: routine.createdAt.toISOString(),
        };
    }
}

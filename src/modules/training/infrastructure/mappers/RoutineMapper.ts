import { Routine, RoutineExercise } from "../../domain/Routine";
import { ExerciseMapper } from "./ExerciseMapper";

export class RoutineMapper {
    static toDomain(raw: any): Routine {
        try {
            return {
                id: raw.id,
                userId: raw.user_id,
                name: raw.name || "Sin nombre",
                description: raw.description,
                // Defensive coding: ensure routine_exercises is an array
                exercises: (Array.isArray(raw.routine_exercises) ? raw.routine_exercises : [])
                    .map((re: any) => this.toExerciseDomain(re))
                    .filter((e: RoutineExercise | null): e is RoutineExercise => e !== null), // Filter out failed exercises
                createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
                orderIndex: raw.order_index || 0,
            };
        } catch (error) {
            console.error(`Error mapping routine ID ${raw.id}:`, error);
            throw error;
        }
    }

    private static toExerciseDomain(raw: any): RoutineExercise | null {
        try {
            // PostgREST might return the joined object as 'exercises' or 'exercise' 
            // and sometimes as an array if the relationship is ambiguous
            const exerciseRaw = raw.exercises || raw.exercise;
            const normalizedExercise = Array.isArray(exerciseRaw) ? exerciseRaw[0] : exerciseRaw;

            // If we don't have the basic relation data, we might be looking at a malformed join
            if (!raw.id || !raw.exercise_id) {
                console.warn("RoutineMapper: Found malformed routine_exercise record", raw);
                return null;
            }

            return {
                id: raw.id,
                exerciseId: raw.exercise_id,
                orderIndex: raw.order_index || 0,
                series: raw.series || 3, // Default to 3 sets if not specified
                targetReps: raw.target_reps,
                targetWeight: raw.target_weight,
                notes: raw.notes,
                exercise: normalizedExercise ? ExerciseMapper.toDomain(normalizedExercise) : undefined,
            };
        } catch (e) {
            console.error("RoutineMapper: Error mapping individual exercise:", e);
            return null;
        }
    }

    static toPersistence(routine: Routine): any {
        return {
            id: routine.id,
            user_id: routine.userId,
            name: routine.name,
            description: routine.description,
            created_at: routine.createdAt?.toISOString(),
            order_index: routine.orderIndex,
        };
    }

    static toPartialPersistence(routine: Partial<Routine>): any {
        const persistence: any = {};
        if (routine.id) persistence.id = routine.id;
        if (routine.userId) persistence.user_id = routine.userId;
        if (routine.name) persistence.name = routine.name;
        if (routine.description !== undefined) persistence.description = routine.description;
        if (routine.createdAt) {
            persistence.created_at = routine.createdAt instanceof Date
                ? routine.createdAt.toISOString()
                : new Date(routine.createdAt).toISOString();
        }
        if (routine.orderIndex !== undefined) persistence.order_index = routine.orderIndex;
        return persistence;
    }
}

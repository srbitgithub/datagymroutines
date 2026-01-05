import { Routine, RoutineExercise } from "../../domain/Routine";
import { ExerciseMapper } from "./ExerciseMapper";

export class RoutineMapper {
    static toDomain(raw: any): Routine {
        return {
            id: raw.id,
            userId: raw.user_id,
            name: raw.name,
            description: raw.description,
            exercises: raw.routine_exercises?.map(this.toExerciseDomain) || [],
            createdAt: new Date(raw.created_at),
        };
    }

    private static toExerciseDomain(raw: any): RoutineExercise {
        return {
            id: raw.id,
            exerciseId: raw.exercise_id,
            orderIndex: raw.order_index,
            notes: raw.notes,
            exercise: raw.exercises ? ExerciseMapper.toDomain(raw.exercises) : undefined,
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

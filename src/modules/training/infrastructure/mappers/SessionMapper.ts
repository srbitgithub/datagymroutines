import { TrainingSession, ExerciseSet } from "../../domain/Session";

export class SessionMapper {
    static toDomain(raw: any): TrainingSession {
        return {
            id: raw.id,
            userId: raw.user_id,
            routineId: raw.routine_id,
            gymId: raw.gym_id,
            startTime: new Date(raw.start_time),
            endTime: raw.end_time ? new Date(raw.end_time) : undefined,
            notes: raw.notes,
            sets: raw.exercise_sets?.map(this.toSetDomain) || [],
        };
    }

    private static toSetDomain(raw: any): ExerciseSet {
        return {
            id: raw.id,
            sessionId: raw.session_id,
            exerciseId: raw.exercise_id,
            weight: Number(raw.weight),
            reps: raw.reps,
            type: raw.type,
            orderIndex: raw.order_index,
            createdAt: new Date(raw.created_at),
        };
    }

    static toPersistence(session: TrainingSession): any {
        return {
            id: session.id,
            user_id: session.userId,
            routine_id: session.routineId,
            gym_id: session.gymId,
            start_time: session.startTime.toISOString(),
            end_time: session.endTime?.toISOString(),
            notes: session.notes,
        };
    }

    static setToPersistence(set: ExerciseSet): any {
        return {
            id: set.id,
            session_id: set.sessionId,
            exercise_id: set.exerciseId,
            weight: set.weight,
            reps: set.reps,
            type: set.type,
            order_index: set.orderIndex,
            created_at: set.createdAt.toISOString(),
        };
    }
}

export interface TrainingSession {
    id: string;
    userId: string;
    routineId?: string;
    gymId?: string;
    startTime: Date;
    endTime?: Date;
    notes?: string;
    sets: ExerciseSet[];
}

export interface ExerciseSet {
    id: string;
    sessionId: string;
    exerciseId: string;
    weight: number;
    reps: number;
    type: 'normal' | 'warmup' | 'dropset' | 'failure';
    orderIndex: number;
    createdAt: Date;
}

export interface SessionRepository {
    getById(id: string): Promise<TrainingSession | null>;
    getAllByUserId(userId: string): Promise<TrainingSession[]>;
    getActiveSession(userId: string): Promise<TrainingSession | null>;
    save(session: TrainingSession): Promise<void>;
    update(id: string, session: Partial<TrainingSession>): Promise<void>;
    addSet(set: ExerciseSet): Promise<void>;
}

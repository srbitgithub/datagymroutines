export interface Exercise {
    id: string;
    userId?: string; // Optional for global exercises
    name: string;
    muscleGroup?: string;
    description?: string;
    createdAt: Date;
}

export interface ExerciseRepository {
    getById(id: string): Promise<Exercise | null>;
    getAll(userId: string): Promise<Exercise[]>;
    save(exercise: Exercise): Promise<void>;
    update(id: string, exercise: Partial<Exercise>): Promise<void>;
    delete(id: string): Promise<void>;
}

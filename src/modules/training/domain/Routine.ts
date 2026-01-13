import { Exercise } from "./Exercise";

export interface Routine {
    id: string;
    userId: string;
    name: string;
    description?: string;
    exercises: RoutineExercise[];
    createdAt: Date;
    orderIndex: number;
}

export interface RoutineExercise {
    id: string;
    exerciseId: string;
    orderIndex: number;
    series: number; // Number of sets
    targetReps?: number;
    targetWeight?: number;
    notes?: string;
    exercise?: Exercise; // Populated from join
}

export interface RoutineRepository {
    getById(id: string): Promise<Routine | null>;
    getAllByUserId(userId: string): Promise<Routine[]>;
    save(routine: Routine): Promise<void>;
    update(id: string, routine: Partial<Routine>): Promise<void>;
    updateOrders(orders: { id: string, orderIndex: number }[]): Promise<void>;
    delete(id: string): Promise<void>;
}

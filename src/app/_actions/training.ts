'use server';

import { SupabaseAuthRepository } from "@/modules/auth/infrastructure/adapters/SupabaseAuthRepository";
import { SupabaseExerciseRepository } from "@/modules/training/infrastructure/adapters/SupabaseExerciseRepository";
import { GetExercisesUseCase, CreateExerciseUseCase } from "@/modules/training/application/ExerciseUseCases";
import { GetRoutinesUseCase, CreateRoutineUseCase } from "@/modules/training/application/RoutineUseCases";
import { StartSessionUseCase, AddSetUseCase, EndSessionUseCase } from "@/modules/training/application/SessionUseCases";
import { ExerciseSet } from "@/modules/training/domain/Session";
import { SupabaseRoutineRepository } from "@/modules/training/infrastructure/adapters/SupabaseRoutineRepository";
import { SupabaseSessionRepository } from "@/modules/training/infrastructure/adapters/SupabaseSessionRepository";

export async function getExercisesAction() {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();

    if (!user) return [];

    const exerciseRepository = new SupabaseExerciseRepository();
    const getExercisesUseCase = new GetExercisesUseCase(exerciseRepository);

    return getExercisesUseCase.execute(user.id);
}

export async function createExerciseAction(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const muscleGroup = formData.get("muscleGroup") as string;
    const description = formData.get("description") as string;

    if (!name) return { error: "El nombre es requerido" };

    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const exerciseRepository = new SupabaseExerciseRepository();
    const createExerciseUseCase = new CreateExerciseUseCase(exerciseRepository);

    try {
        await createExerciseUseCase.execute({
            id: crypto.randomUUID(),
            userId: user.id,
            name,
            muscleGroup,
            description,
            createdAt: new Date(),
        });
        return { success: true };
    } catch (error) {
        return { error: "Error al crear el ejercicio" };
    }
}

export async function getRoutinesAction() {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return [];

    const routineRepository = new SupabaseRoutineRepository();
    const getRoutinesUseCase = new GetRoutinesUseCase(routineRepository);
    return getRoutinesUseCase.execute(user.id);
}

export async function getActiveSessionAction() {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return null;

    const sessionRepository = new SupabaseSessionRepository();
    return sessionRepository.getActiveSession(user.id);
}

export async function createRoutineAction(name: string, description: string, exerciseIds: string[]) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const routineRepository = new SupabaseRoutineRepository();
    const createRoutineUseCase = new CreateRoutineUseCase(routineRepository);

    try {
        const routineId = crypto.randomUUID();
        await createRoutineUseCase.execute({
            id: routineId,
            userId: user.id,
            name,
            description,
            createdAt: new Date(),
            exercises: exerciseIds.map((id, index) => ({
                id: crypto.randomUUID(),
                exerciseId: id,
                orderIndex: index,
            })),
        });
        return { success: true };
    } catch (error) {
        return { error: "Error al crear la rutina" };
    }
}

export async function startSessionAction(routineId?: string) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const sessionRepository = new SupabaseSessionRepository();
    const startSessionUseCase = new StartSessionUseCase(sessionRepository);

    const sessionId = crypto.randomUUID();
    try {
        await startSessionUseCase.execute({
            id: sessionId,
            userId: user.id,
            routineId,
            startTime: new Date(),
            sets: [],
        });
        return { success: true, sessionId };
    } catch (error) {
        return { error: "Error al iniciar sesión" };
    }
}

export async function finishSessionAction(sessionId: string, notes?: string) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const sessionRepository = new SupabaseSessionRepository();
    const endSessionUseCase = new EndSessionUseCase(sessionRepository);

    try {
        await endSessionUseCase.execute(sessionId, new Date(), notes);
        return { success: true };
    } catch (error) {
        return { error: "Error al finalizar la sesión" };
    }
}

export async function addSetAction(setData: Omit<ExerciseSet, 'id' | 'createdAt'>) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const sessionRepository = new SupabaseSessionRepository();
    const addSetUseCase = new AddSetUseCase(sessionRepository);

    try {
        await addSetUseCase.execute({
            ...setData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
        });
        return { success: true };
    } catch (error) {
        return { error: "Error al añadir la serie" };
    }
}

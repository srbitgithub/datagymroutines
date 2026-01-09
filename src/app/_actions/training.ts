'use server';

import { SupabaseAuthRepository } from "@/modules/auth/infrastructure/adapters/SupabaseAuthRepository";
import { SupabaseExerciseRepository } from "@/modules/training/infrastructure/adapters/SupabaseExerciseRepository";
import { GetExercisesUseCase, CreateExerciseUseCase } from "@/modules/training/application/ExerciseUseCases";
import { GetRoutinesUseCase, CreateRoutineUseCase } from "@/modules/training/application/RoutineUseCases";
import { StartSessionUseCase, AddSetUseCase, EndSessionUseCase } from "@/modules/training/application/SessionUseCases";
import { ExerciseSet } from "@/modules/training/domain/Session";
import { SupabaseRoutineRepository } from "@/modules/training/infrastructure/adapters/SupabaseRoutineRepository";
import { SupabaseSessionRepository } from "@/modules/training/infrastructure/adapters/SupabaseSessionRepository";
import { revalidatePath } from "next/cache";

export async function getExercisesAction() {
    try {
        const authRepository = new SupabaseAuthRepository();
        const user = await authRepository.getSession();

        if (!user) return [];

        const exerciseRepository = new SupabaseExerciseRepository();
        const getExercisesUseCase = new GetExercisesUseCase(exerciseRepository);

        return await getExercisesUseCase.execute(user.id);
    } catch (error) {
        console.error("Error en getExercisesAction:", error);
        return [];
    }
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
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/exercises");
        return { success: true };
    } catch (error: any) {
        console.error("Error en createExerciseAction:", error);
        return { error: `Error al crear el ejercicio: ${error.message || "Error desconocido"}` };
    }
}

export async function getRoutinesAction() {
    try {
        const authRepository = new SupabaseAuthRepository();
        const user = await authRepository.getSession();

        if (!user) {
            console.warn("getRoutinesAction: No hay sesión activa");
            return [];
        }

        console.log(`getRoutinesAction: Obteniendo rutinas para el usuario ${user.id}`);
        const routineRepository = new SupabaseRoutineRepository();
        const getRoutinesUseCase = new GetRoutinesUseCase(routineRepository);
        const routines = await getRoutinesUseCase.execute(user.id);
        console.log(`getRoutinesAction: Supabase devolvió ${routines.length} rutinas`);
        return routines;
    } catch (error) {
        console.error("Error en getRoutinesAction:", error);
        return [];
    }
}

export async function getActiveSessionAction() {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return null;

    const sessionRepository = new SupabaseSessionRepository();
    console.log(`[getActiveSessionAction] Consultando repositorio para UserID: ${user.id}`);
    const activeSession = await sessionRepository.getActiveSession(user.id);

    if (!activeSession) {
        console.warn(`[getActiveSessionAction] Repositorio devolvió null para ${user.id}`);
        return null;
    }

    console.log(`[getActiveSessionAction] Sesión recuperada: ${activeSession.id}`);

    if (!activeSession) return null;

    // Fetch exercises to show names
    const exerciseRepository = new SupabaseExerciseRepository();
    const exercises = await exerciseRepository.getAll(user.id);

    // Fetch routine details if it exists
    let routine = null;
    if (activeSession.routineId) {
        const routineRepository = new SupabaseRoutineRepository();
        routine = await routineRepository.getById(activeSession.routineId);
    }

    return { session: activeSession, exercises, routine };
}

export async function updateSetAction(setId: string, setData: Partial<ExerciseSet>) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const sessionRepository = new SupabaseSessionRepository();
    try {
        await sessionRepository.updateSet(setId, setData);
        return { success: true };
    } catch (error: any) {
        console.error("Error en updateSetAction:", error);
        return { error: error.message };
    }
}

export async function getSessionByIdAction(sessionId: string) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return null;

    const sessionRepository = new SupabaseSessionRepository();
    const session = await sessionRepository.getById(sessionId);
    return session;
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
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/routines");
        return { success: true };
    } catch (error: any) {
        console.error("Error en createRoutineAction:", error);
        return { error: `Error al crear la rutina: ${error.message}` };
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
        revalidatePath("/dashboard/session");
        revalidatePath("/dashboard");
        return { success: true, sessionId };
    } catch (error: any) {
        console.error("Error crítico en startSessionAction:", error);
        return { error: error.message || "Error desconocido al iniciar sesión" };
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

export async function getProgressionDataAction(exerciseId?: string) {
    try {
        const authRepository = new SupabaseAuthRepository();
        const user = await authRepository.getSession();
        if (!user) return [];

        const sessionRepository = new SupabaseSessionRepository();
        const sessions = await sessionRepository.getAllByUserId(user.id);

        if (!Array.isArray(sessions)) {
            console.error("getProgressionDataAction: sessions is not an array", sessions);
            return [];
        }

        // Simple aggregation for volume/progress
        const data = sessions.map(session => {
            let volume = 0;
            let max1RM = 0;

            const sets = session.sets || [];
            sets.forEach(set => {
                const weight = Number(set.weight || 0);
                const reps = Number(set.reps || 0);
                const vol = weight * reps;
                volume += vol;

                if (!exerciseId || set.exerciseId === exerciseId) {
                    const est1RM = weight * (1 + 0.0333 * reps);
                    if (est1RM > max1RM) max1RM = est1RM;
                }
            });

            let dateStr = new Date().toISOString().split('T')[0];
            try {
                if (session.startTime instanceof Date && !isNaN(session.startTime.getTime())) {
                    dateStr = session.startTime.toISOString().split('T')[0];
                }
            } catch (e) {
                console.error("Error formatting date in getProgressionDataAction:", e);
            }

            return {
                date: dateStr,
                volume: Math.round(volume * 10) / 10,
                max1RM: Math.round(max1RM * 10) / 10
            };
        }).reverse();

        return data;
    } catch (error) {
        console.error("Error in getProgressionDataAction:", error);
        return [];
    }
}

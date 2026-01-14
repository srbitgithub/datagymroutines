'use server';

import { SupabaseAuthRepository } from "@/modules/auth/infrastructure/adapters/SupabaseAuthRepository";
import { SupabaseExerciseRepository } from "@/modules/training/infrastructure/adapters/SupabaseExerciseRepository";
import { GetExercisesUseCase, CreateExerciseUseCase, DeleteExerciseUseCase } from "@/modules/training/application/ExerciseUseCases";
import { GetRoutinesUseCase, CreateRoutineUseCase, UpdateRoutinesOrderUseCase } from "@/modules/training/application/RoutineUseCases";
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

export async function updateExerciseAction(id: string, name: string) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const exerciseRepository = new SupabaseExerciseRepository();
    try {
        await exerciseRepository.update(id, { name });
        revalidatePath("/dashboard/exercises");
        return { success: true };
    } catch (error: any) {
        console.error("Error en updateExerciseAction:", error);
        return { error: `Error al actualizar el ejercicio: ${error.message}` };
    }
}

export async function deleteExerciseAction(id: string) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const exerciseRepository = new SupabaseExerciseRepository();
    const deleteExerciseUseCase = new DeleteExerciseUseCase(exerciseRepository);
    try {
        await deleteExerciseUseCase.execute(id);
        revalidatePath("/dashboard/exercises");
        return { success: true };
    } catch (error: any) {
        console.error("Error en deleteExerciseAction:", error);
        return { error: `Error al borrar el ejercicio: ${error.message}` };
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

        const routineRepository = new SupabaseRoutineRepository();
        const getRoutinesUseCase = new GetRoutinesUseCase(routineRepository);
        const routines = await getRoutinesUseCase.execute(user.id);
        return routines;
    } catch (error) {
        console.error("Error en getRoutinesAction:", error);
        return [];
    }
}

export async function getRoutineByIdAction(id: string) {
    try {
        const authRepository = new SupabaseAuthRepository();
        const user = await authRepository.getSession();
        if (!user) return null;

        const routineRepository = new SupabaseRoutineRepository();
        return await routineRepository.getById(id);
    } catch (error) {
        console.error("Error en getRoutineByIdAction:", error);
        return null;
    }
}

export async function getActiveSessionAction() {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return null;

    const sessionRepository = new SupabaseSessionRepository();
    const activeSession = await sessionRepository.getActiveSession(user.id);

    if (!activeSession) return null;

    const exerciseRepository = new SupabaseExerciseRepository();
    const exercises = await exerciseRepository.getAll(user.id);

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

export async function createRoutineAction(
    name: string,
    description: string,
    exercisesConfigs: { id: string, series: number, targetReps?: number, targetWeight?: number }[]
) {
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
            exercises: exercisesConfigs.map((config, index) => ({
                id: crypto.randomUUID(),
                exerciseId: config.id,
                orderIndex: index,
                series: config.series,
                targetReps: config.targetReps,
                targetWeight: config.targetWeight,
            })),
            orderIndex: 0,
        });
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/routines");
        return { success: true };
    } catch (error: any) {
        console.error("Error en createRoutineAction:", error);
        return { error: `Error al crear la rutina: ${error.message}` };
    }
}

export async function updateRoutineAction(
    id: string,
    name: string,
    description: string,
    exercisesConfigs: { id: string, series: number, targetReps?: number, targetWeight?: number }[]
) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const routineRepository = new SupabaseRoutineRepository();

    try {
        await routineRepository.update(id, {
            name,
            description,
            exercises: exercisesConfigs.map((config, index) => ({
                id: crypto.randomUUID(),
                exerciseId: config.id,
                orderIndex: index,
                series: config.series,
                targetReps: config.targetReps,
                targetWeight: config.targetWeight,
            })),
        });
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/routines");
        return { success: true };
    } catch (error: any) {
        console.error("Error en updateRoutineAction:", error);
        return { error: `Error al actualizar la rutina: ${error.message}` };
    }
}

export async function deleteRoutineAction(id: string) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const routineRepository = new SupabaseRoutineRepository();

    try {
        await routineRepository.delete(id);
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/routines");
        return { success: true };
    } catch (error: any) {
        console.error("Error en deleteRoutineAction:", error);
        return { error: `Error al borrar la rutina: ${error.message}` };
    }
}

export async function duplicateRoutineAction(sourceId: string, newName: string, newDescription: string) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const routineRepository = new SupabaseRoutineRepository();
    const createRoutineUseCase = new CreateRoutineUseCase(routineRepository);

    try {
        const sourceRoutine = await routineRepository.getById(sourceId);
        if (!sourceRoutine) return { error: "Rutina original no encontrada" };

        const routineId = crypto.randomUUID();
        await createRoutineUseCase.execute({
            id: routineId,
            userId: user.id,
            name: newName,
            description: newDescription,
            createdAt: new Date(),
            exercises: sourceRoutine.exercises.map((re, index) => ({
                id: crypto.randomUUID(),
                exerciseId: re.exerciseId,
                orderIndex: index,
                series: re.series,
                targetReps: re.targetReps,
                targetWeight: re.targetWeight,
            })),
            orderIndex: 0, // Duplicate at the beginning or follow source? Let's say 0
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/routines");
        return { success: true };
    } catch (error: any) {
        console.error("Error en duplicateRoutineAction:", error);
        return { error: `Error al duplicar la rutina: ${error.message}` };
    }
}

export async function startSessionAction(routineId?: string, clientStartTime?: string) {
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
            startTime: clientStartTime ? new Date(clientStartTime) : new Date(),
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
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        return { error: "Error al finalizar la sesión" };
    }
}

export async function abandonSessionAction(sessionId: string) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const sessionRepository = new SupabaseSessionRepository();

    try {
        await sessionRepository.delete(sessionId);
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/session");
        return { success: true };
    } catch (error: any) {
        console.error("Error en abandonSessionAction:", error);
        return { error: `Error al abandonar la sesión: ${error.message}` };
    }
}

export async function saveSessionBatchAction(sessionId: string, sets: ExerciseSet[], isFinished: boolean = false, notes?: string, clientFinishTime?: string) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const sessionRepository = new SupabaseSessionRepository();

    try {
        // 1. Sync sets
        await sessionRepository.saveSets(sessionId, sets);

        // 2. Finish session if requested
        if (isFinished) {
            const endSessionUseCase = new EndSessionUseCase(sessionRepository);
            await endSessionUseCase.execute(sessionId, clientFinishTime ? new Date(clientFinishTime) : new Date(), notes);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/session");
        return { success: true };
    } catch (error: any) {
        console.error("Error en saveSessionBatchAction:", error);
        return { error: `Error al guardar la sesión: ${error.message}` };
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

import { unstable_noStore as noStore } from 'next/cache';

export async function getProgressionDataAction(exerciseId?: string, timezone: string = 'UTC') {
    noStore();
    console.log("\x1b[41m\x1b[37m%s\x1b[0m", "[DEBUG ACTION] getProgressionDataAction EJECUTÁNDOSE...");
    try {
        const authRepository = new SupabaseAuthRepository();
        const user = await authRepository.getSession();
        if (!user) return { items: [] };

        const sessionRepository = new SupabaseSessionRepository();
        const sessions = await sessionRepository.getAllByUserId(user.id);

        if (!Array.isArray(sessions)) return { items: [] };

        const data = sessions.map(session => {
            let volume = 0;
            let max1RM = 0;

            const sets = session.sets || [];
            sets.forEach(set => {
                const weight = Number(set.weight || 0);
                const reps = Number(set.reps || 0);
                volume += weight * reps;

                if (!exerciseId || set.exerciseId === exerciseId) {
                    const est1RM = weight * (1 + 0.0333 * reps);
                    if (est1RM > max1RM) max1RM = est1RM;
                }
            });

            const date = session.startTime instanceof Date ? session.startTime : new Date();

            // Format to YYYY-MM-DD in user's dynamic timezone (Manual for maximum stability)
            const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
            const y = localDate.getFullYear();
            const m = String(localDate.getMonth() + 1).padStart(2, '0');
            const dPart = String(localDate.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${dPart}`;

            return {
                date: dateStr,
                volume: Math.round(volume * 10) / 10,
                max1RM: Math.round(max1RM * 10) / 10
            };
        }).reverse();

        return { items: data };
    } catch (error: any) {
        console.error("Error en getProgressionDataAction:", error);
        return { items: [] };
    }
}

export async function updateRoutinesOrderAction(orders: { id: string, orderIndex: number }[]) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const routineRepository = new SupabaseRoutineRepository();
    const useCase = new UpdateRoutinesOrderUseCase(routineRepository);

    try {
        await useCase.execute(user.id, orders);
        revalidatePath("/dashboard/routines");
        return { success: true };
    } catch (error: any) {
        console.error("Error en updateRoutinesOrderAction:", error);
        return { error: `Error al actualizar el orden: ${error.message}` };
    }
}

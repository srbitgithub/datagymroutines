import { Routine, RoutineRepository } from "../../domain/Routine";
import { RoutineMapper } from "../mappers/RoutineMapper";
import { SupabaseRepository } from "@/core/infrastructure/SupabaseRepository";

export class SupabaseRoutineRepository extends SupabaseRepository implements RoutineRepository {
    async getById(id: string): Promise<Routine | null> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("routines")
            .select("*, routine_exercises(*, exercises(*))")
            .eq("id", id)
            .single();

        if (error || !data) return null;

        return RoutineMapper.toDomain(data);
    }

    async getAllByUserId(userId: string): Promise<Routine[]> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("routines")
            .select("*, routine_exercises(*, exercises(*))")
            .eq("user_id", userId)
            .order("order_index", { ascending: true });

        if (error) {
            console.error(`SupabaseRoutineRepository.getAllByUserId error:`, error);
            return [];
        }

        if (!data) return [];

        console.log(`SupabaseRoutineRepository.getAllByUserId: raw data count = ${data.length}`);

        // LOG CRÍTICO: Ver la estructura del primer elemento para debug
        if (data.length > 0) {
            console.log("SupabaseRoutineRepository: Estructura del primer elemento (RAW):", JSON.stringify(data[0], null, 2));
        }

        const validRoutines: Routine[] = [];

        for (const rawRoutine of data) {
            try {
                const domainRoutine = RoutineMapper.toDomain(rawRoutine);
                validRoutines.push(domainRoutine);
            } catch (mapError) {
                console.error(`SupabaseRoutineRepository: Error al mapear rutina ID ${rawRoutine?.id}:`, mapError);
                // Continuamos con la siguiente rutina, no fallamos todo el bloque
            }
        }

        return validRoutines;
    }

    async save(routine: Routine): Promise<void> {
        const client = await this.getClient();
        const { error: routineError } = await client
            .from("routines")
            .insert(RoutineMapper.toPersistence(routine));

        if (routineError) throw new Error(routineError.message);

        // Insert routine exercises
        if (routine.exercises.length > 0) {
            const { error: exercisesError } = await client
                .from("routine_exercises")
                .insert(
                    routine.exercises.map((re) => ({
                        routine_id: routine.id,
                        exercise_id: re.exerciseId,
                        order_index: re.orderIndex,
                        series: re.series,
                        target_reps: re.targetReps,
                        target_weight: re.targetWeight,
                        notes: re.notes,
                    }))
                );

            if (exercisesError) throw new Error(exercisesError.message);
        }
    }

    async update(id: string, routine: Partial<Routine>): Promise<void> {
        const client = await this.getClient();

        // 1. Update routine metadata if present
        if (routine.name || routine.description) {
            const { error } = await client
                .from("routines")
                .update(RoutineMapper.toPartialPersistence(routine))
                .eq("id", id);

            if (error) throw new Error(error.message);
        }

        // 2. Update exercises if present
        if (routine.exercises) {
            // Simplest way is to delete and re-insert
            const { error: deleteError } = await client
                .from("routine_exercises")
                .delete()
                .eq("routine_id", id);

            if (deleteError) throw new Error(deleteError.message);

            if (routine.exercises.length > 0) {
                const { error: insertError } = await client
                    .from("routine_exercises")
                    .insert(
                        routine.exercises.map((re) => ({
                            routine_id: id,
                            exercise_id: re.exerciseId,
                            order_index: re.orderIndex,
                            series: re.series,
                            target_reps: re.targetReps,
                            target_weight: re.targetWeight,
                            notes: re.notes,
                        }))
                    );

                if (insertError) throw new Error(insertError.message);
            }
        }
    }

    async delete(id: string): Promise<void> {
        const client = await this.getClient();

        // First delete routine_exercises (though Supabase might have ON DELETE CASCADE)
        const { error: exercisesError } = await client
            .from("routine_exercises")
            .delete()
            .eq("routine_id", id);

        if (exercisesError) throw new Error(exercisesError.message);

        const { error: routineError } = await client
            .from("routines")
            .delete()
            .eq("id", id);

        if (routineError) throw new Error(routineError.message);
    }

    async updateOrders(userId: string, orders: { id: string, orderIndex: number }[]): Promise<void> {
        const client = await this.getClient();

        // Usamos Promise.all para ejecutar todas las actualizaciones en paralelo
        // El uso de .update() en lugar de .upsert() evita violar restricciones de campos obligatorios (como 'name')
        const updates = orders.map((o) =>
            client
                .from("routines")
                .update({ order_index: o.orderIndex })
                .eq("id", o.id)
                .eq("user_id", userId)
        );

        const results = await Promise.all(updates);

        // Verificamos si hubo errores en alguna de las actualizaciones
        const firstError = results.find(r => r.error)?.error;
        if (firstError) throw new Error(firstError.message);
    }
}

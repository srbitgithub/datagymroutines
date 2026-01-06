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
            .order("created_at", { ascending: false });

        if (error || !data) return [];

        return data.map(RoutineMapper.toDomain);
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
                        notes: re.notes,
                    }))
                );

            if (exercisesError) throw new Error(exercisesError.message);
        }
    }

    async update(id: string, routineData: Partial<Routine>): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("routines")
            .update(RoutineMapper.toPersistence(routineData as Routine))
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async delete(id: string): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("routines")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);
    }
}

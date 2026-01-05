import { Exercise, ExerciseRepository } from "../../domain/Exercise";
import { supabase } from "@/modules/auth/infrastructure/adapters/SupabaseClient";
import { ExerciseMapper } from "../mappers/ExerciseMapper";

export class SupabaseExerciseRepository implements ExerciseRepository {
    async getById(id: string): Promise<Exercise | null> {
        const { data, error } = await supabase
            .from("exercises")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) return null;

        return ExerciseMapper.toDomain(data);
    }

    async getAll(userId: string): Promise<Exercise[]> {
        // Get global exercises (user_id is null) AND user's own exercises
        const { data, error } = await supabase
            .from("exercises")
            .select("*")
            .or(`user_id.is.null,user_id.eq.${userId}`)
            .order("name", { ascending: true });

        if (error || !data) return [];

        return data.map(ExerciseMapper.toDomain);
    }

    async save(exercise: Exercise): Promise<void> {
        const { error } = await supabase
            .from("exercises")
            .insert(ExerciseMapper.toPersistence(exercise));

        if (error) throw new Error(error.message);
    }

    async update(id: string, exerciseData: Partial<Exercise>): Promise<void> {
        const { error } = await supabase
            .from("exercises")
            .update(exerciseData)
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("exercises")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);
    }
}

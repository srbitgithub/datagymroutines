import { Exercise, ExerciseRepository } from "../../domain/Exercise";
import { ExerciseMapper } from "../mappers/ExerciseMapper";
import { SupabaseRepository } from "@/core/infrastructure/SupabaseRepository";

export class SupabaseExerciseRepository extends SupabaseRepository implements ExerciseRepository {
    async getById(id: string): Promise<Exercise | null> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("exercises")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) return null;

        return ExerciseMapper.toDomain(data);
    }

    async getAll(userId: string): Promise<Exercise[]> {
        // Get global exercises (user_id is null) AND user's own exercises
        const client = await this.getClient();
        const { data, error } = await client
            .from("exercises")
            .select("*")
            .or(`user_id.is.null,user_id.eq.${userId}`)
            .order("name", { ascending: true });

        if (error || !data) return [];

        return data.map(ExerciseMapper.toDomain);
    }

    async save(exercise: Exercise): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("exercises")
            .insert(ExerciseMapper.toPersistence(exercise));

        if (error) throw new Error(error.message);
    }

    async update(id: string, exerciseData: Partial<Exercise>): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("exercises")
            .update(exerciseData)
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async delete(id: string): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("exercises")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);
    }
}

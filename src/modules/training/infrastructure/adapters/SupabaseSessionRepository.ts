import { TrainingSession, SessionRepository, ExerciseSet } from "../../domain/Session";
import { supabase } from "@/modules/auth/infrastructure/adapters/SupabaseClient";
import { SessionMapper } from "../mappers/SessionMapper";

export class SupabaseSessionRepository implements SessionRepository {
    async getById(id: string): Promise<TrainingSession | null> {
        const { data, error } = await supabase
            .from("training_sessions")
            .select("*, exercise_sets(*)")
            .eq("id", id)
            .single();

        if (error || !data) return null;

        return SessionMapper.toDomain(data);
    }

    async getAllByUserId(userId: string): Promise<TrainingSession[]> {
        const { data, error } = await supabase
            .from("training_sessions")
            .select("*, exercise_sets(*)")
            .eq("user_id", userId)
            .order("start_time", { ascending: false });

        if (error || !data) return [];

        return data.map(SessionMapper.toDomain);
    }

    async getActiveSession(userId: string): Promise<TrainingSession | null> {
        const { data, error } = await supabase
            .from("training_sessions")
            .select("*, exercise_sets(*)")
            .eq("user_id", userId)
            .is("end_time", null)
            .single();

        if (error || !data) return null;

        return SessionMapper.toDomain(data);
    }

    async save(session: TrainingSession): Promise<void> {
        const { error } = await supabase
            .from("training_sessions")
            .insert(SessionMapper.toPersistence(session));

        if (error) throw new Error(error.message);
    }

    async update(id: string, sessionData: Partial<TrainingSession>): Promise<void> {
        const { error } = await supabase
            .from("training_sessions")
            .update(SessionMapper.toPersistence(sessionData as TrainingSession))
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async addSet(set: ExerciseSet): Promise<void> {
        const { error } = await supabase
            .from("exercise_sets")
            .insert(SessionMapper.setToPersistence(set));

        if (error) throw new Error(error.message);
    }
}

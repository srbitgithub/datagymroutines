import { TrainingSession, SessionRepository, ExerciseSet } from "../../domain/Session";
import { SessionMapper } from "../mappers/SessionMapper";
import { SupabaseRepository } from "@/core/infrastructure/SupabaseRepository";

export class SupabaseSessionRepository extends SupabaseRepository implements SessionRepository {
    async getById(id: string): Promise<TrainingSession | null> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("training_sessions")
            .select("*, exercise_sets(*)")
            .eq("id", id)
            .single();

        if (error || !data) return null;

        return SessionMapper.toDomain(data);
    }

    async getAllByUserId(userId: string): Promise<TrainingSession[]> {
        const client = await this.getClient();
        const { data, error } = await client
            .from("training_sessions")
            .select("*, exercise_sets(*)")
            .eq("user_id", userId)
            .order("start_time", { ascending: false });

        if (error || !data) return [];

        return data.map(SessionMapper.toDomain);
    }

    async getActiveSession(userId: string): Promise<TrainingSession | null> {
        console.log(`[SupabaseSessionRepository] Buscando sesión activa para UserID: ${userId}`);

        const client = await this.getClient();
        const { data, error } = await client
            .from("training_sessions")
            .select("*, exercise_sets(*)")
            .eq("user_id", userId)
            .is("end_time", null)
            .order("start_time", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            // Error code for "no rows found" is PGRST116
            if (error.code !== 'PGRST116') {
                console.error(`[SupabaseSessionRepository] Error DB al buscar sesión activa:`, error);
            } else {
                console.log(`[SupabaseSessionRepository] No se encontró ninguna sesión activa (PGRST116) para ${userId}`);
            }
            return null;
        }

        if (!data) {
            console.log(`[SupabaseSessionRepository] Data es null para sesión activa`);
            return null;
        }

        console.log(`[SupabaseSessionRepository] Sesión activa encontrada: ${data.id}`);
        return SessionMapper.toDomain(data);
    }

    async save(session: TrainingSession): Promise<void> {
        console.log(`[SupabaseSessionRepository] Guardando nueva sesión: ${session.id} para UserID: ${session.userId}`);
        const client = await this.getClient();
        const { error } = await client
            .from("training_sessions")
            .insert(SessionMapper.toPersistence(session));

        if (error) throw new Error(error.message);
    }

    async update(id: string, sessionData: Partial<TrainingSession>): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("training_sessions")
            .update(SessionMapper.toPersistence(sessionData as TrainingSession))
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async addSet(set: ExerciseSet): Promise<void> {
        const client = await this.getClient();
        const { error } = await client
            .from("exercise_sets")
            .insert(SessionMapper.setToPersistence(set));

        if (error) throw new Error(error.message);
    }

    async updateSet(id: string, setData: Partial<ExerciseSet>): Promise<void> {
        const client = await this.getClient();

        // Map domain partial to persistence partial
        const persistenceData: any = {};
        if (setData.weight !== undefined) persistenceData.weight = setData.weight;
        if (setData.reps !== undefined) persistenceData.reps = setData.reps;
        if (setData.type !== undefined) persistenceData.type = setData.type;
        if (setData.orderIndex !== undefined) persistenceData.order_index = setData.orderIndex;

        const { error } = await client
            .from("exercise_sets")
            .update(persistenceData)
            .eq("id", id);

        if (error) throw new Error(error.message);
    }
}

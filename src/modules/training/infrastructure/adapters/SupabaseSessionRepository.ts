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
        const { data: { user: authUser } } = await client.auth.getUser();
        console.log(`[SupabaseSessionRepository] Auth User en el cliente: ${authUser?.id || 'null'}`);

        // DEBUG: ¿Veo alguna sesión aunque no sea de este usuario? (Si esto da 0 y hay datos, es RLS)
        const { count: globalCount } = await client.from("training_sessions").select("*", { count: 'exact', head: true });
        console.log(`[SupabaseSessionRepository] DEBUG GLOBAL: Hay ${globalCount} sesiones totales en la tabla`);

        const { data, error } = await client
            .from("training_sessions")
            .select("*, exercise_sets(*)")
            .eq("user_id", userId)
            .order("start_time", { ascending: false });

        if (error) {
            console.error(`[SupabaseSessionRepository] Error al obtener sesiones:`, error);
            return [];
        }

        if (!data) {
            console.log(`[SupabaseSessionRepository] No se devolvieron datos para UserID: ${userId}`);
            return [];
        }

        console.log(`[SupabaseSessionRepository] RAW DATA: Encontradas ${data.length} sesiones en DB para ${userId}`);
        const domainSessions = data.map(SessionMapper.toDomain);
        console.log(`[SupabaseSessionRepository] DOMAIN DATA: Mapeadas ${domainSessions.length} sesiones`);

        return domainSessions;
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

    async saveSets(sessionId: string, sets: ExerciseSet[]): Promise<void> {
        const client = await this.getClient();

        // 1. Delete existing sets for this session
        const { error: deleteError } = await client
            .from("exercise_sets")
            .delete()
            .eq("session_id", sessionId);

        if (deleteError) throw new Error(deleteError.message);

        // 2. Insert new sets
        if (sets.length > 0) {
            const { error: insertError } = await client
                .from("exercise_sets")
                .insert(sets.map(SessionMapper.setToPersistence));

            if (insertError) throw new Error(insertError.message);
        }
    }
}

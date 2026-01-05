import { Gym, GymRepository } from "../../domain/Gym";
import { supabase } from "@/modules/auth/infrastructure/adapters/SupabaseClient";
import { GymMapper } from "../mappers/GymMapper";

export class SupabaseGymRepository implements GymRepository {
    async getById(id: string): Promise<Gym | null> {
        const { data, error } = await supabase
            .from("gyms")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) return null;

        return GymMapper.toDomain(data);
    }

    async getAllByUserId(userId: string): Promise<Gym[]> {
        const { data, error } = await supabase
            .from("gyms")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: true });

        if (error || !data) return [];

        return data.map(GymMapper.toDomain);
    }

    async save(gym: Gym): Promise<void> {
        const { error } = await supabase
            .from("gyms")
            .insert(GymMapper.toPersistence(gym));

        if (error) throw new Error(error.message);
    }

    async update(id: string, gymData: Partial<Gym>): Promise<void> {
        const { error } = await supabase
            .from("gyms")
            .update(gymData)
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("gyms")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);
    }
}

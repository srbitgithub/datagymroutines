import { supabase as staticClient } from "@/modules/auth/infrastructure/adapters/SupabaseClient";

export abstract class SupabaseRepository {
    protected async getClient() {
        if (typeof window === 'undefined') {
            const { createServerSideClient } = await import("@/modules/auth/infrastructure/adapters/SupabaseServerClient");
            return await createServerSideClient();
        }
        return staticClient;
    }
}

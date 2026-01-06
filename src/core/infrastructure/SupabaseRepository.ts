import { supabase as staticClient } from "@/modules/auth/infrastructure/adapters/SupabaseClient";
import { createServerSideClient } from "@/modules/auth/infrastructure/adapters/SupabaseServerClient";

export abstract class SupabaseRepository {
    protected async getClient() {
        if (typeof window === 'undefined') {
            return await createServerSideClient();
        }
        return staticClient;
    }
}

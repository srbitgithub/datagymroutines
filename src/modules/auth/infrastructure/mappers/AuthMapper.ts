import { User } from "@supabase/supabase-js";
import { AuthUser } from "../../domain/AuthUser";

export class AuthMapper {
    static toDomain(supabaseUser: User): AuthUser {
        return {
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            name: supabaseUser.user_metadata?.full_name,
            avatarUrl: supabaseUser.user_metadata?.avatar_url,
        };
    }
}

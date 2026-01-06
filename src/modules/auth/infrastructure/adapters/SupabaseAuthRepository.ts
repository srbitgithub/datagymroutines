import { AuthRepository } from "../../domain/AuthRepository";
import { AuthUser } from "../../domain/AuthUser";
import { supabase as staticClient } from "./SupabaseClient";
import { createServerSideClient } from "./SupabaseServerClient";
import { AuthMapper } from "../mappers/AuthMapper";
import { InvalidCredentialsError, UserAlreadyExistsError, AuthError } from "@/core/errors/DomainErrors";

export class SupabaseAuthRepository implements AuthRepository {
    private async getClient() {
        if (typeof window === 'undefined') {
            return await createServerSideClient();
        }
        return staticClient;
    }

    async login(email: string, password: string): Promise<AuthUser> {
        console.log("[SupabaseAuthRepository] Intentando login para", email);
        console.log("[SupabaseAuthRepository] ENV check:", {
            hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        });

        const client = await this.getClient();
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Supabase login error:", error);
            if (error.status === 400 || error.message.includes("Invalid login credentials")) {
                throw new InvalidCredentialsError();
            }
            throw new AuthError(error.message);
        }

        if (!data.user) throw new AuthError("No se pudo obtener el usuario");

        return AuthMapper.toDomain(data.user);
    }

    async register(email: string, password: string): Promise<AuthUser> {
        const client = await this.getClient();
        const { data, error } = await client.auth.signUp({
            email,
            password,
        });

        if (error) {
            if (error.message.includes("already registered")) throw new UserAlreadyExistsError();
            throw new AuthError(error.message);
        }

        if (!data.user) throw new AuthError("No se pudo registrar el usuario");

        return AuthMapper.toDomain(data.user);
    }

    async forgotPassword(email: string): Promise<void> {
        const client = await this.getClient();
        const { error } = await client.auth.resetPasswordForEmail(email);
        if (error) throw new AuthError(error.message);
    }

    async logout(): Promise<void> {
        const client = await this.getClient();
        const { error } = await client.auth.signOut();
        if (error) throw new AuthError(error.message);
    }

    async getSession(): Promise<AuthUser | null> {
        const client = await this.getClient();
        const { data, error } = await client.auth.getUser();

        if (error || !data.user) return null;

        return AuthMapper.toDomain(data.user);
    }
}

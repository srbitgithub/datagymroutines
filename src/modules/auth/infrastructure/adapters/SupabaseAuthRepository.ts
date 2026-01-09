import { AuthRepository } from "../../domain/AuthRepository";
import { AuthUser } from "../../domain/AuthUser";
import { AuthMapper } from "../mappers/AuthMapper";
import { InvalidCredentialsError, UserAlreadyExistsError, AuthError } from "@/core/errors/DomainErrors";
import { SupabaseRepository } from "@/core/infrastructure/SupabaseRepository";

export class SupabaseAuthRepository extends SupabaseRepository implements AuthRepository {

    async login(email: string, password: string): Promise<AuthUser> {
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

        if (error || !data.user) {
            console.log("[SupabaseAuthRepository] getSession: No user found", error?.message);
            return null;
        }

        return AuthMapper.toDomain(data.user);
    }
}

import { AuthRepository } from "../../domain/AuthRepository";
import { AuthUser } from "../../domain/AuthUser";
import { supabase } from "./SupabaseClient";
import { AuthMapper } from "../mappers/AuthMapper";
import { InvalidCredentialsError, UserAlreadyExistsError, AuthError } from "@/core/errors/DomainErrors";

export class SupabaseAuthRepository implements AuthRepository {
    async login(email: string, password: string): Promise<AuthUser> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.status === 400) throw new InvalidCredentialsError();
            throw new AuthError(error.message);
        }

        if (!data.user) throw new AuthError("No se pudo obtener el usuario");

        return AuthMapper.toDomain(data.user);
    }

    async register(email: string, password: string): Promise<AuthUser> {
        const { data, error } = await supabase.auth.signUp({
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
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw new AuthError(error.message);
    }

    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) throw new AuthError(error.message);
    }

    async getSession(): Promise<AuthUser | null> {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) return null;

        return AuthMapper.toDomain(data.user);
    }
}

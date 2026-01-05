'use server';

import { SupabaseAuthRepository } from "@/modules/auth/infrastructure/adapters/SupabaseAuthRepository";
import { LoginUseCase } from "@/modules/auth/application/LoginUseCase";
import { RegisterUseCase } from "@/modules/auth/application/RegisterUseCase";
import { ForgotPasswordUseCase } from "@/modules/auth/application/ForgotPasswordUseCase";
import { AuthError } from "@/core/errors/DomainErrors";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email y contraseña son requeridos" };
    }

    const authRepository = new SupabaseAuthRepository();
    const loginUseCase = new LoginUseCase(authRepository);

    try {
        await loginUseCase.execute(email, password);
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: error.message };
        }
        return { error: "Ocurrió un error inesperado" };
    }

    redirect("/dashboard");
}

export async function registerAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email y contraseña son requeridos" };
    }

    const authRepository = new SupabaseAuthRepository();
    const registerUseCase = new RegisterUseCase(authRepository);

    try {
        await registerUseCase.execute(email, password);
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: error.message };
        }
        return { error: "Ocurrió un error inesperado" };
    }
}

export async function forgotPasswordAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "El email es requerido" };
    }

    const authRepository = new SupabaseAuthRepository();
    const forgotPasswordUseCase = new ForgotPasswordUseCase(authRepository);

    try {
        await forgotPasswordUseCase.execute(email);
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: error.message };
        }
        return { error: "Ocurrió un error inesperado" };
    }
}

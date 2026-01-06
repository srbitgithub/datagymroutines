'use server';

import { SupabaseAuthRepository } from "@/modules/auth/infrastructure/adapters/SupabaseAuthRepository";
import { LoginUseCase } from "@/modules/auth/application/LoginUseCase";
import { RegisterUseCase } from "@/modules/auth/application/RegisterUseCase";
import { ForgotPasswordUseCase } from "@/modules/auth/application/ForgotPasswordUseCase";
import { GetProfileUseCase, UpdateProfileUseCase } from "@/modules/profiles/application/ProfileUseCases";
import { GetGymsUseCase, CreateGymUseCase, UpdateGymUseCase, DeleteGymUseCase } from "@/modules/gyms/application/GymUseCases";
import { SupabaseProfileRepository } from "@/modules/profiles/infrastructure/adapters/SupabaseProfileRepository";
import { SupabaseGymRepository } from "@/modules/gyms/infrastructure/adapters/SupabaseGymRepository";
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
        console.log("Login exitoso para:", email);
    } catch (error: any) {
        console.error("Error en loginAction para", email, ":", error);
        const envInfo = `(URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Y' : 'N'}, KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Y' : 'N'})`;
        if (error instanceof AuthError) {
            return { error: `${error.message} ${envInfo}` };
        }
        return { error: `Error: ${error.message || "desconocido"} ${envInfo}` };
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
        const user = await registerUseCase.execute(email, password);
        console.log("Usuario registrado con éxito en el servidor:", user.id);
        return { success: true };
    } catch (error: any) {
        console.error("Error en registerAction:", error);
        if (error instanceof AuthError) {
            return { error: error.message };
        }
        return { error: `Ocurrió un error inesperado al registrar el usuario: ${error.message || "Error desconocido"}` };
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

export async function getProfileAction() {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();

    if (!user) return null;

    const profileRepository = new SupabaseProfileRepository();
    const getProfileUseCase = new GetProfileUseCase(profileRepository);

    return getProfileUseCase.execute(user.id);
}

export async function getGymsAction() {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();

    if (!user) return [];

    const gymRepository = new SupabaseGymRepository();
    const getGymsUseCase = new GetGymsUseCase(gymRepository);

    return getGymsUseCase.execute(user.id);
}

export async function createGymAction(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isDefault = formData.get("isDefault") === "on";

    if (!name) return { error: "El nombre es requerido" };

    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const gymRepository = new SupabaseGymRepository();
    const createGymUseCase = new CreateGymUseCase(gymRepository);

    try {
        await createGymUseCase.execute({
            id: crypto.randomUUID(),
            userId: user.id,
            name,
            description,
            isDefault,
            createdAt: new Date(),
        });
        return { success: true };
    } catch (error) {
        return { error: "Error al crear el gimnasio" };
    }
}

export async function logoutAction() {
    const authRepository = new SupabaseAuthRepository();
    try {
        await authRepository.logout();
    } catch (error) {
        console.error("Error en logoutAction:", error);
    }
    redirect("/login");
}

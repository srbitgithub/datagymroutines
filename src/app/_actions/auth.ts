'use server';

import { SupabaseAuthRepository } from "@/modules/auth/infrastructure/adapters/SupabaseAuthRepository";
import { LoginUseCase } from "@/modules/auth/application/LoginUseCase";
import { RegisterUseCase } from "@/modules/auth/application/RegisterUseCase";
import { ForgotPasswordUseCase } from "@/modules/auth/application/ForgotPasswordUseCase";
import { GetProfileUseCase, UpdateProfileUseCase } from "@/modules/profiles/application/ProfileUseCases";
import { SupabaseProfileRepository } from "@/modules/profiles/infrastructure/adapters/SupabaseProfileRepository";
import { AuthError } from "@/core/errors/DomainErrors";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
        if (error instanceof AuthError) {
            return { error: error.message };
        }
        return { error: `Ocurrió un error inesperado al iniciar sesión: ${error.message || "Error desconocido"}` };
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


export async function logoutAction() {
    const authRepository = new SupabaseAuthRepository();
    try {
        await authRepository.logout();
    } catch (error) {
        console.error("Error en logoutAction:", error);
    }
    redirect("/login");
}

export async function updateMonthlyGoalAction(goal: number) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const profileRepository = new SupabaseProfileRepository();
    const updateProfileUseCase = new UpdateProfileUseCase(profileRepository);

    try {
        await updateProfileUseCase.execute(user.id, {
            monthlyGoal: goal,
            updatedAt: new Date()
        });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error al actualizar el objetivo mensual:", error);
        return { error: `Error: ${error.message}` };
    }
}

export async function updateGenderAction(gender: 'male' | 'female' | 'other') {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const profileRepository = new SupabaseProfileRepository();
    const updateProfileUseCase = new UpdateProfileUseCase(profileRepository);

    try {
        await updateProfileUseCase.execute(user.id, {
            gender: gender,
            updatedAt: new Date()
        });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error al actualizar el género:", error);
        return { error: `Error: ${error.message}` };
    }
}

export async function updateUsernameAction(username: string) {
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();
    if (!user) return { error: "No autenticado" };

    const profileRepository = new SupabaseProfileRepository();
    const updateProfileUseCase = new UpdateProfileUseCase(profileRepository);

    try {
        await updateProfileUseCase.execute(user.id, {
            username: username,
            updatedAt: new Date()
        });
        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error: any) {
        console.error("Error al actualizar el nombre de usuario:", error);
        return { error: `Error: ${error.message}` };
    }
}

export async function getUserSessionAction() {
    const authRepository = new SupabaseAuthRepository();
    return authRepository.getSession();
}

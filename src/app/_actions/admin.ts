'use server';

import { createAdminClient } from "@/modules/admin/infrastructure/adapters/SupabaseAdminClient";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Verifica si el usuario tiene una sesión de administrador válida.
 */
async function isAdminAuthenticated() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session")?.value;

    // En producción esto debería ser una clave compleja almacenada en env
    const expectedSecret = process.env.ADMIN_SECRET || "admin123";
    return adminSession === expectedSecret;
}

export async function loginAdminAction(password: string) {
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";
    const expectedSecret = process.env.ADMIN_SECRET || "admin123";

    if (password === expectedPassword) {
        const cookieStore = await cookies();
        cookieStore.set("admin_session", expectedSecret, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 // 1 día
        });
        return { success: true };
    }
    return { error: "Contraseña incorrecta" };
}

export async function logoutAdminAction() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    revalidatePath("/admin");
}

export async function getAdminStatsAction(months: number = 12) {
    if (!await isAdminAuthenticated()) {
        return { error: "No autorizado" };
    }

    const supabase = createAdminClient();
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - months);

    try {
        // 1. Usuarios registrados (Usamos auth.users via admin client)
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) throw usersError;

        // 2. Perfiles para género y metadatos
        const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("*");
        if (profilesError) throw profilesError;

        const profilesMap = new Map(profiles.map(p => [p.id, p]));

        // Filtrar usuarios por fecha
        const filteredUsers = users.users.filter(u => new Date(u.created_at) >= startDate);
        const totalUsers = users.users.length;
        const periodUsers = filteredUsers.length;

        // Desglose por género en el periodo
        const genderStats = { male: 0, female: 0, other: 0 };
        filteredUsers.forEach(u => {
            const profile = profilesMap.get(u.id);
            const gender = profile?.gender || 'other';
            if (gender === 'male') genderStats.male++;
            else if (gender === 'female') genderStats.female++;
            else genderStats.other++;
        });

        // 3. Usuarios activos este mes (al menos una sesión finalizada)
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { data: activeSessions, error: sessionsError } = await supabase
            .from("training_sessions")
            .select("user_id, end_time")
            .gte("start_time", firstDayOfMonth);

        if (sessionsError) throw sessionsError;

        const activeUserIds = new Set(activeSessions.filter(s => s.end_time).map(s => s.user_id));
        const activeUsersCount = activeUserIds.size;

        const activeGenderStats = { male: 0, female: 0, other: 0 };
        activeUserIds.forEach(id => {
            const profile = profilesMap.get(id);
            const gender = profile?.gender || 'other';
            if (gender === 'male') activeGenderStats.male++;
            else if (gender === 'female') activeGenderStats.female++;
            else activeGenderStats.other++;
        });

        // 4. Rutinas y Ejercicios este mes
        const { data: recentRoutines, error: routinesError } = await supabase
            .from("routines")
            .select("user_id")
            .gte("created_at", firstDayOfMonth);

        const { data: recentExercises, error: exercisesError } = await supabase
            .from("exercises")
            .select("user_id")
            .gte("created_at", firstDayOfMonth);

        if (routinesError) throw routinesError;
        if (exercisesError) throw exercisesError;

        const routinesGenderStats = { male: 0, female: 0, other: 0 };
        recentRoutines?.forEach(r => {
            const profile = profilesMap.get(r.user_id);
            const gender = profile?.gender || 'other';
            if (gender === 'male') routinesGenderStats.male++;
            else if (gender === 'female') routinesGenderStats.female++;
            else routinesGenderStats.other++;
        });

        const exercisesGenderStats = { male: 0, female: 0, other: 0 };
        recentExercises?.forEach(e => {
            const profile = profilesMap.get(e.user_id);
            const gender = profile?.gender || 'other';
            if (gender === 'male') exercisesGenderStats.male++;
            else if (gender === 'female') exercisesGenderStats.female++;
            else exercisesGenderStats.other++;
        });

        // 5. Métricas de Valor (Ejercicios Populares y Carga Total)
        const { data: sets, error: setsError } = await supabase
            .from("exercise_sets")
            .select("weight, reps, exercise_id")
            .gte("created_at", startDate.toISOString());

        let totalTonnage = 0;
        const exerciseFrequency: { [key: string]: number } = {};

        sets?.forEach(set => {
            totalTonnage += (set.weight * set.reps);
            exerciseFrequency[set.exercise_id] = (exerciseFrequency[set.exercise_id] || 0) + 1;
        });

        // Obtener nombres de los ejercicios top
        const topExerciseIds = Object.entries(exerciseFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const { data: exerciseNames } = await supabase
            .from("exercises")
            .select("id, name")
            .in("id", topExerciseIds.map(t => t[0]));

        const topExercises = topExerciseIds.map(t => {
            const name = exerciseNames?.find(e => e.id === t[0])?.name || "Desconocido";
            return { name, count: t[1] };
        });

        return {
            success: true,
            data: {
                totalUsers,
                periodUsers,
                genderStats,
                activeUsersCount,
                activeGenderStats,
                routinesCount: recentRoutines?.length || 0,
                routinesGenderStats,
                exercisesCount: recentExercises?.length || 0,
                exercisesGenderStats,
                totalTonnage: Math.round(totalTonnage),
                topExercises,
                lastUpdate: new Date().toISOString()
            }
        };

    } catch (error: any) {
        console.error("Error en getAdminStatsAction:", error);
        return { error: error.message || "Error al obtener estadísticas" };
    }
}

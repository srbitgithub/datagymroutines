export const dynamic = "force-dynamic";

import { getRoutinesAction, getProgressionDataAction } from "@/app/_actions/training";
import { ListChecks, Plus, History, Check, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from 'next/cache';
import { SupabaseAuthRepository } from "@/modules/auth/infrastructure/adapters/SupabaseAuthRepository";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    noStore();
    const { error } = await searchParams;
    const headerList = await headers();
    const userTimezone = headerList.get('x-timezone') || 'Europe/Madrid';

    const authRepo = new SupabaseAuthRepository();
    const user = await authRepo.getSession();

    const routines = await getRoutinesAction();
    const { items: progressionItems, debug } = await getProgressionDataAction(undefined, userTimezone);

    // Weekly Tracker Logic (User's 10-step plan + Robust TZ handling)
    const tz = userTimezone;
    const now = new Date();

    // 1. "Bend" the date to the user's local values as if they were server-local
    // This is the most robust way to do day arithmetic without TZ shifts.
    const localNow = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const year = localNow.getFullYear();
    const month = localNow.getMonth();
    const day = localNow.getDate();

    // Safe day of week detection
    const dayName = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(now);
    const dayMap: Record<string, number> = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
    const todayNum = dayMap[dayName] ?? 1;

    // 4. Days until start (Monday)
    const diffToMonday = todayNum - 1;

    // 5. Calculate start of the week (Monday)
    const mondayLocal = new Date(year, month, day);
    mondayLocal.setDate(mondayLocal.getDate() - diffToMonday);

    // 6. Calculate end of the week (Sunday)
    const sundayLocal = new Date(mondayLocal);
    sundayLocal.setDate(mondayLocal.getDate() + 6);

    // Stable formatter for YYYY-MM-DD comparisons
    const fmt = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dp = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dp}`;
    };

    const todayStr = fmt(localNow);
    const mondayStr = fmt(mondayLocal);
    const sundayStr = fmt(sundayLocal);
    const trainingDates = new Set(progressionItems.map(p => p.date));

    // Debug Logs
    console.log("\x1b[42m\x1b[30m%s\x1b[0m", "====================================================");
    console.log("\x1b[42m\x1b[30m%s\x1b[0m", ">>> SERVER RENDER: DASHBOARD PAGE <<<");
    console.log("Timezone detectada:", tz);
    console.log("X-Timezone Header:", headerList.get('x-timezone'));
    console.log("Vercel-TZ Header:", headerList.get('x-vercel-ip-timezone'));
    console.log("Hoy (local format):", todayStr);
    console.log("Inicio de semana (Lunes):", mondayStr);
    console.log("Fin de semana (Domingo):", sundayStr);
    console.log("Fechas entrenadas encontradas en la DB:", Array.from(trainingDates));
    console.log("¿Hay entrenamiento hoy?", trainingDates.has(todayStr) ? "SÍ (Verde) ✅" : "NO (Gris/Rojo) ❌");
    console.log("\x1b[42m\x1b[30m%s\x1b[0m", "====================================================");

    const dayAbbreviations = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

    const weekProgress = dayAbbreviations.map((label, index) => {
        const d = new Date(mondayLocal);
        d.setDate(mondayLocal.getDate() + index);
        const dateStr = fmt(d);

        const isTrained = trainingDates.has(dateStr);
        const isPast = index < (todayNum - 1);
        const isToday = index === (todayNum - 1);

        let statusColor = "bg-zinc-800 text-zinc-500"; // Step 10: Future gray (also Today not yet trained)

        if (isTrained) {
            statusColor = "bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]"; // Step 8: Green if trained
        } else if (isPast) {
            statusColor = "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]"; // Step 9: Red if past and not trained
        }

        return { label, statusColor, isTrained };
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Panel de Depuración Visual */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-[11px] font-mono shadow-inner space-y-1">
                <div className="flex items-center gap-2 text-blue-800 font-bold mb-1">
                    <AlertTriangle className="h-3 w-3" />
                    Soporte Técnico: Diagnóstico de Datos
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <div><span className="text-zinc-500">Sesión Usuario (UID):</span> <span className="text-blue-700 font-bold">{user?.id || 'NO DETECTADO'}</span></div>
                    <div><span className="text-zinc-500">País/Zona (TZ):</span> <span className="text-blue-700 font-bold">{tz}</span></div>
                    <div><span className="text-zinc-500">Fecha Hoy:</span> <span className="text-blue-700 font-bold">{todayStr}</span></div>
                    <div><span className="text-zinc-500">Inicio Semana:</span> <span className="text-blue-700 font-bold">{mondayStr}</span></div>
                    <div><span className="text-zinc-500">Días Registrados:</span> <span className="text-blue-700 font-bold">[{Array.from(trainingDates).join(', ') || 'VACÍO'}]</span></div>
                    <div><span className="text-zinc-500">Sesiones (User/Global):</span> <span className="text-blue-700 font-bold">{debug?.returnedCount || 0} / {debug?.globalCount || 0}</span></div>
                    <div><span className="text-zinc-500">¿Sesión hoy detectada?:</span> <span className={`${trainingDates.has(todayStr) ? 'text-green-600' : 'text-red-600'} font-bold`}>{trainingDates.has(todayStr) ? 'SÍ' : 'NO'}</span></div>
                </div>
                <div className="mt-2 text-[10px] text-zinc-400 italic">
                    * Si 'Días Registrados' está VACÍO pero tienes datos en Supabase, revisa las políticas RLS.
                </div>
            </div>
            {error && (
                <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 text-red-600" />
                        <div>
                            <h3 className="font-bold text-red-900">No se pudo iniciar la sesión</h3>
                            <p className="text-sm text-red-700">{decodeURIComponent(error)}</p>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">DataGym</h1>
                    <p className="text-muted-foreground">Tu cuaderno de fuerza inteligente.</p>
                </div>
            </header>

            <div className="grid gap-8">
                <div className="space-y-8">
                    {/* Weekly Tracker */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <History className="h-5 w-5 text-brand-primary" />
                            Actividad Semanal
                        </h2>
                        <div className="bg-card border rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center gap-2">
                                {weekProgress.map((day, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase">{day.label}</span>
                                        <div className={`w-full aspect-square max-w-[48px] rounded-xl flex items-center justify-center transition-all shadow-inner ${day.statusColor}`}>
                                            {day.isTrained && <Check className="h-5 w-5" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Mis Rutinas */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">Mis Rutinas</h2>
                            <Link href="/dashboard/routines" className="text-xs font-bold uppercase tracking-widest text-brand-primary hover:underline">
                                Ver todas
                            </Link>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {routines.slice(0, 4).map((routine) => (
                                <Link
                                    key={routine.id}
                                    href={`/dashboard/session?routineId=${routine.id}`}
                                    className="group rounded-xl border bg-card p-5 hover:border-brand-primary/50 transition-all hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="rounded-full bg-brand-primary/5 p-2 group-hover:bg-brand-primary/10">
                                            <ListChecks className="h-4 w-4 text-brand-primary" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold">{routine.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{routine.exercises.length} ejercicios</p>
                                </Link>
                            ))}
                            <Link
                                href="/dashboard/routines/new"
                                className="flex flex-col items-center justify-center rounded-xl border border-dashed p-5 text-muted-foreground hover:text-brand-primary hover:border-brand-primary transition-all"
                            >
                                <Plus className="h-6 w-6 mb-2" />
                                <span className="text-sm font-medium">Nueva Rutina</span>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

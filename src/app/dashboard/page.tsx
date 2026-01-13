export const dynamic = "force-dynamic";

import { getRoutinesAction, getProgressionDataAction } from "@/app/_actions/training";
import { getProfileAction } from "@/app/_actions/auth";
import { ListChecks, Plus, History, Check } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from 'next/cache';
import { SupabaseAuthRepository } from "@/modules/auth/infrastructure/adapters/SupabaseAuthRepository";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    noStore();
    const { error } = await searchParams;
    const headerList = await headers();
    const userTimezone = headerList.get('x-timezone') || 'Europe/Madrid';

    const routines = await getRoutinesAction();
    const { items: progressionItems } = await getProgressionDataAction(undefined, userTimezone);
    const profile = await getProfileAction();
    const monthlyGoal = profile?.monthlyGoal || 20;

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

    // Stable formatter for YYYY-MM-DD comparisons
    const fmt = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dp = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dp}`;
    };

    const trainingDates = new Set(progressionItems.map(p => p.date));

    // Monthly Tracker Logic
    const currentMonth = localNow.getMonth();
    const currentYear = localNow.getFullYear();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const currentMonthName = monthNames[currentMonth];

    const daysTrainedThisMonth = Array.from(trainingDates).filter(dateStr => {
        const [y, m] = dateStr.split('-').map(Number);
        return y === currentYear && m === (currentMonth + 1);
    }).length;

    const dayAbbreviations = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

    const weekProgress = dayAbbreviations.map((label, index) => {
        const d = new Date(mondayLocal);
        d.setDate(mondayLocal.getDate() + index);
        const dateStr = fmt(d);

        const isTrained = trainingDates.has(dateStr);
        const isPast = index < (todayNum - 1);
        // const isToday = index === (todayNum - 1); // Not used

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
                    {/* Activity Trackers */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Weekly Tracker */}
                        <section className="space-y-4 md:col-span-2">
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

                        {/* Monthly Summary */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <ListChecks className="h-5 w-5 text-brand-secondary" />
                                Resumen {currentMonthName}
                            </h2>
                            <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <History className="h-24 w-24 -mr-8 -mt-8" />
                                </div>
                                <div className="relative">
                                    <span className="text-5xl font-black text-brand-primary">{daysTrainedThisMonth}</span>
                                    <p className="text-sm font-bold text-brand-primary/60 uppercase tracking-widest mt-1">Días Entrenados</p>
                                </div>
                                <div className="mt-4 w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-primary transition-all duration-1000"
                                        style={{ width: `${Math.min((daysTrainedThisMonth / monthlyGoal) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">Basado en objetivo de {monthlyGoal} días/mes</p>
                            </div>
                        </section>
                    </div>

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
